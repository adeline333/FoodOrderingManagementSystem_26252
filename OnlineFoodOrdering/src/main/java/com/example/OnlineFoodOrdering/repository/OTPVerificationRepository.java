package com.example.OnlineFoodOrdering.repository;

import com.example.OnlineFoodOrdering.entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Long> {
    Optional<OTPVerification> findByEmailAndOtpAndVerifiedFalse(String email, String otp);
    Optional<OTPVerification> findTopByEmailOrderByExpiryDateDesc(String email);
    void deleteByExpiryDateBefore(LocalDateTime date);
}