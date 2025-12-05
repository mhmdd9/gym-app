package com.github.mhmdd9.club.service;

import com.github.mhmdd9.club.dto.CreateMembershipPlanRequest;
import com.github.mhmdd9.club.dto.MembershipPlanDto;
import com.github.mhmdd9.club.entity.ActivityDefinition;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.entity.MembershipPlan;
import com.github.mhmdd9.club.repository.ActivityDefinitionRepository;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.club.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipPlanService {

    private final MembershipPlanRepository planRepository;
    private final ClubRepository clubRepository;
    private final ActivityDefinitionRepository activityRepository;

    public List<MembershipPlanDto> getActivePlansByClub(Long clubId) {
        List<MembershipPlan> plans = planRepository.findActiveByClubWithActivity(clubId);
        return plans.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MembershipPlanDto> getAllPlansByClub(Long clubId) {
        List<MembershipPlan> plans = planRepository.findAllByClubWithActivity(clubId);
        return plans.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MembershipPlanDto getPlanById(Long id) {
        MembershipPlan plan = planRepository.findByIdWithActivity(id);
        if (plan == null) {
            throw new IllegalArgumentException("پلن اشتراک یافت نشد: " + id);
        }
        return toDto(plan);
    }

    @Transactional
    public MembershipPlanDto createPlan(Long clubId, CreateMembershipPlanRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("باشگاه یافت نشد: " + clubId));

        ActivityDefinition activity = null;
        if (request.getActivityId() != null) {
            activity = activityRepository.findById(request.getActivityId())
                    .orElseThrow(() -> new IllegalArgumentException("فعالیت یافت نشد: " + request.getActivityId()));
        }

        MembershipPlan plan = MembershipPlan.builder()
                .club(club)
                .activity(activity)
                .name(request.getName())
                .description(request.getDescription())
                .durationDays(request.getDurationDays())
                .price(request.getPrice())
                .isActive(true)
                .build();

        plan = planRepository.save(plan);
        log.info("Created membership plan: {} for club: {}", plan.getName(), clubId);
        return toDto(plan);
    }

    @Transactional
    public MembershipPlanDto updatePlan(Long planId, CreateMembershipPlanRequest request) {
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("پلن اشتراک یافت نشد: " + planId));

        ActivityDefinition activity = null;
        if (request.getActivityId() != null) {
            activity = activityRepository.findById(request.getActivityId())
                    .orElseThrow(() -> new IllegalArgumentException("فعالیت یافت نشد: " + request.getActivityId()));
        }

        plan.setActivity(activity);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationDays(request.getDurationDays());
        plan.setPrice(request.getPrice());

        plan = planRepository.save(plan);
        log.info("Updated membership plan: {}", planId);
        return toDto(plan);
    }

    @Transactional
    public void togglePlanStatus(Long planId) {
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("پلن اشتراک یافت نشد: " + planId));
        plan.setIsActive(!plan.getIsActive());
        planRepository.save(plan);
        log.info("Toggled membership plan {} status to: {}", planId, plan.getIsActive());
    }

    @Transactional
    public void deletePlan(Long planId) {
        MembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("پلن اشتراک یافت نشد: " + planId));
        plan.setIsActive(false);
        planRepository.save(plan);
        log.info("Deactivated membership plan: {}", planId);
    }

    private MembershipPlanDto toDto(MembershipPlan plan) {
        return MembershipPlanDto.builder()
                .id(plan.getId())
                .clubId(plan.getClub().getId())
                .activityId(plan.getActivity() != null ? plan.getActivity().getId() : null)
                .activityName(plan.getActivity() != null ? plan.getActivity().getName() : null)
                .name(plan.getName())
                .description(plan.getDescription())
                .durationDays(plan.getDurationDays())
                .price(plan.getPrice())
                .isActive(plan.getIsActive())
                .build();
    }
}
