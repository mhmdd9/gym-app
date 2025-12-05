package com.github.mhmdd9.club.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMembershipPlanRequest {
    
    private Long activityId;
    
    @NotBlank(message = "نام اشتراک الزامی است")
    private String name;
    
    private String description;
    
    @NotNull(message = "مدت اعتبار الزامی است")
    @Positive(message = "مدت اعتبار باید مثبت باشد")
    private Integer durationDays;
    
    @NotNull(message = "قیمت الزامی است")
    @Positive(message = "قیمت باید مثبت باشد")
    private BigDecimal price;
}
