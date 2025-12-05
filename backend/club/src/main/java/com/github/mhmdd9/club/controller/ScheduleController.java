package com.github.mhmdd9.club.controller;

import com.github.mhmdd9.club.dto.CreateScheduleRequest;
import com.github.mhmdd9.club.dto.ScheduleDto;
import com.github.mhmdd9.club.service.ScheduleService;
import com.github.mhmdd9.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * Get active schedules for a club.
     */
    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getClubSchedules(@PathVariable Long clubId) {
        List<ScheduleDto> schedules = scheduleService.getSchedulesByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    /**
     * Get all schedules for a club (including inactive).
     */
    @GetMapping("/club/{clubId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getAllClubSchedules(@PathVariable Long clubId) {
        List<ScheduleDto> schedules = scheduleService.getAllSchedulesByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    /**
     * Get a specific schedule.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleDto>> getSchedule(@PathVariable Long id) {
        ScheduleDto schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(ApiResponse.success(schedule));
    }

    /**
     * Create a new schedule.
     */
    @PostMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleDto>> createSchedule(
            @PathVariable Long clubId,
            @Valid @RequestBody CreateScheduleRequest request) {
        ScheduleDto schedule = scheduleService.createSchedule(clubId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(schedule, "Schedule created successfully."));
    }

    /**
     * Update a schedule.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleDto>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody CreateScheduleRequest request) {
        ScheduleDto schedule = scheduleService.updateSchedule(id, request);
        return ResponseEntity.ok(ApiResponse.success(schedule, "Schedule updated successfully."));
    }

    /**
     * Delete (deactivate) a schedule.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully."));
    }

    /**
     * Toggle schedule status.
     */
    @PostMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleDto>> toggleScheduleStatus(@PathVariable Long id) {
        ScheduleDto schedule = scheduleService.toggleScheduleStatus(id);
        return ResponseEntity.ok(ApiResponse.success(schedule, "Schedule status toggled."));
    }

    /**
     * Generate sessions from schedules for a date range.
     */
    @PostMapping("/club/{clubId}/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateSessions(
            @PathVariable Long clubId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        int count = scheduleService.generateSessions(clubId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("sessionsCreated", count),
                String.format("%d sessions generated successfully.", count)
        ));
    }
}
