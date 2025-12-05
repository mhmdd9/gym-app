package com.github.mhmdd9.booking.controller;

import com.github.mhmdd9.auth.security.UserPrincipal;
import com.github.mhmdd9.booking.dto.PaymentDto;
import com.github.mhmdd9.booking.dto.PendingPaymentDto;
import com.github.mhmdd9.booking.dto.RecordPaymentRequest;
import com.github.mhmdd9.booking.service.PaymentService;
import com.github.mhmdd9.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Get payment for a reservation.
     */
    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentDto>> getPaymentByReservation(
            @PathVariable Long reservationId) {
        return paymentService.getPaymentByReservation(reservationId)
                .map(payment -> ResponseEntity.ok(ApiResponse.success(payment)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get pending payments for a club (staff only).
     */
    @GetMapping("/club/{clubId}/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<PendingPaymentDto>>> getPendingPayments(
            @PathVariable Long clubId) {
        List<PendingPaymentDto> pendingPayments = paymentService.getPendingPaymentsByClub(clubId);
        return ResponseEntity.ok(ApiResponse.success(pendingPayments));
    }

    /**
     * Record an on-site payment (staff only: receptionists can record payments).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GYM_OWNER', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PaymentDto>> recordPayment(
            @Valid @RequestBody RecordPaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentDto payment = paymentService.recordPayment(request, principal.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(payment, "Payment recorded successfully."));
    }
}

