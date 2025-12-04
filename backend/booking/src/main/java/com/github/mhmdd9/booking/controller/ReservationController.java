package com.github.mhmdd9.booking.controller;

import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.booking.dto.CreateReservationRequest;
import com.github.mhmdd9.booking.dto.ReservationDto;
import com.github.mhmdd9.booking.service.ReservationService;
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
@RequestMapping("/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Get my reservations (authenticated user).
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<ReservationDto>>> getMyReservations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "bookedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ReservationDto> reservations = reservationService.getMyReservations(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    /**
     * Get my active reservations (authenticated user).
     */
    @GetMapping("/my/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getMyActiveReservations(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ReservationDto> reservations = reservationService.getActiveReservations(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    /**
     * Get reservations for a club (staff only).
     */
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PageResponse<ReservationDto>>> getClubReservations(
            @PathVariable Long clubId,
            @PageableDefault(size = 20, sort = "bookedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ReservationDto> reservations = reservationService.getClubReservations(clubId, pageable);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    /**
     * Get a specific reservation by ID.
     * Users can view their own, staff can view any.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationDto>> getReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal.getAuthorities().stream()
                .anyMatch(a -> List.of("ROLE_ADMIN", "ROLE_GYM_OWNER", "ROLE_MANAGER", "ROLE_RECEPTIONIST")
                        .contains(a.getAuthority()));
        ReservationDto reservation = reservationService.getReservationById(id, principal.getId(), isStaff);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    /**
     * Create a reservation (any authenticated user).
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationDto>> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReservationDto reservation = reservationService.createReservation(request, principal.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(reservation, "Reservation created successfully."));
    }

    /**
     * Cancel a reservation.
     * Users can cancel their own, staff can cancel any.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReservationDto>> cancelReservation(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isStaff = principal.getAuthorities().stream()
                .anyMatch(a -> List.of("ROLE_ADMIN", "ROLE_GYM_OWNER", "ROLE_MANAGER", "ROLE_RECEPTIONIST")
                        .contains(a.getAuthority()));
        ReservationDto reservation = reservationService.cancelReservation(id, principal.getId(), reason, isStaff);
        return ResponseEntity.ok(ApiResponse.success(reservation, "Reservation cancelled successfully."));
    }

    /**
     * Check in a reservation (staff only).
     */
    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<ReservationDto>> checkInReservation(@PathVariable Long id) {
        ReservationDto reservation = reservationService.checkIn(id);
        return ResponseEntity.ok(ApiResponse.success(reservation, "Check-in successful."));
    }
}

