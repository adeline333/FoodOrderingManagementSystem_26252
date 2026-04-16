package com.example.OnlineFoodOrdering.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.OnlineFoodOrdering.security.JwtRequestFilter;
import com.example.OnlineFoodOrdering.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;


    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // ========== PUBLIC ENDPOINTS ==========
                // Auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                // Global Search - public access
                .requestMatchers("/api/search/**").permitAll()
                
                // Restaurants - GET is public (browse), POST/PUT/DELETE require auth
                .requestMatchers(HttpMethod.GET, "/api/restaurants/**").permitAll()
                
                // Menu Items - GET is public (browse), POST/PUT/DELETE require auth
                .requestMatchers(HttpMethod.GET, "/api/menu-items/**").permitAll()
                
                // Locations - GET is public
                .requestMatchers(HttpMethod.GET, "/api/locations/**").permitAll()
                
                // ========== ADMIN ONLY ENDPOINTS ==========
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ========== RESTAURANT OWNER ENDPOINTS ==========
                .requestMatchers(HttpMethod.POST, "/api/restaurants/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/restaurants/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/restaurants/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                
                .requestMatchers(HttpMethod.POST, "/api/menu-items/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/menu-items/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/menu-items/**").hasAnyRole("ADMIN", "RESTAURANT_OWNER")
                
                // ========== AUTHENTICATED ENDPOINTS ==========
                // Orders - require authentication (GET, POST, PUT, PATCH, DELETE)
                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").authenticated()
                
                // Payments - require authentication
                .requestMatchers("/api/payments/**").authenticated()
                
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
    frontendUrl,"http://localhost:5173",
"http://localhost:5174"
));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}