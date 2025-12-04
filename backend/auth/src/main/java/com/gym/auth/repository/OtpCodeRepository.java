package com.gym.auth.repository;

import com.gym.auth.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    @Query("SELECT o FROM OtpCode o WHERE o.phoneNumber = :phoneNumber " +
           "AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpCode> findLatestValidOtp(@Param("phoneNumber") String phoneNumber, 
                                         @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(o) FROM OtpCode o WHERE o.phoneNumber = :phoneNumber " +
           "AND o.createdAt > :since")
    long countByPhoneNumberSince(@Param("phoneNumber") String phoneNumber, 
                                 @Param("since") LocalDateTime since);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

