package com.gym.club.repository;

import com.gym.club.entity.ClassSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT cs FROM ClassSession cs WHERE cs.id = :id")
    Optional<ClassSession> findByIdWithLock(@Param("id") Long id);

    List<ClassSession> findByClubIdAndSessionDateAndStatus(
            Long clubId, 
            LocalDate sessionDate, 
            ClassSession.SessionStatus status
    );

    Page<ClassSession> findByClubIdAndSessionDateBetweenAndStatus(
            Long clubId,
            LocalDate startDate,
            LocalDate endDate,
            ClassSession.SessionStatus status,
            Pageable pageable
    );

    @Query("SELECT cs FROM ClassSession cs " +
           "JOIN FETCH cs.activity " +
           "LEFT JOIN FETCH cs.trainer " +
           "WHERE cs.club.id = :clubId " +
           "AND cs.sessionDate >= :startDate " +
           "AND cs.status = 'SCHEDULED' " +
           "ORDER BY cs.sessionDate, cs.startTime")
    List<ClassSession> findUpcomingSessionsByClub(
            @Param("clubId") Long clubId,
            @Param("startDate") LocalDate startDate
    );

    @Query("SELECT cs FROM ClassSession cs " +
           "JOIN FETCH cs.activity " +
           "JOIN FETCH cs.club " +
           "LEFT JOIN FETCH cs.trainer " +
           "WHERE cs.sessionDate = :date " +
           "AND cs.status = 'SCHEDULED' " +
           "AND cs.bookedCount < cs.capacity " +
           "ORDER BY cs.startTime")
    List<ClassSession> findAvailableSessionsByDate(@Param("date") LocalDate date);

    List<ClassSession> findByTrainerIdAndSessionDateBetween(
            Long trainerId,
            LocalDate startDate,
            LocalDate endDate
    );
}

