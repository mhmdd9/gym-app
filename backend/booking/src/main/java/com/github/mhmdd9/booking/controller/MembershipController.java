package com.github.mhmdd9.booking.controller;

import com.github.mhmdd9.booking.dto.ApproveMembershipRequest;
import com.github.mhmdd9.booking.dto.PurchaseMembershipRequest;
import com.github.mhmdd9.booking.dto.UserMembershipDto;
import com.github.mhmdd9.booking.dto.ValidateMembershipResponse;
import com.github.mhmdd9.booking.service.MembershipService;
import com.github.mhmdd9.common.dto.ApiResponse;
import com.github.mhmdd9.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getMyMemberships(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<UserMembershipDto> memberships = membershipService.getUserMemberships(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/my/active")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getMyActiveMemberships(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<UserMembershipDto> memberships = membershipService.getActiveMemberships(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/my/club/{clubId}")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getMyMembershipsByClub(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long clubId) {
        List<UserMembershipDto> memberships = membershipService.getActiveMembershipsByClub(
                currentUser.getId(), clubId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<UserMembershipDto>> requestMembership(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PurchaseMembershipRequest request) {
        UserMembershipDto membership = membershipService.requestMembership(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(membership, "درخواست اشتراک ثبت شد. پس از پرداخت، اشتراک فعال خواهد شد."));
    }

    // Staff endpoints for managing membership requests
    @GetMapping("/club/{clubId}/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getPendingMemberships(
            @PathVariable Long clubId) {
        List<UserMembershipDto> memberships = membershipService.getPendingMembershipsByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/club/{clubId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getClubMemberships(
            @PathVariable Long clubId) {
        List<UserMembershipDto> memberships = membershipService.getMembershipsByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/plan/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getMembershipsByPlan(
            @PathVariable Long planId) {
        List<UserMembershipDto> memberships = membershipService.getMembershipsByPlan(planId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @PostMapping("/{membershipId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<UserMembershipDto>> approveMembership(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long membershipId,
            @Valid @RequestBody ApproveMembershipRequest request) {
        UserMembershipDto membership = membershipService.approveMembership(membershipId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(membership, "اشتراک فعال شد"));
    }

    @PostMapping("/{membershipId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> rejectMembership(
            @PathVariable Long membershipId,
            @RequestParam(required = false) String reason) {
        membershipService.rejectMembership(membershipId, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "درخواست اشتراک رد شد"));
    }

    @GetMapping("/validate/{userId}/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST', 'TRAINER')")
    public ResponseEntity<ApiResponse<ValidateMembershipResponse>> validateMembership(
            @PathVariable Long userId,
            @PathVariable Long clubId) {
        ValidateMembershipResponse response = membershipService.validateMembership(userId, clubId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getUserMemberships(
            @PathVariable Long userId) {
        List<UserMembershipDto> memberships = membershipService.getUserMemberships(userId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/user/{userId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<UserMembershipDto>>> getUserActiveMemberships(
            @PathVariable Long userId) {
        List<UserMembershipDto> memberships = membershipService.getActiveMemberships(userId);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @PostMapping("/{membershipId}/suspend")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> suspendMembership(@PathVariable Long membershipId) {
        membershipService.suspendMembership(membershipId);
        return ResponseEntity.ok(ApiResponse.success(null, "اشتراک معلق شد"));
    }

    @PostMapping("/{membershipId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelMembership(@PathVariable Long membershipId) {
        membershipService.cancelMembership(membershipId);
        return ResponseEntity.ok(ApiResponse.success(null, "اشتراک لغو شد"));
    }
}
