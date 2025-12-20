package com.example.OnlineFoodOrdering.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
public class OTPVerification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String otp;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean verified = false;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = true) // Temporarily make nullable
    private OTPPurpose purpose = OTPPurpose.EMAIL_VERIFICATION;
    
    public enum OTPPurpose {
        EMAIL_VERIFICATION,
        LOGIN_VERIFICATION,
        PASSWORD_RESET
    }
    
    // Constructors
    public OTPVerification() {}
    
    public OTPVerification(String email, String otp, LocalDateTime expiryDate) {
        this.email = email;
        this.otp = otp;
        this.expiryDate = expiryDate;
        this.purpose = OTPPurpose.EMAIL_VERIFICATION;
    }
    
    public OTPVerification(String email, String otp, LocalDateTime expiryDate, OTPPurpose purpose) {
        this.email = email;
        this.otp = otp;
        this.expiryDate = expiryDate;
        this.purpose = purpose;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public OTPPurpose getPurpose() { return purpose; }
    public void setPurpose(OTPPurpose purpose) { this.purpose = purpose; }
}