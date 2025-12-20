package com.example.OnlineFoodOrdering.service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.OnlineFoodOrdering.dto.RegisterRequest;
import com.example.OnlineFoodOrdering.entity.Location;
import com.example.OnlineFoodOrdering.entity.OTPVerification;
import com.example.OnlineFoodOrdering.entity.PasswordResetToken;
import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.repository.LocationRepository;
import com.example.OnlineFoodOrdering.repository.OTPVerificationRepository;
import com.example.OnlineFoodOrdering.repository.PasswordResetTokenRepository;
import com.example.OnlineFoodOrdering.repository.UserRepository;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private OTPVerificationRepository otpRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User register(RegisterRequest request) {
        logger.info("Starting registration for email: {}", request.getEmail());
        
        // Validate request
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("First name is required");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Last name is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Email already registered: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        try {
            // Create new user
            User user = new User();
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmailVerified(false);
            
            // Convert String role to UserRole enum
            String roleStr = request.getRole();
            if (roleStr == null || roleStr.trim().isEmpty()) {
                roleStr = "CUSTOMER";
            }
            
            try {
                User.UserRole userRole = User.UserRole.valueOf(roleStr.toUpperCase().trim());
                user.setRole(userRole);
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid role '{}', defaulting to CUSTOMER", roleStr);
                user.setRole(User.UserRole.CUSTOMER);
            }

            // Set location if provided
            if (request.getLocationId() != null) {
                Location location = locationRepository.findById(request.getLocationId())
                    .orElse(null);
                if (location != null) {
                    user.setLocation(location);
                    logger.info("Set location for user: {}", location.getName());
                }
            }

            logger.info("Saving user: {}", user.getEmail());
            user = userRepository.save(user);
            logger.info("User saved with ID: {}", user.getId());

            // Generate and send OTP
            String otp = generateOTP();
            OTPVerification otpVerification = new OTPVerification(
                user.getEmail(),
                otp,
                LocalDateTime.now().plusMinutes(10),
                OTPVerification.OTPPurpose.EMAIL_VERIFICATION
            );
            otpRepository.save(otpVerification);
            logger.info("OTP generated for: {}", user.getEmail());

            // Try to send email, but don't fail registration if email fails
            try {
                emailService.sendOTPEmail(user.getEmail(), otp);
                logger.info("OTP email sent to: {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
                // Continue anyway - user can request resend
            }

            return user;
            
        } catch (Exception e) {
            logger.error("Registration failed for {}: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public void verifyOTP(String email, String otp) {
        logger.info("Verifying OTP for: {}", email);
        
        OTPVerification verification = otpRepository
            .findByEmailAndOtpAndVerifiedFalseAndPurpose(email.toLowerCase(), otp, OTPVerification.OTPPurpose.EMAIL_VERIFICATION)
            .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark this OTP as used
        verification.setVerified(true);
        otpRepository.save(verification);

        // Load user
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Set email verified flag
        user.setEmailVerified(true);
        userRepository.save(user);
        logger.info("Email verified for: {}", email);

        // Send welcome email
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } catch (Exception e) {
            logger.error("Failed to send welcome email: {}", e.getMessage());
        }
    }

    public void resendOTP(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification(
            email.toLowerCase(),
            otp,
            LocalDateTime.now().plusMinutes(10),
            OTPVerification.OTPPurpose.EMAIL_VERIFICATION
        );
        otpRepository.save(otpVerification);

        emailService.sendOTPEmail(email, otp);
        logger.info("OTP resent to: {}", email);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
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
        logger.info("Password reset initiated for: {}", email);
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
        logger.info("Password reset completed for user: {}", user.getEmail());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
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

    public void sendLoginOTP(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification(
            email.toLowerCase(),
            otp,
            LocalDateTime.now().plusMinutes(10),
            OTPVerification.OTPPurpose.LOGIN_VERIFICATION
        );
        otpRepository.save(otpVerification);

        emailService.sendLoginOTPEmail(email, otp);
        logger.info("Login OTP sent to: {}", email);
    }

    public void verifyLoginOTP(String email, String otp) {
        logger.info("Verifying login OTP for: {}", email);

        OTPVerification verification = otpRepository
            .findByEmailAndOtpAndVerifiedFalseAndPurpose(email.toLowerCase(), otp, OTPVerification.OTPPurpose.LOGIN_VERIFICATION)
            .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark this OTP as used
        verification.setVerified(true);
        otpRepository.save(verification);
        logger.info("Login OTP verified for: {}", email);
    }

    public void initiatePasswordResetOTP(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification(
            email.toLowerCase(),
            otp,
            LocalDateTime.now().plusMinutes(10),
            OTPVerification.OTPPurpose.PASSWORD_RESET
        );
        otpRepository.save(otpVerification);

        emailService.sendPasswordResetOTPEmail(email, otp);
        logger.info("Password reset OTP sent to: {}", email);
    }

    public void verifyPasswordResetOTP(String email, String otp) {
        logger.info("Verifying password reset OTP for: {}", email);

        OTPVerification verification = otpRepository
            .findByEmailAndOtpAndVerifiedFalseAndPurpose(email.toLowerCase(), otp, OTPVerification.OTPPurpose.PASSWORD_RESET)
            .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark this OTP as used
        verification.setVerified(true);
        otpRepository.save(verification);
        logger.info("Password reset OTP verified for: {}", email);
    }

    public void resetPasswordWithOTP(String email, String newPassword) {
        // Check if there's a verified password reset OTP for this email
        OTPVerification verification = otpRepository
            .findTopByEmailAndPurposeOrderByExpiryDateDesc(email.toLowerCase(), OTPVerification.OTPPurpose.PASSWORD_RESET)
            .orElseThrow(() -> new RuntimeException("No password reset OTP found"));

        if (!verification.isVerified()) {
            throw new RuntimeException("OTP not verified");
        }

        if (verification.getExpiryDate().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new RuntimeException("Password reset session expired. Please request a new OTP.");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Clean up the used OTP
        otpRepository.delete(verification);
        logger.info("Password reset with OTP completed for user: {}", user.getEmail());
    }
}