package com.github.mhmdd9.club.repository;

import com.github.mhmdd9.club.entity.ActivityDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityDefinitionRepository extends JpaRepository<ActivityDefinition, Long> {

    List<ActivityDefinition> findByClubIdAndIsActiveTrue(Long clubId);

    List<ActivityDefinition> findByClubIdAndCategoryAndIsActiveTrue(Long clubId, String category);

    List<ActivityDefinition> findByCategoryAndIsActiveTrue(String category);

    List<ActivityDefinition> findAllByClubId(Long clubId);
}

