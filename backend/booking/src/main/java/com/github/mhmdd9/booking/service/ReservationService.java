package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.booking.dto.CreateReservationRequest;
import com.github.mhmdd9.booking.dto.ReservationDto;
import com.github.mhmdd9.booking.entity.Reservation;
import com.github.mhmdd9.booking.repository.ReservationRepository;
import com.github.mhmdd9.club.entity.ClassSession;
import com.github.mhmdd9.club.repository.ClassSessionRepository;
import com.github.mhmdd9.common.dto.PageResponse;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ConflictException;
import com.github.mhmdd9.common.exception.ForbiddenException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ClassSessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public PageResponse<ReservationDto> getMyReservations(Long userId, Pageable pageable) {
        Page<Reservation> reservations = reservationRepository.findByUserId(userId, pageable);
        return PageResponse.from(reservations, reservations.getContent().stream()
                .map(ReservationDto::from)
                .toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getActiveReservations(Long userId) {
        return reservationRepository.findActiveReservationsByUser(userId).stream()
                .map(ReservationDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ReservationDto> getClubReservations(Long clubId, Pageable pageable) {
        Page<Reservation> reservations = reservationRepository.findByClubId(clubId, pageable);
        return PageResponse.from(reservations, reservations.getContent().stream()
                .map(ReservationDto::from)
                .toList());
    }

    @Transactional(readOnly = true)
    public ReservationDto getReservationById(Long id, Long userId, boolean isStaff) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("رزرو", id));

        // Check ownership unless staff
        if (!isStaff && !reservation.getUserId().equals(userId)) {
            throw new ForbiddenException("شما اجازه مشاهده این رزرو را ندارید");
        }

        return ReservationDto.from(reservation);
    }

    @Transactional
    public ReservationDto createReservation(CreateReservationRequest request, Long userId) {
        // Check if already booked
        if (reservationRepository.existsByUserIdAndSessionId(userId, request.getSessionId())) {
            throw new ConflictException("شما قبلاً این جلسه را رزرو کرده‌اید");
        }

        // Get session with optimistic lock
        ClassSession session = sessionRepository.findByIdWithLock(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("جلسه", request.getSessionId()));

        // Check availability
        if (!session.hasAvailableSpots()) {
            throw new BusinessException("ظرفیت جلسه تکمیل شده است", "SESSION_FULL");
        }

        if (session.getStatus() != ClassSession.SessionStatus.SCHEDULED) {
            throw new BusinessException("این جلسه برای رزرو در دسترس نیست", "SESSION_UNAVAILABLE");
        }

        try {
            // Increment booked count
            session.incrementBookedCount();
            sessionRepository.save(session);

            // Create reservation
            Reservation reservation = Reservation.builder()
                    .userId(userId)
                    .sessionId(session.getId())
                    .clubId(session.getClub().getId())
                    .status(Reservation.ReservationStatus.PENDING_PAYMENT)
                    .bookedAt(LocalDateTime.now())
                    .build();

            reservation = reservationRepository.save(reservation);
            log.info("Reservation created: {} for user {} on session {}", 
                    reservation.getId(), userId, session.getId());

            return ReservationDto.from(reservation);

        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("جلسه توسط کاربر دیگری تغییر کرده. لطفاً دوباره تلاش کنید.");
        }
    }

    @Transactional
    public ReservationDto cancelReservation(Long id, Long userId, String reason, boolean isStaff) {
        Reservation reservation = reservationRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("رزرو", id));

        // Check ownership unless staff
        if (!isStaff && !reservation.getUserId().equals(userId)) {
            throw new ForbiddenException("شما اجازه لغو این رزرو را ندارید");
        }

        if (!reservation.canCancel()) {
            throw new BusinessException("این رزرو قابل لغو نیست", "CANNOT_CANCEL");
        }

        // Decrement booked count
        ClassSession session = sessionRepository.findById(reservation.getSessionId()).orElse(null);
        if (session != null) {
            session.decrementBookedCount();
            sessionRepository.save(session);
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancellationReason(reason);
        reservation = reservationRepository.save(reservation);

        log.info("Reservation cancelled: {} by user {}", id, userId);
        return ReservationDto.from(reservation);
    }

    @Transactional
    public ReservationDto checkIn(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("رزرو", id));

        if (!reservation.canCheckIn()) {
            throw new BusinessException("امکان ثبت ورود برای این رزرو وجود ندارد", "CANNOT_CHECK_IN");
        }

        reservation.setCheckedInAt(LocalDateTime.now());
        reservation = reservationRepository.save(reservation);

        log.info("Reservation checked in: {}", id);
        return ReservationDto.from(reservation);
    }
}

