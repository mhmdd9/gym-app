package com.github.mhmdd9.booking.repository;

import com.github.mhmdd9.booking.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserId(Long userId);

    List<Attendance> findByMembershipId(Long membershipId);

    List<Attendance> findByClubIdAndCheckInTimeBetween(
            Long clubId,
            LocalDateTime startTime,
            LocalDateTime endTime);

    List<Attendance> findBySessionId(Long sessionId);

    @Query("SELECT COUNT(a) FROM Attendance a " +
           "WHERE a.membershipId = :membershipId")
    Long countByMembershipId(@Param("membershipId") Long membershipId);

    @Query("SELECT a FROM Attendance a " +
           "WHERE a.clubId = :clubId " +
           "AND a.checkInTime >= :startOfDay " +
           "AND a.checkInTime < :endOfDay " +
           "ORDER BY a.checkInTime DESC")
    List<Attendance> findTodayByClub(
            @Param("clubId") Long clubId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
}
