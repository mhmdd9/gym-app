package com.github.mhmdd9.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpResponse {

    private String phoneNumber;
    private Integer expiresInSeconds;
    private String message;

    public static OtpResponse sent(String phoneNumber, int expiresInSeconds) {
        return OtpResponse.builder()
                .phoneNumber(phoneNumber)
                .expiresInSeconds(expiresInSeconds)
                .message("OTP sent successfully")
                .build();
    }
}

