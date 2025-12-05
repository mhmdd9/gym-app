package com.github.mhmdd9.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {
    
    @NotNull(message = "شناسه کاربر الزامی است")
    private Long userId;
    
    @NotNull(message = "شناسه اشتراک الزامی است")
    private Long membershipId;
    
    @NotNull(message = "شناسه باشگاه الزامی است")
    private Long clubId;
    
    private Long sessionId;
    
    private String notes;
}
