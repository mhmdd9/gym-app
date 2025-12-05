package com.github.mhmdd9.club.repository;

import com.github.mhmdd9.club.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByClubIdAndIsActiveTrue(Long clubId);

    List<Schedule> findAllByClubId(Long clubId);

    @Query("SELECT s FROM Schedule s WHERE s.club.id = :clubId AND s.isActive = true " +
           "AND s.validFrom <= :date AND (s.validUntil IS NULL OR s.validUntil >= :date)")
    List<Schedule> findActiveSchedulesForDate(@Param("clubId") Long clubId, @Param("date") LocalDate date);

    List<Schedule> findByActivityId(Long activityId);
}
