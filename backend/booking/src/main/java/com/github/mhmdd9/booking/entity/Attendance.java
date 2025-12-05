package com.github.mhmdd9.booking.entity;

import com.github.mhmdd9.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "recorded_by_user_id")
    private Long recordedByUserId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
