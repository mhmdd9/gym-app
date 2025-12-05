package com.github.mhmdd9.club.repository;

import com.github.mhmdd9.club.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    List<MembershipPlan> findByClubIdAndIsActiveTrue(Long clubId);

    List<MembershipPlan> findByClubId(Long clubId);

    @Query("SELECT mp FROM MembershipPlan mp " +
           "LEFT JOIN FETCH mp.activity " +
           "WHERE mp.club.id = :clubId AND mp.isActive = true")
    List<MembershipPlan> findActiveByClubWithActivity(@Param("clubId") Long clubId);

    @Query("SELECT mp FROM MembershipPlan mp " +
           "LEFT JOIN FETCH mp.activity " +
           "WHERE mp.club.id = :clubId")
    List<MembershipPlan> findAllByClubWithActivity(@Param("clubId") Long clubId);

    @Query("SELECT mp FROM MembershipPlan mp " +
           "LEFT JOIN FETCH mp.activity " +
           "WHERE mp.id = :id")
    MembershipPlan findByIdWithActivity(@Param("id") Long id);
}
