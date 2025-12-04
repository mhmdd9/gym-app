package com.github.mhmdd9.booking.service;

import com.github.mhmdd9.booking.dto.PaymentDto;
import com.github.mhmdd9.booking.dto.RecordPaymentRequest;
import com.github.mhmdd9.booking.entity.Payment;
import com.github.mhmdd9.booking.entity.Reservation;
import com.github.mhmdd9.booking.repository.PaymentRepository;
import com.github.mhmdd9.booking.repository.ReservationRepository;
import com.github.mhmdd9.common.exception.BusinessException;
import com.github.mhmdd9.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

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
}

