package com.github.mhmdd9.club.controller;

import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.club.dto.ClubDto;
import com.github.mhmdd9.club.dto.CreateClubRequest;
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
}

