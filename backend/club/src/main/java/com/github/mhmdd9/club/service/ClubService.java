package com.github.mhmdd9.club.service;

import com.github.mhmdd9.club.dto.ClubDto;
import com.github.mhmdd9.club.dto.CreateClubRequest;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.common.dto.PageResponse;
import com.github.mhmdd9.common.exception.ForbiddenException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;

    @Transactional(readOnly = true)
    public PageResponse<ClubDto> getAllClubs(Pageable pageable) {
        Page<Club> clubs = clubRepository.findByIsActiveTrue(pageable);
        return PageResponse.from(clubs, clubs.getContent().stream()
                .map(ClubDto::from)
                .toList());
    }

    @Transactional(readOnly = true)
    public ClubDto getClubById(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
        return ClubDto.from(club);
    }

    @Transactional(readOnly = true)
    public List<ClubDto> getClubsByOwner(Long ownerId) {
        return clubRepository.findByOwnerId(ownerId).stream()
                .map(ClubDto::from)
                .toList();
    }

    @Transactional
    public ClubDto createClub(CreateClubRequest request, Long ownerId) {
        Club club = Club.builder()
                .ownerId(ownerId)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .isActive(true)
                .build();

        club = clubRepository.save(club);
        return ClubDto.from(club);
    }

    @Transactional
    public ClubDto updateClub(Long id, CreateClubRequest request, Long userId, boolean isAdmin) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));

        // Check ownership unless admin
        if (!isAdmin && !club.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to update this club");
        }

        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setAddress(request.getAddress());
        club.setCity(request.getCity());
        club.setPhoneNumber(request.getPhoneNumber());
        club.setEmail(request.getEmail());
        club.setLatitude(request.getLatitude());
        club.setLongitude(request.getLongitude());
        club.setOpeningTime(request.getOpeningTime());
        club.setClosingTime(request.getClosingTime());

        club = clubRepository.save(club);
        return ClubDto.from(club);
    }

    @Transactional
    public void deleteClub(Long id, Long userId, boolean isAdmin) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));

        // Check ownership unless admin
        if (!isAdmin && !club.getOwnerId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to delete this club");
        }

        // Soft delete
        club.setIsActive(false);
        clubRepository.save(club);
    }

    @Transactional(readOnly = true)
    public boolean isClubOwnerOrStaff(Long clubId, Long userId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null) return false;
        return club.getOwnerId().equals(userId);
        // TODO: Also check club_staff table for managers/receptionists
    }
}

