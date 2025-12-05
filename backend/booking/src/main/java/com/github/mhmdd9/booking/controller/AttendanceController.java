package com.github.mhmdd9.booking.controller;

import com.github.mhmdd9.booking.dto.AttendanceDto;
import com.github.mhmdd9.booking.dto.CheckInRequest;
import com.github.mhmdd9.booking.service.AttendanceService;
import com.github.mhmdd9.common.dto.ApiResponse;
import com.github.mhmdd9.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST', 'TRAINER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkIn(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CheckInRequest request) {
        AttendanceDto attendance = attendanceService.checkIn(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(attendance, "ورود با موفقیت ثبت شد"));
    }

    @GetMapping("/club/{clubId}/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getTodayAttendance(
            @PathVariable Long clubId) {
        List<AttendanceDto> attendances = attendanceService.getTodayAttendance(clubId);
        return ResponseEntity.ok(ApiResponse.success(attendances));
    }

    @GetMapping("/club/{clubId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByDateRange(
            @PathVariable Long clubId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceDto> attendances = attendanceService.getAttendanceByDateRange(clubId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(attendances));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getUserAttendance(
            @PathVariable Long userId) {
        List<AttendanceDto> attendances = attendanceService.getUserAttendance(userId);
        return ResponseEntity.ok(ApiResponse.success(attendances));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyAttendance(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<AttendanceDto> attendances = attendanceService.getUserAttendance(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(attendances));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getSessionAttendance(
            @PathVariable Long sessionId) {
        List<AttendanceDto> attendances = attendanceService.getSessionAttendance(sessionId);
        return ResponseEntity.ok(ApiResponse.success(attendances));
    }

    @GetMapping("/membership/{membershipId}/count")
    public ResponseEntity<ApiResponse<Long>> getAttendanceCount(
            @PathVariable Long membershipId) {
        Long count = attendanceService.getAttendanceCount(membershipId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
