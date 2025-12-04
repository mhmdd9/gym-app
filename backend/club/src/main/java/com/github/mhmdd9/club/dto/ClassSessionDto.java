package com.github.mhmdd9.club.dto;

import com.github.mhmdd9.club.entity.ClassSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSessionDto {
    private Long id;
    private Long activityId;
    private String activityName;
    private Long trainerId;
    private String trainerName;
    private Long clubId;
    private String clubName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer bookedCount;
    private Integer availableSpots;
    private String status;

    public static ClassSessionDto from(ClassSession session) {
        return ClassSessionDto.builder()
                .id(session.getId())
                .activityId(session.getActivity() != null ? session.getActivity().getId() : null)
                .activityName(session.getActivity() != null ? session.getActivity().getName() : null)
                .trainerId(session.getTrainer() != null ? session.getTrainer().getId() : null)
                .trainerName(session.getTrainer() != null ? session.getTrainer().getFullName() : null)
                .clubId(session.getClub() != null ? session.getClub().getId() : null)
                .clubName(session.getClub() != null ? session.getClub().getName() : null)
                .sessionDate(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .capacity(session.getCapacity())
                .bookedCount(session.getBookedCount())
                .availableSpots(session.getAvailableSpots())
                .status(session.getStatus().name())
                .build();
    }
}

