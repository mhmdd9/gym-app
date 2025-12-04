package com.gym.club.repository;

import com.gym.club.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    List<Trainer> findByClubIdAndIsActiveTrue(Long clubId);

    Optional<Trainer> findByUserId(Long userId);

    boolean existsByUserIdAndClubId(Long userId, Long clubId);
}

