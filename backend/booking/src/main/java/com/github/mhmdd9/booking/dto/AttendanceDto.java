package com.github.mhmdd9.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;
    private Long userId;
    private Long membershipId;
    private Long clubId;
    private Long sessionId;
    private LocalDateTime checkInTime;
    private Long recordedByUserId;
    private String notes;
    
    // Enriched fields
    private String userName;
    private String userPhone;
    private String planName;
    private String sessionName;
}
