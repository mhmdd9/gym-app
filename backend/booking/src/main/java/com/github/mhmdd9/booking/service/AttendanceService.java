package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.booking.dto.AttendanceDto;
import com.github.mhmdd9.booking.dto.CheckInRequest;
import com.github.mhmdd9.booking.entity.Attendance;
import com.github.mhmdd9.booking.entity.UserMembership;
import com.github.mhmdd9.booking.repository.AttendanceRepository;
import com.github.mhmdd9.booking.repository.UserMembershipRepository;
import com.github.mhmdd9.club.entity.MembershipPlan;
import com.github.mhmdd9.club.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;

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
        return enrichAttendances(attendances);
    }

    private List<AttendanceDto> enrichAttendances(List<Attendance> attendances) {
        if (attendances.isEmpty()) {
            return List.of();
        }

        // Collect unique IDs
        Set<Long> userIds = attendances.stream().map(Attendance::getUserId).collect(Collectors.toSet());
        Set<Long> membershipIds = attendances.stream().map(Attendance::getMembershipId).collect(Collectors.toSet());

        // Fetch related data
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, UserMembership> membershipMap = membershipRepository.findAllById(membershipIds).stream()
                .collect(Collectors.toMap(UserMembership::getId, m -> m));

        // Get plan IDs from memberships
        Set<Long> planIds = membershipMap.values().stream()
                .map(UserMembership::getPlanId)
                .collect(Collectors.toSet());
        Map<Long, MembershipPlan> planMap = planRepository.findAllById(planIds).stream()
                .collect(Collectors.toMap(MembershipPlan::getId, p -> p));

        return attendances.stream()
                .map(attendance -> {
                    AttendanceDto dto = toDto(attendance);

                    User user = userMap.get(attendance.getUserId());
                    if (user != null) {
                        dto.setUserName(user.getFullName());
                        dto.setUserPhone(user.getPhoneNumber());
                    }

                    UserMembership membership = membershipMap.get(attendance.getMembershipId());
                    if (membership != null) {
                        MembershipPlan plan = planMap.get(membership.getPlanId());
                        if (plan != null) {
                            dto.setPlanName(plan.getName());
                        }
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByDateRange(Long clubId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Attendance> attendances = attendanceRepository.findByClubIdAndCheckInTimeBetween(
                clubId, startDateTime, endDateTime);
        return enrichAttendances(attendances);
    }

    public List<AttendanceDto> getUserAttendance(Long userId) {
        List<Attendance> attendances = attendanceRepository.findByUserId(userId);
        return enrichAttendances(attendances);
    }

    public List<AttendanceDto> getSessionAttendance(Long sessionId) {
        List<Attendance> attendances = attendanceRepository.findBySessionId(sessionId);
        return enrichAttendances(attendances);
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
