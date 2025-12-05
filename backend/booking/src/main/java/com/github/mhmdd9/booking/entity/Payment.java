package com.github.mhmdd9.booking.entity;

import com.github.mhmdd9.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "membership_id")
    private Long membershipId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "IRR";

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 30)
    private PaymentMethod method;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "recorded_by")
    private Long recordedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum PaymentMethod {
        CASH,
        CARD,
        POS,
        BANK_TRANSFER
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        REFUNDED,
        FAILED
    }
}

