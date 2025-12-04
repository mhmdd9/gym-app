package com.github.mhmdd9.club.dto;

import com.github.mhmdd9.club.entity.Club;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubDto {
    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String address;
    private String city;
    private String phoneNumber;
    private String email;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isActive;
    private LocalTime openingTime;
    private LocalTime closingTime;

    public static ClubDto from(Club club) {
        return ClubDto.builder()
                .id(club.getId())
                .ownerId(club.getOwnerId())
                .name(club.getName())
                .description(club.getDescription())
                .address(club.getAddress())
                .city(club.getCity())
                .phoneNumber(club.getPhoneNumber())
                .email(club.getEmail())
                .latitude(club.getLatitude())
                .longitude(club.getLongitude())
                .isActive(club.getIsActive())
                .openingTime(club.getOpeningTime())
                .closingTime(club.getClosingTime())
                .build();
    }
}

