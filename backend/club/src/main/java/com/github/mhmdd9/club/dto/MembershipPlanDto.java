package com.github.mhmdd9.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanDto {
    private Long id;
    private Long clubId;
    private Long activityId;
    private String activityName;
    private String name;
    private String description;
    private Integer durationDays;
    private BigDecimal price;
    private Boolean isActive;
}
