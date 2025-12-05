package com.github.mhmdd9.club.controller;

import com.github.mhmdd9.club.dto.CreateMembershipPlanRequest;
import com.github.mhmdd9.club.dto.MembershipPlanDto;
import com.github.mhmdd9.club.service.MembershipPlanService;
import com.github.mhmdd9.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/clubs/{clubId}/membership-plans")
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanService planService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipPlanDto>>> getActivePlans(
            @PathVariable Long clubId) {
        List<MembershipPlanDto> plans = planService.getActivePlansByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MembershipPlanDto>>> getAllPlans(
            @PathVariable Long clubId) {
        List<MembershipPlanDto> plans = planService.getAllPlansByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> getPlan(
            @PathVariable Long clubId,
            @PathVariable Long planId) {
        MembershipPlanDto plan = planService.getPlanById(planId);
        return ResponseEntity.ok(ApiResponse.success(plan));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> createPlan(
            @PathVariable Long clubId,
            @Valid @RequestBody CreateMembershipPlanRequest request) {
        MembershipPlanDto plan = planService.createPlan(clubId, request);
        return ResponseEntity.ok(ApiResponse.success(plan, "اشتراک با موفقیت ایجاد شد"));
    }

    @PutMapping("/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> updatePlan(
            @PathVariable Long clubId,
            @PathVariable Long planId,
            @Valid @RequestBody CreateMembershipPlanRequest request) {
        MembershipPlanDto plan = planService.updatePlan(planId, request);
        return ResponseEntity.ok(ApiResponse.success(plan, "اشتراک با موفقیت بروزرسانی شد"));
    }

    @PostMapping("/{planId}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> togglePlanStatus(
            @PathVariable Long clubId,
            @PathVariable Long planId) {
        planService.togglePlanStatus(planId);
        return ResponseEntity.ok(ApiResponse.success(null, "وضعیت اشتراک تغییر کرد"));
    }

    @DeleteMapping("/{planId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @PathVariable Long clubId,
            @PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.ok(ApiResponse.success(null, "اشتراک غیرفعال شد"));
    }
}
