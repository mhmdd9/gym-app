package com.github.mhmdd9.booking.entity;

import com.github.mhmdd9.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_memberships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMembership extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum MembershipStatus {
        PENDING,    // User requested, waiting for payment
        ACTIVE,     // Payment confirmed, membership active
        EXPIRED,    // Time/sessions ran out
        SUSPENDED,  // Temporarily suspended
        CANCELLED   // Cancelled by user or admin
    }

    public boolean isValid() {
        if (status != MembershipStatus.ACTIVE) {
            return false;
        }
        LocalDate today = LocalDate.now();
        if (endDate != null && today.isAfter(endDate)) {
            return false;
        }
        return true;
    }
}
