package com.github.mhmdd9.booking.repository;

import com.github.mhmdd9.booking.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT r FROM Reservation r WHERE r.id = :id")
    Optional<Reservation> findByIdWithLock(@Param("id") Long id);

    Page<Reservation> findByUserId(Long userId, Pageable pageable);

    List<Reservation> findByUserIdAndStatus(Long userId, Reservation.ReservationStatus status);

    Page<Reservation> findByClubId(Long clubId, Pageable pageable);

    List<Reservation> findBySessionId(Long sessionId);

    List<Reservation> findBySessionIdAndStatus(Long sessionId, Reservation.ReservationStatus status);

    boolean existsByUserIdAndSessionId(Long userId, Long sessionId);

    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId " +
           "AND r.status IN ('PENDING_PAYMENT', 'PAID') " +
           "ORDER BY r.bookedAt DESC")
    List<Reservation> findActiveReservationsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.sessionId = :sessionId " +
           "AND r.status IN ('PENDING_PAYMENT', 'PAID')")
    long countActiveReservationsBySession(@Param("sessionId") Long sessionId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'PENDING_PAYMENT' " +
           "AND r.bookedAt < :expiryTime")
    List<Reservation> findExpiredPendingReservations(@Param("expiryTime") LocalDateTime expiryTime);
}

