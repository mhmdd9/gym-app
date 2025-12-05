package com.github.mhmdd9.booking.repository;

import com.github.mhmdd9.booking.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {

    List<UserMembership> findByUserId(Long userId);

    List<UserMembership> findByUserIdAndStatus(Long userId, UserMembership.MembershipStatus status);

    List<UserMembership> findByClubIdAndStatus(Long clubId, UserMembership.MembershipStatus status);

    List<UserMembership> findByClubId(Long clubId);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.userId = :userId " +
           "AND um.status = 'ACTIVE' " +
           "AND (um.endDate IS NULL OR um.endDate >= :today)")
    List<UserMembership> findActiveByUser(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.userId = :userId " +
           "AND um.clubId = :clubId " +
           "AND um.status = 'ACTIVE' " +
           "AND (um.endDate IS NULL OR um.endDate >= :today)")
    List<UserMembership> findActiveByUserAndClub(
            @Param("userId") Long userId,
            @Param("clubId") Long clubId,
            @Param("today") LocalDate today);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.userId = :userId " +
           "AND um.planId = :planId " +
           "AND um.status = 'ACTIVE' " +
           "AND (um.endDate IS NULL OR um.endDate >= :today)")
    Optional<UserMembership> findActiveByUserAndPlan(
            @Param("userId") Long userId,
            @Param("planId") Long planId,
            @Param("today") LocalDate today);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.status = 'ACTIVE' " +
           "AND um.endDate < :today")
    List<UserMembership> findExpiredMemberships(@Param("today") LocalDate today);

    List<UserMembership> findByPlanId(Long planId);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.planId = :planId " +
           "ORDER BY um.createdAt DESC")
    List<UserMembership> findByPlanIdOrderByCreatedAtDesc(@Param("planId") Long planId);
}
