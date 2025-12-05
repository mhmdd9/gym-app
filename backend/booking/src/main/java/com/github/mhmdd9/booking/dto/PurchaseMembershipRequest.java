package com.github.mhmdd9.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseMembershipRequest {
    
    @NotNull(message = "شناسه پلن الزامی است")
    private Long planId;
    
    @NotNull(message = "شناسه باشگاه الزامی است")
    private Long clubId;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private Long paymentId;
    
    private String notes;
}
