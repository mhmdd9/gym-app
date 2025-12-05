package com.github.mhmdd9.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryDto {
    private Long id;
    private Long reservationId;
    private Long membershipId;
    private Long userId;
    private String userFullName;
    private String userPhone;
    private Long clubId;
    private BigDecimal amount;
    private String currency;
    private String method;
    private String referenceNumber;
    private String status;
    private LocalDateTime paidAt;
    private Long recordedBy;
    private String recordedByName;
    private String notes;
    
    // Type of payment: RESERVATION or MEMBERSHIP
    private String paymentType;
    // For reservation payments
    private String activityName;
    // For membership payments
    private String planName;
}

