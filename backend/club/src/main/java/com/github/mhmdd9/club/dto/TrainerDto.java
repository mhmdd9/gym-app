package com.github.mhmdd9.club.dto;

import com.github.mhmdd9.club.entity.Trainer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDto {
    private Long id;
    private Long clubId;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String specialization;
    private String bio;

    public static TrainerDto from(Trainer trainer) {
        return TrainerDto.builder()
                .id(trainer.getId())
                .clubId(trainer.getClub() != null ? trainer.getClub().getId() : null)
                .userId(trainer.getUserId())
                .firstName(trainer.getFirstName())
                .lastName(trainer.getLastName())
                .fullName(trainer.getFullName())
                .phoneNumber(trainer.getPhoneNumber())
                .specialization(trainer.getSpecialization())
                .bio(trainer.getBio())
                .build();
    }
}
