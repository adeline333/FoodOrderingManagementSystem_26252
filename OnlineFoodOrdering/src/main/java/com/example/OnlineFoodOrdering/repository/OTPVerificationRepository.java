package com.example.OnlineFoodOrdering.repository;

import com.example.OnlineFoodOrdering.entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Long> {
    Optional<OTPVerification> findByEmailAndOtpAndVerifiedFalse(String email, String otp);
    Optional<OTPVerification> findByEmailAndOtpAndVerifiedFalseAndPurpose(String email, String otp, OTPVerification.OTPPurpose purpose);
    Optional<OTPVerification> findTopByEmailOrderByExpiryDateDesc(String email);
    Optional<OTPVerification> findTopByEmailAndPurposeOrderByExpiryDateDesc(String email, OTPVerification.OTPPurpose purpose);
    void deleteByExpiryDateBefore(LocalDateTime date);
}