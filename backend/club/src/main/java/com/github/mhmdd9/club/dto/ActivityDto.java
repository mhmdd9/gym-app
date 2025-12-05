package com.github.mhmdd9.club.dto;

import com.github.mhmdd9.club.entity.ActivityDefinition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private Long id;
    private Long clubId;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Integer defaultCapacity;
    private String intensityLevel;
    private String category;
    private Boolean isActive;
    private String activityType;

    public static ActivityDto from(ActivityDefinition activity) {
        return ActivityDto.builder()
                .id(activity.getId())
                .clubId(activity.getClub() != null ? activity.getClub().getId() : null)
                .name(activity.getName())
                .description(activity.getDescription())
                .durationMinutes(activity.getDurationMinutes())
                .defaultCapacity(activity.getDefaultCapacity())
                .intensityLevel(activity.getIntensityLevel() != null ? activity.getIntensityLevel().name() : null)
                .category(activity.getCategory())
                .isActive(activity.getIsActive())
                .activityType(activity.getActivityType() != null ? activity.getActivityType().name() : "CLASS")
                .build();
    }
}
