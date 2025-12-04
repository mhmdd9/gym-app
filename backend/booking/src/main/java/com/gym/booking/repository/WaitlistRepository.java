package com.gym.booking.repository;

import com.gym.booking.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    List<Waitlist> findBySessionIdAndStatusOrderByPositionAsc(Long sessionId, Waitlist.WaitlistStatus status);

    Optional<Waitlist> findByUserIdAndSessionId(Long userId, Long sessionId);

    boolean existsByUserIdAndSessionId(Long userId, Long sessionId);

    @Query("SELECT COALESCE(MAX(w.position), 0) FROM Waitlist w WHERE w.sessionId = :sessionId")
    int findMaxPositionBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT w FROM Waitlist w WHERE w.sessionId = :sessionId " +
           "AND w.status = 'WAITING' ORDER BY w.position ASC LIMIT 1")
    Optional<Waitlist> findFirstInWaitlist(@Param("sessionId") Long sessionId);

    @Modifying
    @Query("UPDATE Waitlist w SET w.status = 'EXPIRED' " +
           "WHERE w.status = 'NOTIFIED' AND w.expiresAt < :now")
    int expireNotifiedEntries(@Param("now") LocalDateTime now);
}

