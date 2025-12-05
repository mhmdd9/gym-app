package com.github.mhmdd9.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingPaymentDto {
    private Long reservationId;
    private Long userId;
    private String userPhoneNumber;
    private String userFullName;
    private Long sessionId;
    private String activityName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String trainerName;
    private LocalDateTime bookedAt;
    private Long clubId;
    private String clubName;
}
