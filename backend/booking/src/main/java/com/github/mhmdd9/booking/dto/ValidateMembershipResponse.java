package com.github.mhmdd9.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateMembershipResponse {
    private boolean valid;
    private String message;
    private Long membershipId;
    private Long planId;
    private LocalDate endDate;
}
