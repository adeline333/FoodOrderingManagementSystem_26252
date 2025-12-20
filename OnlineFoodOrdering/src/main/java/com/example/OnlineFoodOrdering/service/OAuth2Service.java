package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.User;
import com.example.OnlineFoodOrdering.entity.User.AuthProvider;
import com.example.OnlineFoodOrdering.repository.UserRepository;
import com.example.OnlineFoodOrdering.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuth2Service {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Service.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public User processGoogleAuth(String accessToken) {
        // Verify the token and get user info from Google
        Map<String, Object> userInfo = getGoogleUserInfo(accessToken);

        if (userInfo == null) {
            throw new RuntimeException("Failed to get user info from Google");
        }

        String email = (String) userInfo.get("email");
        String googleId = (String) userInfo.get("sub");
        String firstName = (String) userInfo.get("given_name");
        String lastName = (String) userInfo.get("family_name");
        Boolean emailVerified = (Boolean) userInfo.get("email_verified");

        if (email == null || googleId == null) {
            throw new RuntimeException("Invalid Google user data");
        }

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email.toLowerCase());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // If user registered with local auth, link the Google account
            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setProviderId(googleId);
                user.setEmailVerified(true);
                userRepository.save(user);
            }
            return user;
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(email.toLowerCase());
        newUser.setFirstName(firstName != null ? firstName : "User");
        newUser.setLastName(lastName != null ? lastName : "");
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setAuthProvider(AuthProvider.GOOGLE);
        newUser.setProviderId(googleId);
        newUser.setEmailVerified(emailVerified != null && emailVerified);
        newUser.setRole(User.UserRole.CUSTOMER);

        User savedUser = userRepository.save(newUser);
        logger.info("Created new user via Google OAuth: {}", email);

        return savedUser;
    }

    private Map<String, Object> getGoogleUserInfo(String accessToken) {
        try {
            String url = "https://www.googleapis.com/oauth2/v3/userinfo";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }

            logger.error("Failed to get Google user info: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            logger.error("Error getting Google user info: {}", e.getMessage());
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    public String generateJwtToken(User user) {
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}
