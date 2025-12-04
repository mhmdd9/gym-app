package com.gym.club.repository;

import com.gym.club.entity.ActivityDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityDefinitionRepository extends JpaRepository<ActivityDefinition, Long> {

    List<ActivityDefinition> findByClubIdAndIsActiveTrue(Long clubId);

    List<ActivityDefinition> findByClubIdAndCategoryAndIsActiveTrue(Long clubId, String category);

    List<ActivityDefinition> findByCategoryAndIsActiveTrue(String category);
}

