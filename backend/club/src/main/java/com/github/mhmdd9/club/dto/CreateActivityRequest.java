package com.github.mhmdd9.club.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateActivityRequest {

    @NotBlank(message = "Activity name is required")
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Default capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer defaultCapacity;

    private String intensityLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    private String activityType; // CLASS, OPEN_GYM (defaults to CLASS if not provided)
}
