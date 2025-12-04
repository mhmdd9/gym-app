package com.github.mhmdd9.booking.dto;

import com.github.mhmdd9.booking.entity.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private Long id;
    private Long userId;
    private Long sessionId;
    private Long clubId;
    private String status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime checkedInAt;

    public static ReservationDto from(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUserId())
                .sessionId(reservation.getSessionId())
                .clubId(reservation.getClubId())
                .status(reservation.getStatus().name())
                .bookedAt(reservation.getBookedAt())
                .cancelledAt(reservation.getCancelledAt())
                .cancellationReason(reservation.getCancellationReason())
                .checkedInAt(reservation.getCheckedInAt())
                .build();
    }
}

