package com.github.mhmdd9.auth.controller;

import com.github.mhmdd9.auth.dto.*;
import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.auth.service.AuthService;
import com.github.mhmdd9.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<OtpResponse>> signup(@Valid @RequestBody SignupRequest request) {
        OtpResponse response = authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered. OTP sent for verification."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<OtpResponse>> login(@Valid @RequestBody LoginRequest request) {
        OtpResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "OTP sent for verification."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.logout(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        // This would need a method in AuthService to get user by ID
        // For now, we'll keep it simple
        return ResponseEntity.ok(ApiResponse.success(
                UserDto.builder()
                        .id(principal.getId())
                        .phoneNumber(principal.getPhoneNumber())
                        .build()
        ));
    }
}

