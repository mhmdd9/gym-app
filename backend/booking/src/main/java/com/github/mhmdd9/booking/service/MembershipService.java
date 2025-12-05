package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.booking.dto.ApproveMembershipRequest;
import com.github.mhmdd9.booking.dto.PurchaseMembershipRequest;
import com.github.mhmdd9.booking.dto.UserMembershipDto;
import com.github.mhmdd9.booking.dto.ValidateMembershipResponse;
import com.github.mhmdd9.booking.entity.Payment;
import com.github.mhmdd9.booking.entity.UserMembership;
import com.github.mhmdd9.booking.repository.PaymentRepository;
import com.github.mhmdd9.booking.repository.UserMembershipRepository;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.entity.MembershipPlan;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.club.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipService {

    private final UserMembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;
    private final ClubRepository clubRepository;
    private final MembershipPlanRepository planRepository;
    private final UserRepository userRepository;

    public List<UserMembershipDto> getUserMemberships(Long userId) {
        List<UserMembership> memberships = membershipRepository.findByUserId(userId);
        return enrichMemberships(memberships);
    }

    public List<UserMembershipDto> getActiveMemberships(Long userId) {
        List<UserMembership> memberships = membershipRepository.findActiveByUser(userId, LocalDate.now());
        return enrichMemberships(memberships);
    }
    
    /**
     * Enriches membership DTOs with club name, plan name, and user info
     */
    private List<UserMembershipDto> enrichMemberships(List<UserMembership> memberships) {
        if (memberships.isEmpty()) {
            return List.of();
        }
        
        // Collect unique IDs
        Set<Long> clubIds = memberships.stream().map(UserMembership::getClubId).collect(Collectors.toSet());
        Set<Long> planIds = memberships.stream().map(UserMembership::getPlanId).collect(Collectors.toSet());
        Set<Long> userIds = memberships.stream().map(UserMembership::getUserId).collect(Collectors.toSet());
        
        // Fetch related entities
        Map<Long, Club> clubMap = clubRepository.findAllById(clubIds).stream()
                .collect(Collectors.toMap(Club::getId, c -> c));
        Map<Long, MembershipPlan> planMap = planRepository.findAllById(planIds).stream()
                .collect(Collectors.toMap(MembershipPlan::getId, p -> p));
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        return memberships.stream()
                .map(m -> {
                    UserMembershipDto dto = toDto(m);
                    
                    Club club = clubMap.get(m.getClubId());
                    if (club != null) {
                        dto.setClubName(club.getName());
                    }
                    
                    MembershipPlan plan = planMap.get(m.getPlanId());
                    if (plan != null) {
                        dto.setPlanName(plan.getName());
                    }
                    
                    User user = userMap.get(m.getUserId());
                    if (user != null) {
                        dto.setUserName(user.getFullName());
                        dto.setUserPhone(user.getPhoneNumber());
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserMembershipDto> getActiveMembershipsByClub(Long userId, Long clubId) {
        List<UserMembership> memberships = membershipRepository.findActiveByUserAndClub(
                userId, clubId, LocalDate.now());
        return enrichMemberships(memberships);
    }

    /**
     * User requests a membership (creates with PENDING status)
     */
    @Transactional
    public UserMembershipDto requestMembership(Long userId, PurchaseMembershipRequest request) {
        UserMembership membership = UserMembership.builder()
                .userId(userId)
                .planId(request.getPlanId())
                .clubId(request.getClubId())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .status(UserMembership.MembershipStatus.PENDING)
                .notes(request.getNotes())
                .build();

        membership = membershipRepository.save(membership);
        log.info("Created pending membership request for user: {} plan: {}", userId, request.getPlanId());
        return toDtoEnriched(membership);
    }

    /**
     * Staff approves a membership request with payment details
     */
    @Transactional
    public UserMembershipDto approveMembership(Long membershipId, ApproveMembershipRequest request, Long recordedBy) {
        UserMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));
        
        if (membership.getStatus() != UserMembership.MembershipStatus.PENDING) {
            throw new IllegalStateException("Only pending memberships can be approved");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .membershipId(membershipId)
                .userId(membership.getUserId())
                .clubId(membership.getClubId())
                .amount(request.getAmount())
                .currency("IRR")
                .method(request.getMethod())
                .referenceNumber(request.getReferenceNumber())
                .status(Payment.PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .recordedBy(recordedBy)
                .notes(request.getNotes())
                .build();
        
        payment = paymentRepository.save(payment);
        
        // Update membership
        membership.setStatus(UserMembership.MembershipStatus.ACTIVE);
        membership.setPaymentId(payment.getId());
        membership.setStartDate(LocalDate.now()); // Start from approval date
        
        membership = membershipRepository.save(membership);
        log.info("Approved membership: {} with payment: {}", membershipId, payment.getId());
        return toDtoEnriched(membership);
    }

    /**
     * Staff rejects a membership request
     */
    @Transactional
    public void rejectMembership(Long membershipId, String reason) {
        UserMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));
        
        if (membership.getStatus() != UserMembership.MembershipStatus.PENDING) {
            throw new IllegalStateException("Only pending memberships can be rejected");
        }
        
        membership.setStatus(UserMembership.MembershipStatus.CANCELLED);
        membership.setNotes(reason);
        membershipRepository.save(membership);
        log.info("Rejected membership: {} reason: {}", membershipId, reason);
    }

    /**
     * Get pending membership requests for a club (for staff)
     */
    public List<UserMembershipDto> getPendingMembershipsByClub(Long clubId) {
        List<UserMembership> memberships = membershipRepository.findByClubIdAndStatus(
                clubId, UserMembership.MembershipStatus.PENDING);
        return enrichMemberships(memberships);
    }

    /**
     * Get all memberships for a club (for staff)
     */
    public List<UserMembershipDto> getMembershipsByClub(Long clubId) {
        List<UserMembership> memberships = membershipRepository.findByClubId(clubId);
        return enrichMemberships(memberships);
    }

    /**
     * Get all memberships for a specific plan (for admin/owner)
     */
    public List<UserMembershipDto> getMembershipsByPlan(Long planId) {
        List<UserMembership> memberships = membershipRepository.findByPlanIdOrderByCreatedAtDesc(planId);
        return enrichMemberships(memberships);
    }

    // Keep for backward compatibility - staff can directly create active membership
    @Transactional
    public UserMembershipDto createMembershipForUser(Long userId, Long planId, Long clubId,
            LocalDate startDate, LocalDate endDate, Long paymentId) {
        UserMembership membership = UserMembership.builder()
                .userId(userId)
                .planId(planId)
                .clubId(clubId)
                .startDate(startDate != null ? startDate : LocalDate.now())
                .endDate(endDate)
                .status(UserMembership.MembershipStatus.ACTIVE)
                .paymentId(paymentId)
                .build();

        membership = membershipRepository.save(membership);
        log.info("Created membership for user: {} plan: {}", userId, planId);
        return toDtoEnriched(membership);
    }

    public ValidateMembershipResponse validateMembership(Long userId, Long clubId) {
        List<UserMembership> memberships = membershipRepository.findActiveByUserAndClub(
                userId, clubId, LocalDate.now());

        if (memberships.isEmpty()) {
            return ValidateMembershipResponse.builder()
                    .valid(false)
                    .message("اشتراک فعالی یافت نشد")
                    .build();
        }

        UserMembership membership = memberships.get(0);
        boolean isValid = membership.isValid();

        ValidateMembershipResponse.ValidateMembershipResponseBuilder builder = ValidateMembershipResponse.builder()
                .valid(isValid)
                .membershipId(membership.getId())
                .planId(membership.getPlanId())
                .endDate(membership.getEndDate());

        if (isValid) {
            builder.message("اشتراک معتبر است");
        } else if (membership.getEndDate() != null && LocalDate.now().isAfter(membership.getEndDate())) {
            builder.message("اشتراک منقضی شده است");
        } else {
            builder.message("اشتراک معتبر نیست");
        }

        return builder.build();
    }

    @Transactional
    public void suspendMembership(Long membershipId) {
        UserMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));
        membership.setStatus(UserMembership.MembershipStatus.SUSPENDED);
        membershipRepository.save(membership);
        log.info("Suspended membership: {}", membershipId);
    }

    @Transactional
    public void cancelMembership(Long membershipId) {
        UserMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));
        membership.setStatus(UserMembership.MembershipStatus.CANCELLED);
        membershipRepository.save(membership);
        log.info("Cancelled membership: {}", membershipId);
    }

    @Transactional
    public void expireOldMemberships() {
        List<UserMembership> expired = membershipRepository.findExpiredMemberships(LocalDate.now());
        for (UserMembership membership : expired) {
            membership.setStatus(UserMembership.MembershipStatus.EXPIRED);
        }
        membershipRepository.saveAll(expired);
        log.info("Expired {} memberships", expired.size());
    }

    private UserMembershipDto toDto(UserMembership membership) {
        return UserMembershipDto.builder()
                .id(membership.getId())
                .userId(membership.getUserId())
                .planId(membership.getPlanId())
                .clubId(membership.getClubId())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .status(membership.getStatus())
                .paymentId(membership.getPaymentId())
                .notes(membership.getNotes())
                .build();
    }
    
    /**
     * Enrich a single membership with related data
     */
    private UserMembershipDto toDtoEnriched(UserMembership membership) {
        UserMembershipDto dto = toDto(membership);
        
        clubRepository.findById(membership.getClubId())
                .ifPresent(club -> dto.setClubName(club.getName()));
        
        planRepository.findById(membership.getPlanId())
                .ifPresent(plan -> dto.setPlanName(plan.getName()));
        
        userRepository.findById(membership.getUserId())
                .ifPresent(user -> {
                    dto.setUserName(user.getFullName());
                    dto.setUserPhone(user.getPhoneNumber());
                });
        
        return dto;
    }
}
