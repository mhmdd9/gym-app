package com.github.mhmdd9.club.service;

import com.github.mhmdd9.club.dto.ClassSessionDto;
import com.github.mhmdd9.club.dto.CreateClassSessionRequest;
import com.github.mhmdd9.club.entity.ActivityDefinition;
import com.github.mhmdd9.club.entity.ClassSession;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.entity.Trainer;
import com.github.mhmdd9.club.repository.ActivityDefinitionRepository;
import com.github.mhmdd9.club.repository.ClassSessionRepository;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.club.repository.TrainerRepository;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository sessionRepository;
    private final ClubRepository clubRepository;
    private final ActivityDefinitionRepository activityRepository;
    private final TrainerRepository trainerRepository;

    @Transactional(readOnly = true)
    public List<ClassSessionDto> getUpcomingSessions(Long clubId) {
        return sessionRepository.findUpcomingSessionsByClub(clubId, LocalDate.now()).stream()
                .map(ClassSessionDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClassSessionDto> getAllSessionsForManagement(Long clubId) {
        return sessionRepository.findAllSessionsByClub(clubId, LocalDate.now()).stream()
                .map(ClassSessionDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClassSessionDto> getAvailableSessions(LocalDate date) {
        return sessionRepository.findAvailableSessionsByDate(date).stream()
                .map(ClassSessionDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassSessionDto getSessionById(Long id) {
        ClassSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassSession", id));
        return ClassSessionDto.from(session);
    }

    @Transactional
    public ClassSessionDto createSession(CreateClassSessionRequest request) {
        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club", request.getClubId()));

        ActivityDefinition activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity", request.getActivityId()));

        Trainer trainer = null;
        if (request.getTrainerId() != null) {
            trainer = trainerRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer", request.getTrainerId()));
        }

        // Validate times
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BusinessException("End time must be after start time", "INVALID_TIME");
        }

        ClassSession session = ClassSession.builder()
                .club(club)
                .activity(activity)
                .trainer(trainer)
                .sessionDate(request.getSessionDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .bookedCount(0)
                .status(ClassSession.SessionStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        session = sessionRepository.save(session);
        return ClassSessionDto.from(session);
    }

    @Transactional
    public void cancelSession(Long id) {
        ClassSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassSession", id));

        if (session.getStatus() == ClassSession.SessionStatus.CANCELLED) {
            throw new BusinessException("Session is already cancelled", "ALREADY_CANCELLED");
        }

        session.setStatus(ClassSession.SessionStatus.CANCELLED);
        sessionRepository.save(session);
        
        // TODO: Notify booked users
    }
}

