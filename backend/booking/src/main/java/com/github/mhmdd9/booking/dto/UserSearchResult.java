package com.github.mhmdd9.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResult {
    private Long id;
    private String phoneNumber;
    private String fullName;
}

