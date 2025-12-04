package com.github.mhmdd9.auth.service;

import com.github.mhmdd9.auth.dto.*;
import com.github.mhmdd9.auth.entity.OtpCode;
import com.github.mhmdd9.auth.entity.RefreshToken;
import com.github.mhmdd9.auth.entity.Role;
import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.RefreshTokenRepository;
import com.github.mhmdd9.auth.repository.RoleRepository;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.auth.security.JwtTokenProvider;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import com.github.mhmdd9.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public OtpResponse signup(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(
                    "User with this phone number already exists", 
                    "USER_EXISTS"
            );
        }

        // Get default role
        Role memberRole = roleRepository.findByName(Role.MEMBER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", Role.MEMBER));

        // Create new user
        User user = User.builder()
                .phoneNumber(request.getPhoneNumber())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isActive(true)
                .isVerified(false)
                .build();
        user.addRole(memberRole);
        
        userRepository.save(user);
        log.info("New user registered: {}", request.getPhoneNumber());

        // Generate and send OTP
        otpService.generateOtp(request.getPhoneNumber());

        return OtpResponse.sent(request.getPhoneNumber(), otpService.getOtpExpiration());
    }

    @Transactional
    public OtpResponse login(LoginRequest request) {
        // Check if user exists
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "phone number", request.getPhoneNumber()));

        if (!user.getIsActive()) {
            throw new BusinessException("User account is deactivated", "USER_INACTIVE");
        }

        // Generate and send OTP
        otpService.generateOtp(request.getPhoneNumber());

        return OtpResponse.sent(request.getPhoneNumber(), otpService.getOtpExpiration());
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        // Verify OTP
        otpService.verifyOtp(request.getPhoneNumber(), request.getCode());

        // Get user
        User user = userRepository.findByPhoneNumberWithRoles(request.getPhoneNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "phone number", request.getPhoneNumber()));

        // Mark user as verified if not already
        if (!user.getIsVerified()) {
            user.setIsVerified(true);
        }
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtTokenProvider.getRefreshExpiration() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        log.info("User logged in: {}", request.getPhoneNumber());

        return AuthResponse.of(
                accessToken,
                refreshTokenStr,
                jwtTokenProvider.getJwtExpiration() / 1000,
                UserDto.from(user)
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        if (!user.getIsActive()) {
            throw new BusinessException("User account is deactivated", "USER_INACTIVE");
        }

        // Revoke old refresh token
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);

        // Generate new tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        // Save new refresh token
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtTokenProvider.getRefreshExpiration() / 1000))
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.of(
                accessToken,
                newRefreshTokenStr,
                jwtTokenProvider.getJwtExpiration() / 1000,
                UserDto.from(user)
        );
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        refreshTokenRepository.revokeAllByUser(user);
        log.info("User logged out: {}", user.getPhoneNumber());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }
}

