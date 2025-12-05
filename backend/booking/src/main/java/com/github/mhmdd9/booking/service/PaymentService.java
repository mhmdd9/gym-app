package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.auth.entity.User;
import com.github.mhmdd9.auth.repository.UserRepository;
import com.github.mhmdd9.booking.dto.PaymentDto;
import com.github.mhmdd9.booking.dto.PendingPaymentDto;
import com.github.mhmdd9.booking.dto.RecordPaymentRequest;
import com.github.mhmdd9.booking.entity.Payment;
import com.github.mhmdd9.booking.entity.Reservation;
import com.github.mhmdd9.booking.repository.PaymentRepository;
import com.github.mhmdd9.booking.repository.ReservationRepository;
import com.github.mhmdd9.club.entity.ClassSession;
import com.github.mhmdd9.club.entity.Club;
import com.github.mhmdd9.club.repository.ClassSessionRepository;
import com.github.mhmdd9.club.repository.ClubRepository;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional(readOnly = true)
    public Optional<PaymentDto> getPaymentByReservation(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .map(PaymentDto::from);
    }

    @Transactional
    public PaymentDto recordPayment(RecordPaymentRequest request, Long recordedBy) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", request.getReservationId()));

        // Check if payment already exists
        if (paymentRepository.findByReservationId(request.getReservationId()).isPresent()) {
            throw new BusinessException("Payment already recorded for this reservation", "PAYMENT_EXISTS");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING_PAYMENT) {
            throw new BusinessException("Reservation is not pending payment", "INVALID_STATUS");
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
}

