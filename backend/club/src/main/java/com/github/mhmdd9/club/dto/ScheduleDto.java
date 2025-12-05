package com.github.mhmdd9.club.dto;

import com.github.mhmdd9.club.entity.Schedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDto {
    private Long id;
    private Long clubId;
    private String clubName;
    private Long activityId;
    private String activityName;
    private String activityType;
    private Long trainerId;
    private String trainerName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Set<String> daysOfWeek;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private Integer capacity;
    private Boolean isActive;
    private String notes;

    public static ScheduleDto from(Schedule schedule) {
        return ScheduleDto.builder()
                .id(schedule.getId())
                .clubId(schedule.getClub() != null ? schedule.getClub().getId() : null)
                .clubName(schedule.getClub() != null ? schedule.getClub().getName() : null)
                .activityId(schedule.getActivity() != null ? schedule.getActivity().getId() : null)
                .activityName(schedule.getActivity() != null ? schedule.getActivity().getName() : null)
                .activityType(schedule.getActivity() != null && schedule.getActivity().getActivityType() != null 
                        ? schedule.getActivity().getActivityType().name() : "CLASS")
                .trainerId(schedule.getTrainer() != null ? schedule.getTrainer().getId() : null)
                .trainerName(schedule.getTrainer() != null ? schedule.getTrainer().getFullName() : null)
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .daysOfWeek(schedule.getDaysOfWeek() != null 
                        ? schedule.getDaysOfWeek().stream().map(DayOfWeek::name).collect(Collectors.toSet()) 
                        : Set.of())
                .validFrom(schedule.getValidFrom())
                .validUntil(schedule.getValidUntil())
                .capacity(schedule.getCapacity())
                .isActive(schedule.getIsActive())
                .notes(schedule.getNotes())
                .build();
    }
}
