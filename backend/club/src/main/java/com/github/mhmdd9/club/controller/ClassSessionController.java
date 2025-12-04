package com.github.mhmdd9.club.controller;

import com.github.mhmdd9.club.dto.ClassSessionDto;
import com.github.mhmdd9.club.dto.CreateClassSessionRequest;
import com.github.mhmdd9.club.service.ClassSessionService;
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

@RestController
@RequestMapping("/v1/classes")
@RequiredArgsConstructor
public class ClassSessionController {

    private final ClassSessionService sessionService;

    /**
     * Get available sessions by date (public).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassSessionDto>>> getAvailableSessions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ClassSessionDto> sessions = sessionService.getAvailableSessions(date);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    /**
     * Get upcoming sessions for a club (public).
     */
    @GetMapping("/club/{clubId}")
    public ResponseEntity<ApiResponse<List<ClassSessionDto>>> getClubSessions(@PathVariable Long clubId) {
        List<ClassSessionDto> sessions = sessionService.getUpcomingSessions(clubId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    /**
     * Get session by ID (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassSessionDto>> getSessionById(@PathVariable Long id) {
        ClassSessionDto session = sessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    /**
     * Create a new class session (staff roles only: admin, owner, manager, trainer).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<ClassSessionDto>> createSession(
            @Valid @RequestBody CreateClassSessionRequest request) {
        ClassSessionDto session = sessionService.createSession(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(session, "Class session created successfully."));
    }

    /**
     * Cancel a class session (staff roles only: admin, owner, manager).
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable Long id) {
        sessionService.cancelSession(id);
        return ResponseEntity.ok(ApiResponse.success("Class session cancelled successfully."));
    }
}

