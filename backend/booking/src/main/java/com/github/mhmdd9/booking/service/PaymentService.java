package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.booking.dto.PaymentDto;
import com.github.mhmdd9.booking.dto.PaymentHistoryDto;
import com.github.mhmdd9.booking.dto.PendingPaymentDto;
import com.github.mhmdd9.booking.dto.RecordPaymentRequest;
import com.github.mhmdd9.booking.entity.Payment;
import com.github.mhmdd9.booking.entity.Reservation;
import com.github.mhmdd9.booking.entity.UserMembership;
import com.github.mhmdd9.booking.repository.PaymentRepository;
import com.github.mhmdd9.booking.repository.ReservationRepository;
import com.github.mhmdd9.booking.repository.UserMembershipRepository;
import com.github.mhmdd9.club.entity.ClassSession;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.entity.MembershipPlan;
import com.github.mhmdd9.club.repository.ClassSessionRepository;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.club.repository.MembershipPlanRepository;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ClassSessionRepository sessionRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final MembershipPlanRepository membershipPlanRepository;

    @Transactional(readOnly = true)
    public Optional<PaymentDto> getPaymentByReservation(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .map(PaymentDto::from);
    }

    @Transactional
    public PaymentDto recordPayment(RecordPaymentRequest request, Long recordedBy) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("رزرو", request.getReservationId()));

        // Check if payment already exists
        if (paymentRepository.findByReservationId(request.getReservationId()).isPresent()) {
            throw new BusinessException("پرداخت قبلاً برای این رزرو ثبت شده است", "PAYMENT_EXISTS");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING_PAYMENT) {
            throw new BusinessException("رزرو در انتظار پرداخت نیست", "INVALID_STATUS");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .reservationId(reservation.getId())
                .userId(reservation.getUserId())
                .clubId(reservation.getClubId())
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

        // Update reservation status
        reservation.setStatus(Reservation.ReservationStatus.PAID);
        reservationRepository.save(reservation);

        log.info("Payment recorded: {} for reservation {} by staff {}", 
                payment.getId(), reservation.getId(), recordedBy);

        return PaymentDto.from(payment);
    }

    @Transactional(readOnly = true)
    public List<PendingPaymentDto> getPendingPaymentsByClub(Long clubId) {
        List<Reservation> reservations = reservationRepository.findPendingPaymentsByClub(clubId);
        
        if (reservations.isEmpty()) {
            return List.of();
        }

        // Get unique session IDs and user IDs
        Set<Long> sessionIds = reservations.stream().map(Reservation::getSessionId).collect(Collectors.toSet());
        Set<Long> userIds = reservations.stream().map(Reservation::getUserId).collect(Collectors.toSet());

        // Fetch sessions, users, and club
        Map<Long, ClassSession> sessionMap = sessionRepository.findAllById(sessionIds).stream()
                .collect(Collectors.toMap(ClassSession::getId, s -> s));
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Club club = clubRepository.findById(clubId).orElse(null);

        return reservations.stream()
                .map(r -> {
                    ClassSession session = sessionMap.get(r.getSessionId());
                    User user = userMap.get(r.getUserId());
                    
                    return PendingPaymentDto.builder()
                            .reservationId(r.getId())
                            .userId(r.getUserId())
                            .userPhoneNumber(user != null ? user.getPhoneNumber() : null)
                            .userFullName(user != null ? user.getFullName() : null)
                            .sessionId(r.getSessionId())
                            .activityName(session != null && session.getActivity() != null 
                                    ? session.getActivity().getName() : null)
                            .sessionDate(session != null ? session.getSessionDate() : null)
                            .startTime(session != null ? session.getStartTime() : null)
                            .endTime(session != null ? session.getEndTime() : null)
                            .trainerName(session != null && session.getTrainer() != null 
                                    ? session.getTrainer().getFullName() : null)
                            .bookedAt(r.getBookedAt())
                            .clubId(clubId)
                            .clubName(club != null ? club.getName() : null)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PaymentHistoryDto> getPaymentHistory(Long clubId, String search, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByClubId(clubId, pageable);

        if (payments.isEmpty()) {
            return Page.empty(pageable);
        }

        // Get unique user IDs, reservation IDs, membership IDs
        Set<Long> userIds = payments.stream().map(Payment::getUserId).collect(Collectors.toSet());
        Set<Long> recordedByIds = payments.stream()
                .filter(p -> p.getRecordedBy() != null)
                .map(Payment::getRecordedBy)
                .collect(Collectors.toSet());
        userIds.addAll(recordedByIds);

        Set<Long> reservationIds = payments.stream()
                .filter(p -> p.getReservationId() != null)
                .map(Payment::getReservationId)
                .collect(Collectors.toSet());

        Set<Long> membershipIds = payments.stream()
                .filter(p -> p.getMembershipId() != null)
                .map(Payment::getMembershipId)
                .collect(Collectors.toSet());

        // Fetch related data
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Map<Long, Reservation> reservationMap = reservationIds.isEmpty() 
                ? Map.of()
                : reservationRepository.findAllById(reservationIds).stream()
                        .collect(Collectors.toMap(Reservation::getId, r -> r));

        Map<Long, UserMembership> membershipMap = membershipIds.isEmpty()
                ? Map.of()
                : userMembershipRepository.findAllById(membershipIds).stream()
                        .collect(Collectors.toMap(UserMembership::getId, m -> m));

        // Get session IDs from reservations
        Set<Long> sessionIds = reservationMap.values().stream()
                .map(Reservation::getSessionId)
                .collect(Collectors.toSet());

        Map<Long, ClassSession> sessionMap = sessionIds.isEmpty()
                ? Map.of()
                : sessionRepository.findAllById(sessionIds).stream()
                        .collect(Collectors.toMap(ClassSession::getId, s -> s));

        // Get plan IDs from memberships
        Set<Long> planIds = membershipMap.values().stream()
                .map(UserMembership::getPlanId)
                .collect(Collectors.toSet());

        Map<Long, MembershipPlan> planMap = planIds.isEmpty()
                ? Map.of()
                : membershipPlanRepository.findAllById(planIds).stream()
                        .collect(Collectors.toMap(MembershipPlan::getId, p -> p));

        return payments.map(payment -> {
            User user = userMap.get(payment.getUserId());
            User recordedByUser = payment.getRecordedBy() != null ? userMap.get(payment.getRecordedBy()) : null;

            String paymentType = payment.getMembershipId() != null ? "MEMBERSHIP" : "RESERVATION";
            String activityName = null;
            String planName = null;

            if (payment.getReservationId() != null) {
                Reservation reservation = reservationMap.get(payment.getReservationId());
                if (reservation != null) {
                    ClassSession session = sessionMap.get(reservation.getSessionId());
                    if (session != null && session.getActivity() != null) {
                        activityName = session.getActivity().getName();
                    }
                }
            }

            if (payment.getMembershipId() != null) {
                UserMembership membership = membershipMap.get(payment.getMembershipId());
                if (membership != null) {
                    MembershipPlan plan = planMap.get(membership.getPlanId());
                    if (plan != null) {
                        planName = plan.getName();
                    }
                }
            }

            return PaymentHistoryDto.builder()
                    .id(payment.getId())
                    .reservationId(payment.getReservationId())
                    .membershipId(payment.getMembershipId())
                    .userId(payment.getUserId())
                    .userFullName(user != null ? user.getFullName() : null)
                    .userPhone(user != null ? user.getPhoneNumber() : null)
                    .clubId(payment.getClubId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .method(payment.getMethod().name())
                    .referenceNumber(payment.getReferenceNumber())
                    .status(payment.getStatus().name())
                    .paidAt(payment.getPaidAt())
                    .recordedBy(payment.getRecordedBy())
                    .recordedByName(recordedByUser != null ? recordedByUser.getFullName() : null)
                    .notes(payment.getNotes())
                    .paymentType(paymentType)
                    .activityName(activityName)
                    .planName(planName)
                    .build();
        });
    }
}

