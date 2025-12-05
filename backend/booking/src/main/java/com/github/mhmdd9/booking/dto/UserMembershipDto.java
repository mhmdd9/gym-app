package com.github.mhmdd9.booking.dto;

import com.github.mhmdd9.booking.entity.UserMembership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMembershipDto {
    private Long id;
    private Long userId;
    private Long planId;
    private Long clubId;
    private LocalDate startDate;
    private LocalDate endDate;
    private UserMembership.MembershipStatus status;
    private Long paymentId;
    private String notes;
    
    // Enriched fields (populated by service when needed)
    private String planName;
    private String clubName;
    private String userName;
    private String userPhone;
}
