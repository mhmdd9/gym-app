package com.gym.booking.repository;

import com.gym.booking.entity.EntryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntryLogRepository extends JpaRepository<EntryLog, Long> {

    Page<EntryLog> findByUserId(Long userId, Pageable pageable);

    Page<EntryLog> findByClubId(Long clubId, Pageable pageable);

    List<EntryLog> findByClubIdAndEntryTimeBetween(Long clubId, LocalDateTime start, LocalDateTime end);

    Optional<EntryLog> findByReservationId(Long reservationId);

    @Query("SELECT COUNT(e) FROM EntryLog e WHERE e.clubId = :clubId " +
           "AND e.entryTime BETWEEN :start AND :end")
    long countEntriesByClubAndDateRange(
            @Param("clubId") Long clubId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}

