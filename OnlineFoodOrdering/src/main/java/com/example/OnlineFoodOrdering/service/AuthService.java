package com.example.OnlineFoodOrdering.service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.OnlineFoodOrdering.dto.RegisterRequest;
import com.example.OnlineFoodOrdering.entity.OTPVerification;
import com.example.OnlineFoodOrdering.entity.PasswordResetToken;
import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.repository.OTPVerificationRepository;
import com.example.OnlineFoodOrdering.repository.PasswordResetTokenRepository;
import com.example.OnlineFoodOrdering.repository.UserRepository;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPVerificationRepository otpRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        user = userRepository.save(user);

        // Generate and send OTP
        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification(
            user.getEmail(),
            otp,
            LocalDateTime.now().plusMinutes(10)
        );
        otpRepository.save(otpVerification);

        emailService.sendOTPEmail(user.getEmail(), otp);

        return user;
    }


    public void verifyOTP(String email, String otp) {
    
    OTPVerification verification = otpRepository
        .findByEmailAndOtpAndVerifiedFalse(email, otp)
        .orElseThrow(() -> new RuntimeException("Invalid OTP"));

    if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
        throw new RuntimeException("OTP has expired");
    }

    // Mark this OTP as used
    verification.setVerified(true);
    otpRepository.save(verification);

    // Load user
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // ✅ Set email verified flag
    user.setEmailVerified(true);

    // ✅ Save updated user
    userRepository.save(user);

    // Send welcome email
    emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
}

    // public void verifyOTP(String email, String otp) {
    //     OTPVerification verification = otpRepository.findByEmailAndOtpAndVerifiedFalse(email, otp)
    //         .orElseThrow(() -> new RuntimeException("Invalid OTP"));

    //     if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
    //         throw new RuntimeException("OTP has expired");
    //     }

    //     verification.setVerified(true);
    //     otpRepository.save(verification);

    //     // Update user's email verification status (add this field to User entity if needed)
    //     User user = userRepository.findByEmail(email)
    //         .orElseThrow(() -> new RuntimeException("User not found"));
        
    //     // Send welcome email
    //     emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
    // }

    public void resendOTP(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification(
            email,
            otp,
            LocalDateTime.now().plusMinutes(10)
        );
        otpRepository.save(otpVerification);

        emailService.sendOTPEmail(email, otp);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete any existing reset tokens for this user
        resetTokenRepository.findByUser(user).ifPresent(resetTokenRepository::delete);

        // Generate reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
            token,
            user,
            LocalDateTime.now().plusHours(1)
        );
        resetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void ensureEmailVerified(User user) {
    if (!user.isEmailVerified()) {
        throw new RuntimeException("Email not verified");
    }
}

}