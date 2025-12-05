package com.github.mhmdd9.booking.repository;

import com.github.mhmdd9.booking.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReservationId(Long reservationId);

    Optional<Payment> findByMembershipId(Long membershipId);

    Page<Payment> findByUserId(Long userId, Pageable pageable);

    Page<Payment> findByClubId(Long clubId, Pageable pageable);

    List<Payment> findByClubIdAndPaidAtBetween(Long clubId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.clubId = :clubId " +
           "AND p.status = 'PAID' AND p.paidAt BETWEEN :start AND :end")
    BigDecimal sumAmountByClubAndDateRange(
            @Param("clubId") Long clubId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}

