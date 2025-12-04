package com.github.mhmdd9.auth.repository;

import com.github.mhmdd9.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.phoneNumber = :phoneNumber")
    Optional<User> findByPhoneNumberWithRoles(@Param("phoneNumber") String phoneNumber);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    Page<User> findAllWithRoles(Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles " +
           "WHERE LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}

