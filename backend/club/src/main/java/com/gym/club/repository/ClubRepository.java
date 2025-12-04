package com.gym.club.repository;

import com.gym.club.entity.Club;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByOwnerId(Long ownerId);

    Page<Club> findByIsActiveTrue(Pageable pageable);

    Page<Club> findByCityAndIsActiveTrue(String city, Pageable pageable);

    @Query("SELECT DISTINCT c.city FROM Club c WHERE c.isActive = true ORDER BY c.city")
    List<String> findDistinctCities();

    @Query("SELECT c FROM Club c WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.city) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Club> searchByNameOrCity(@Param("query") String query, Pageable pageable);
}

