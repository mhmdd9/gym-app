package com.github.mhmdd9.auth.service;

import com.github.mhmdd9.auth.entity.OtpCode;
import com.github.mhmdd9.auth.repository.OtpCodeRepository;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final int otpExpiration;
    private final int otpLength;
    private final int maxAttemptsPerMinute;
    private final int maxAttemptsPerHour;
    
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(
            OtpCodeRepository otpCodeRepository,
            @Value("${otp.expiration:300}") int otpExpiration,
            @Value("${otp.length:6}") int otpLength,
            @Value("${otp.rate-limit.requests-per-minute:1}") int maxAttemptsPerMinute,
            @Value("${otp.rate-limit.requests-per-hour:5}") int maxAttemptsPerHour) {
        this.otpCodeRepository = otpCodeRepository;
        this.otpExpiration = otpExpiration;
        this.otpLength = otpLength;
        this.maxAttemptsPerMinute = maxAttemptsPerMinute;
        this.maxAttemptsPerHour = maxAttemptsPerHour;
    }

    @Transactional
    public OtpCode generateOtp(String phoneNumber) {
        // Rate limiting check
        Bucket bucket = buckets.computeIfAbsent(phoneNumber, this::createBucket);
        if (!bucket.tryConsume(1)) {
            throw new RateLimitExceededException(
                    "Too many OTP requests. Please wait before requesting another code.");
        }

        // Additional hourly limit check from database
        long hourlyCount = otpCodeRepository.countByPhoneNumberSince(
                phoneNumber, 
                LocalDateTime.now().minusHours(1)
        );
        if (hourlyCount >= maxAttemptsPerHour) {
            throw new RateLimitExceededException(
                    "Hourly OTP limit exceeded. Please try again later.");
        }

        // Generate OTP code
        String code = generateRandomCode();
        
        OtpCode otpCode = OtpCode.builder()
                .phoneNumber(phoneNumber)
                .code(code)
                .expiresAt(LocalDateTime.now().plusSeconds(otpExpiration))
                .build();

        otpCode = otpCodeRepository.save(otpCode);

        // TODO: Send OTP via SMS service (Twilio/Payamak)
        log.info("OTP generated for {}: {} (expires in {} seconds)", 
                phoneNumber, code, otpExpiration);

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(String phoneNumber, String code) {
        Optional<OtpCode> otpOptional = otpCodeRepository.findLatestValidOtp(
                phoneNumber, 
                LocalDateTime.now()
        );

        if (otpOptional.isEmpty()) {
            throw new BusinessException("Invalid or expired OTP", "INVALID_OTP");
        }

        OtpCode otpCode = otpOptional.get();
        
        // Check max verification attempts
        if (otpCode.getAttempts() >= 3) {
            otpCode.setIsUsed(true);
            otpCodeRepository.save(otpCode);
            throw new BusinessException(
                    "Too many failed attempts. Please request a new OTP.", 
                    "OTP_MAX_ATTEMPTS"
            );
        }

        if (!otpCode.getCode().equals(code)) {
            otpCode.incrementAttempts();
            otpCodeRepository.save(otpCode);
            throw new BusinessException("Invalid OTP code", "INVALID_OTP");
        }

        // Mark OTP as used
        otpCode.setIsUsed(true);
        otpCodeRepository.save(otpCode);

        return true;
    }

    public int getOtpExpiration() {
        return otpExpiration;
    }

    private String generateRandomCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            code.append(secureRandom.nextInt(10));
        }
        return code.toString();
    }

    private Bucket createBucket(String phoneNumber) {
        Bandwidth limit = Bandwidth.classic(
                maxAttemptsPerMinute, 
                Refill.intervally(maxAttemptsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}

