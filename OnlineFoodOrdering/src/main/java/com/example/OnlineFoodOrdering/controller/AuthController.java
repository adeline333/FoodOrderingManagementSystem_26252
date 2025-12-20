package com.example.OnlineFoodOrdering.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.OnlineFoodOrdering.dto.AuthResponse;
import com.example.OnlineFoodOrdering.dto.GoogleAuthRequest;
import com.example.OnlineFoodOrdering.dto.LoginRequest;
import com.example.OnlineFoodOrdering.dto.MessageResponse;
import com.example.OnlineFoodOrdering.dto.OTPRequest;
import com.example.OnlineFoodOrdering.dto.PasswordResetRequest;
import com.example.OnlineFoodOrdering.dto.RegisterRequest;
import com.example.OnlineFoodOrdering.dto.UserDTO;
import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.security.JwtUtil;
import com.example.OnlineFoodOrdering.service.AuthService;
import com.example.OnlineFoodOrdering.service.OAuth2Service;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthService authService;

    @Autowired
    private OAuth2Service oAuth2Service;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Invalid email or password"));
        }

        final User user = authService.getUserByEmail(loginRequest.getEmail());

        // Check if email is verified
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Please verify your email first"));
        }

        // Send OTP for 2FA login verification
        try {
            authService.sendLoginOTP(user.getEmail());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Failed to send OTP. Please try again."));
        }

        // Return response indicating OTP was sent (don't send token yet)
        return ResponseEntity.ok(new MessageResponse("OTP sent to your email. Please verify to complete login."));
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOTP(@Valid @RequestBody OTPRequest otpRequest) {
        try {
            authService.verifyLoginOTP(otpRequest.getEmail(), otpRequest.getOtp());

            final User user = authService.getUserByEmail(otpRequest.getEmail());
            final String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Registration successful. Please verify your email."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody OTPRequest otpRequest) {
        try {
            authService.verifyOTP(otpRequest.getEmail(), otpRequest.getOtp());
            return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestBody OTPRequest otpRequest) {
        try {
            authService.resendOTP(otpRequest.getEmail());
            return ResponseEntity.ok(new MessageResponse("OTP sent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody OTPRequest request) {
        try {
            authService.initiatePasswordReset(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Password reset link sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password-otp")
    public ResponseEntity<?> forgotPasswordOTP(@RequestBody OTPRequest request) {
        try {
            authService.initiatePasswordResetOTP(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("OTP sent to your email for password reset"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-password-reset-otp")
    public ResponseEntity<?> verifyPasswordResetOTP(@Valid @RequestBody OTPRequest otpRequest) {
        try {
            authService.verifyPasswordResetOTP(otpRequest.getEmail(), otpRequest.getOtp());
            return ResponseEntity.ok(new MessageResponse("OTP verified. You can now reset your password."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password-otp")
    public ResponseEntity<?> resetPasswordWithOTP(@Valid @RequestBody PasswordResetRequest request) {
        try {
            authService.resetPasswordWithOTP(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password reset successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractUsername(token);
            User user = authService.getUserByEmail(email);
            return ResponseEntity.ok(new UserDTO(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Invalid token"));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            User user = oAuth2Service.processGoogleAuth(request.getAccessToken());
            String token = oAuth2Service.generateJwtToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Google authentication failed: " + e.getMessage()));
        }
    }
}