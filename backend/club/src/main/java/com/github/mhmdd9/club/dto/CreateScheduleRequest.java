package com.github.mhmdd9.club.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleRequest {

    @NotNull(message = "Activity ID is required")
    private Long activityId;

    private Long trainerId;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotEmpty(message = "At least one day of week is required")
    private Set<String> daysOfWeek; // MONDAY, TUESDAY, etc.

    @NotNull(message = "Valid from date is required")
    private LocalDate validFrom;

    private LocalDate validUntil;

    private Integer capacity;

    private String notes;
}
