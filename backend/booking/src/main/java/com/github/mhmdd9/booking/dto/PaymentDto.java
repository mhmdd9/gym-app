package com.github.mhmdd9.booking.dto;

import com.github.mhmdd9.booking.entity.Payment;
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
public class PaymentDto {
    private Long id;
    private Long reservationId;
    private Long userId;
    private Long clubId;
    private BigDecimal amount;
    private String currency;
    private String method;
    private String referenceNumber;
    private String status;
    private LocalDateTime paidAt;
    private Long recordedBy;
    private String notes;

    public static PaymentDto from(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .reservationId(payment.getReservationId())
                .userId(payment.getUserId())
                .clubId(payment.getClubId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod().name())
                .referenceNumber(payment.getReferenceNumber())
                .status(payment.getStatus().name())
                .paidAt(payment.getPaidAt())
                .recordedBy(payment.getRecordedBy())
                .notes(payment.getNotes())
                .build();
    }
}

