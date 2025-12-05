package com.github.mhmdd9.club.controller;

import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.club.dto.ActivityDto;
import com.github.mhmdd9.club.dto.ClubDto;
import com.github.mhmdd9.club.dto.CreateActivityRequest;
import com.github.mhmdd9.club.dto.CreateClubRequest;
import com.github.mhmdd9.club.dto.TrainerDto;
import com.github.mhmdd9.club.repository.ActivityDefinitionRepository;
import com.github.mhmdd9.club.repository.TrainerRepository;
import com.github.mhmdd9.club.service.ActivityService;
import com.github.mhmdd9.club.service.ClubService;
import com.github.mhmdd9.common.dto.ApiResponse;
import com.github.mhmdd9.common.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;
    private final ActivityService activityService;
    private final ActivityDefinitionRepository activityRepository;
    private final TrainerRepository trainerRepository;

    /**
     * Get all active clubs (public).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ClubDto>>> getAllClubs(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<ClubDto> clubs = clubService.getAllClubs(pageable);
        return ResponseEntity.ok(ApiResponse.success(clubs));
    }

    /**
     * Get club by ID (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubDto>> getClubById(@PathVariable Long id) {
        ClubDto club = clubService.getClubById(id);
        return ResponseEntity.ok(ApiResponse.success(club));
    }

    /**
     * Get my owned clubs (for gym owners).
     */
    @GetMapping("/my-clubs")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<ClubDto>>> getMyClubs(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ClubDto> clubs = clubService.getClubsByOwner(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(clubs));
    }

    /**
     * Create a new club (admin or gym owner only).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER')")
    public ResponseEntity<ApiResponse<ClubDto>> createClub(
            @Valid @RequestBody CreateClubRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ClubDto club = clubService.createClub(request, principal.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(club, "Club created successfully."));
    }

    /**
     * Update a club (admin or owner only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER')")
    public ResponseEntity<ApiResponse<ClubDto>> updateClub(
            @PathVariable Long id,
            @Valid @RequestBody CreateClubRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ClubDto club = clubService.updateClub(id, request, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(club, "Club updated successfully."));
    }

    /**
     * Delete (deactivate) a club (admin or owner only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteClub(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        clubService.deleteClub(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Club deleted successfully."));
    }

    /**
     * Get activities for a club (public - only active).
     */
    @GetMapping("/{id}/activities")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getClubActivities(@PathVariable Long id) {
        List<ActivityDto> activities = activityService.getActivitiesByClub(id);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    /**
     * Get all activities for a club (admin - includes inactive).
     */
    @GetMapping("/{id}/activities/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getAllClubActivities(@PathVariable Long id) {
        List<ActivityDto> activities = activityService.getAllActivitiesByClub(id);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    /**
     * Create a new activity for a club.
     */
    @PostMapping("/{id}/activities")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ActivityDto>> createActivity(
            @PathVariable Long id,
            @Valid @RequestBody CreateActivityRequest request) {
        ActivityDto activity = activityService.createActivity(id, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(activity, "Activity created successfully."));
    }

    /**
     * Update an activity.
     */
    @PutMapping("/{clubId}/activities/{activityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ActivityDto>> updateActivity(
            @PathVariable Long clubId,
            @PathVariable Long activityId,
            @Valid @RequestBody CreateActivityRequest request) {
        ActivityDto activity = activityService.updateActivity(activityId, request);
        return ResponseEntity.ok(ApiResponse.success(activity, "Activity updated successfully."));
    }

    /**
     * Delete (deactivate) an activity.
     */
    @DeleteMapping("/{clubId}/activities/{activityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(
            @PathVariable Long clubId,
            @PathVariable Long activityId) {
        activityService.deleteActivity(activityId);
        return ResponseEntity.ok(ApiResponse.success("Activity deleted successfully."));
    }

    /**
     * Toggle activity status (active/inactive).
     */
    @PostMapping("/{clubId}/activities/{activityId}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ActivityDto>> toggleActivityStatus(
            @PathVariable Long clubId,
            @PathVariable Long activityId) {
        ActivityDto activity = activityService.toggleActivityStatus(activityId);
        return ResponseEntity.ok(ApiResponse.success(activity, "Activity status toggled."));
    }

    /**
     * Get trainers for a club (public).
     */
    @GetMapping("/{id}/trainers")
    public ResponseEntity<ApiResponse<List<TrainerDto>>> getClubTrainers(@PathVariable Long id) {
        List<TrainerDto> trainers = trainerRepository.findByClubIdAndIsActiveTrue(id).stream()
                .map(TrainerDto::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(trainers));
    }
}

