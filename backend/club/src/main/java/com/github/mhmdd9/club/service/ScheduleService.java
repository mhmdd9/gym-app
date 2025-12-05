package com.github.mhmdd9.club.service;

import com.github.mhmdd9.club.dto.CreateScheduleRequest;
import com.github.mhmdd9.club.dto.ScheduleDto;
import com.github.mhmdd9.club.entity.*;
import com.github.mhmdd9.club.repository.*;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ClubRepository clubRepository;
    private final ActivityDefinitionRepository activityRepository;
    private final TrainerRepository trainerRepository;
    private final ClassSessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public List<ScheduleDto> getSchedulesByClub(Long clubId) {
        return scheduleRepository.findByClubIdAndIsActiveTrue(clubId).stream()
                .map(ScheduleDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto> getAllSchedulesByClub(Long clubId) {
        return scheduleRepository.findAllByClubId(clubId).stream()
                .map(ScheduleDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScheduleDto getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
        return ScheduleDto.from(schedule);
    }

    @Transactional
    public ScheduleDto createSchedule(Long clubId, CreateScheduleRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club", clubId));

        ActivityDefinition activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", request.getActivityId()));

        Trainer trainer = null;
        if (request.getTrainerId() != null) {
            trainer = trainerRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer", request.getTrainerId()));
        }

        Set<DayOfWeek> daysOfWeek = request.getDaysOfWeek().stream()
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());

        Integer capacity = request.getCapacity() != null 
                ? request.getCapacity() 
                : activity.getDefaultCapacity();

        Schedule schedule = Schedule.builder()
                .club(club)
                .activity(activity)
                .trainer(trainer)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .daysOfWeek(daysOfWeek)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .capacity(capacity)
                .notes(request.getNotes())
                .isActive(true)
                .build();

        schedule = scheduleRepository.save(schedule);
        log.info("Created schedule for activity '{}' at club {}", activity.getName(), clubId);
        return ScheduleDto.from(schedule);
    }

    @Transactional
    public ScheduleDto updateSchedule(Long id, CreateScheduleRequest request) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));

        ActivityDefinition activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", request.getActivityId()));

        Trainer trainer = null;
        if (request.getTrainerId() != null) {
            trainer = trainerRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer", request.getTrainerId()));
        }

        Set<DayOfWeek> daysOfWeek = request.getDaysOfWeek().stream()
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());

        schedule.setActivity(activity);
        schedule.setTrainer(trainer);
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setDaysOfWeek(daysOfWeek);
        schedule.setValidFrom(request.getValidFrom());
        schedule.setValidUntil(request.getValidUntil());
        schedule.setCapacity(request.getCapacity() != null ? request.getCapacity() : activity.getDefaultCapacity());
        schedule.setNotes(request.getNotes());

        schedule = scheduleRepository.save(schedule);
        log.info("Updated schedule {}", id);
        return ScheduleDto.from(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
        schedule.setIsActive(false);
        scheduleRepository.save(schedule);
        log.info("Deactivated schedule {}", id);
    }

    @Transactional
    public ScheduleDto toggleScheduleStatus(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
        schedule.setIsActive(!schedule.getIsActive());
        schedule = scheduleRepository.save(schedule);
        log.info("Toggled schedule {} status to {}", id, schedule.getIsActive());
        return ScheduleDto.from(schedule);
    }

    /**
     * Generate class sessions from active schedules for a date range.
     * Returns the number of sessions created.
     */
    @Transactional
    public int generateSessions(Long clubId, LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules = scheduleRepository.findByClubIdAndIsActiveTrue(clubId);
        List<ClassSession> sessionsToCreate = new ArrayList<>();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            for (Schedule schedule : schedules) {
                if (schedule.isValidForDate(currentDate)) {
                    // Check if session already exists for this date and activity
                    boolean exists = sessionRepository.existsByActivityIdAndClubIdAndSessionDate(
                            schedule.getActivity().getId(),
                            clubId,
                            currentDate
                    );

                    if (!exists) {
                        ClassSession session = ClassSession.builder()
                                .activity(schedule.getActivity())
                                .club(schedule.getClub())
                                .trainer(schedule.getTrainer())
                                .sessionDate(currentDate)
                                .startTime(schedule.getStartTime())
                                .endTime(schedule.getEndTime())
                                .capacity(schedule.getCapacity())
                                .bookedCount(0)
                                .status(ClassSession.SessionStatus.SCHEDULED)
                                .notes(schedule.getNotes())
                                .build();
                        sessionsToCreate.add(session);
                    }
                }
            }
            currentDate = currentDate.plusDays(1);
        }

        if (!sessionsToCreate.isEmpty()) {
            sessionRepository.saveAll(sessionsToCreate);
            log.info("Generated {} sessions for club {} from {} to {}", 
                    sessionsToCreate.size(), clubId, startDate, endDate);
        }

        return sessionsToCreate.size();
    }
}
