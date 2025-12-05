package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.booking.dto.AttendanceDto;
import com.github.mhmdd9.booking.dto.CheckInRequest;
import com.github.mhmdd9.booking.entity.Attendance;
import com.github.mhmdd9.booking.entity.UserMembership;
import com.github.mhmdd9.booking.repository.AttendanceRepository;
import com.github.mhmdd9.booking.repository.UserMembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserMembershipRepository membershipRepository;

    @Transactional
    public AttendanceDto checkIn(CheckInRequest request, Long staffUserId) {
        // Validate membership
        UserMembership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + request.getMembershipId()));

        if (!membership.isValid()) {
            throw new IllegalStateException("اشتراک معتبر نیست");
        }

        // Create attendance record
        Attendance attendance = Attendance.builder()
                .userId(request.getUserId())
                .membershipId(request.getMembershipId())
                .clubId(request.getClubId())
                .sessionId(request.getSessionId())
                .checkInTime(LocalDateTime.now())
                .recordedByUserId(staffUserId)
                .notes(request.getNotes())
                .build();

        attendance = attendanceRepository.save(attendance);

        log.info("Recorded check-in for user: {} at club: {}", request.getUserId(), request.getClubId());
        return toDto(attendance);
    }

    public List<AttendanceDto> getTodayAttendance(Long clubId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<Attendance> attendances = attendanceRepository.findTodayByClub(clubId, startOfDay, endOfDay);
        return attendances.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByDateRange(Long clubId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Attendance> attendances = attendanceRepository.findByClubIdAndCheckInTimeBetween(
                clubId, startDateTime, endDateTime);
        return attendances.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getUserAttendance(Long userId) {
        List<Attendance> attendances = attendanceRepository.findByUserId(userId);
        return attendances.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getSessionAttendance(Long sessionId) {
        List<Attendance> attendances = attendanceRepository.findBySessionId(sessionId);
        return attendances.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Long getAttendanceCount(Long membershipId) {
        return attendanceRepository.countByMembershipId(membershipId);
    }

    private AttendanceDto toDto(Attendance attendance) {
        return AttendanceDto.builder()
                .id(attendance.getId())
                .userId(attendance.getUserId())
                .membershipId(attendance.getMembershipId())
                .clubId(attendance.getClubId())
                .sessionId(attendance.getSessionId())
                .checkInTime(attendance.getCheckInTime())
                .recordedByUserId(attendance.getRecordedByUserId())
                .notes(attendance.getNotes())
                .build();
    }
}
