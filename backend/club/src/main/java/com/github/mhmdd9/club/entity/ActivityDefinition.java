package com.github.mhmdd9.club.entity;

import com.github.mhmdd9.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(name = "default_capacity", nullable = false)
    @Builder.Default
    private Integer defaultCapacity = 20;

    @Enumerated(EnumType.STRING)
    @Column(name = "intensity_level", length = 20)
    private IntensityLevel intensityLevel;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 20)
    @Builder.Default
    private ActivityType activityType = ActivityType.CLASS;

    public enum IntensityLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED
    }

    public enum ActivityType {
        CLASS,      // Fixed time class with specific start/end
        OPEN_GYM    // Flexible entry - users can come anytime during session hours
    }
}

