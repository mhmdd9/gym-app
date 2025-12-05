package com.github.mhmdd9.club.service;

import com.github.mhmdd9.club.dto.ActivityDto;
import com.github.mhmdd9.club.dto.CreateActivityRequest;
import com.github.mhmdd9.club.entity.ActivityDefinition;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.repository.ActivityDefinitionRepository;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityDefinitionRepository activityRepository;
    private final ClubRepository clubRepository;

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByClub(Long clubId) {
        return activityRepository.findByClubIdAndIsActiveTrue(clubId).stream()
                .map(ActivityDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getAllActivitiesByClub(Long clubId) {
        return activityRepository.findAllByClubId(clubId).stream()
                .map(ActivityDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ActivityDto getActivityById(Long id) {
        ActivityDefinition activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("فعالیت", id));
        return ActivityDto.from(activity);
    }

    @Transactional
    public ActivityDto createActivity(Long clubId, CreateActivityRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("باشگاه", clubId));

        ActivityDefinition.IntensityLevel level = null;
        if (request.getIntensityLevel() != null && !request.getIntensityLevel().isEmpty()) {
            level = ActivityDefinition.IntensityLevel.valueOf(request.getIntensityLevel());
        }

        ActivityDefinition.ActivityType activityType = ActivityDefinition.ActivityType.CLASS;
        if (request.getActivityType() != null && !request.getActivityType().isEmpty()) {
            activityType = ActivityDefinition.ActivityType.valueOf(request.getActivityType());
        }

        ActivityDefinition activity = ActivityDefinition.builder()
                .club(club)
                .name(request.getName())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .defaultCapacity(request.getDefaultCapacity())
                .intensityLevel(level)
                .category(request.getCategory())
                .activityType(activityType)
                .isActive(true)
                .build();

        activity = activityRepository.save(activity);
        log.info("Created activity '{}' (type: {}) for club {}", activity.getName(), activityType, clubId);
        return ActivityDto.from(activity);
    }

    @Transactional
    public ActivityDto updateActivity(Long id, CreateActivityRequest request) {
        ActivityDefinition activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("فعالیت", id));

        ActivityDefinition.IntensityLevel level = null;
        if (request.getIntensityLevel() != null && !request.getIntensityLevel().isEmpty()) {
            level = ActivityDefinition.IntensityLevel.valueOf(request.getIntensityLevel());
        }

        ActivityDefinition.ActivityType activityType = activity.getActivityType();
        if (request.getActivityType() != null && !request.getActivityType().isEmpty()) {
            activityType = ActivityDefinition.ActivityType.valueOf(request.getActivityType());
        }

        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setDurationMinutes(request.getDurationMinutes());
        activity.setDefaultCapacity(request.getDefaultCapacity());
        activity.setIntensityLevel(level);
        activity.setCategory(request.getCategory());
        activity.setActivityType(activityType);

        activity = activityRepository.save(activity);
        log.info("Updated activity '{}'", activity.getName());
        return ActivityDto.from(activity);
    }

    @Transactional
    public void deleteActivity(Long id) {
        ActivityDefinition activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("فعالیت", id));

        activity.setIsActive(false);
        activityRepository.save(activity);
        log.info("Deactivated activity '{}'", activity.getName());
    }

    @Transactional
    public ActivityDto toggleActivityStatus(Long id) {
        ActivityDefinition activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("فعالیت", id));

        activity.setIsActive(!activity.getIsActive());
        activity = activityRepository.save(activity);
        log.info("Toggled activity '{}' status to {}", activity.getName(), activity.getIsActive());
        return ActivityDto.from(activity);
    }
}
