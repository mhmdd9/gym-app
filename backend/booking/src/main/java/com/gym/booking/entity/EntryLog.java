package com.gym.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "entry_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "entry_time", nullable = false)
    @Builder.Default
    private LocalDateTime entryTime = LocalDateTime.now();

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 30)
    @Builder.Default
    private EntryType entryType = EntryType.CLASS;

    @Column(name = "recorded_by")
    private Long recordedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum EntryType {
        CLASS,
        GENERAL,
        GUEST
    }
}

