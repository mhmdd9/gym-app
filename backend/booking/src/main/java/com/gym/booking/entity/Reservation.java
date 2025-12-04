package com.gym.booking.entity;

import com.gym.common.entity.VersionedEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation extends VersionedEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(name = "booked_at", nullable = false)
    @Builder.Default
    private LocalDateTime bookedAt = LocalDateTime.now();

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    public enum ReservationStatus {
        PENDING_PAYMENT,
        PAID,
        CANCELLED,
        NO_SHOW,
        COMPLETED
    }

    public boolean canCancel() {
        return status == ReservationStatus.PENDING_PAYMENT || 
               status == ReservationStatus.PAID;
    }

    public boolean canCheckIn() {
        return status == ReservationStatus.PAID && checkedInAt == null;
    }
}

