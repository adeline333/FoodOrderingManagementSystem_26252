package com.example.OnlineFoodOrdering.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@foodorder.com}")
    private String fromEmail;

    @Value("${app.name:FoodOrder}")
    private String appName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    private boolean sendViaResend(String toEmail, String subject, String htmlContent) {
        if (resendApiKey == null || resendApiKey.trim().isEmpty()) {
            return false;
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            Map<String, Object> body = new HashMap<>();
            body.put("from", appName + " <onboarding@resend.dev>");
            body.put("to", List.of(toEmail));
            body.put("subject", subject);
            body.put("html", htmlContent);

            String jsonPayload = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey.trim())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info("Email sent successfully via Resend API to: {}", toEmail);
                return true;
            } else {
                logger.warn("Resend API failed with status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            logger.warn("Failed to send email via Resend API: {}", e.getMessage());
            return false;
        }
    }

    @Async
    public void sendLoginOTPEmail(String toEmail, String otp) {
        String htmlContent = buildLoginOTPEmailTemplate(otp);
        String subject = "Login Verification Code - " + appName;
        if (sendViaResend(toEmail, subject, htmlContent)) {
            return;
        }

        if (mailSender == null) {
            logger.warn("Mail sender not configured. Login OTP for {}: {}", toEmail, otp);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Login OTP email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send login OTP email to {}: {}", toEmail, e.getMessage());
            logger.info("Login OTP for {} is: {}", toEmail, otp);
        } catch (Exception e) {
            logger.error("Unexpected error sending login OTP email: {}", e.getMessage());
            logger.info("Login OTP for {} is: {}", toEmail, otp);
        }
    }

    @Async
    public void sendOTPEmail(String toEmail, String otp) {
        String htmlContent = buildOTPEmailTemplate(otp);
        String subject = "Verify Your Email - " + appName;
        if (sendViaResend(toEmail, subject, htmlContent)) {
            return;
        }

        if (mailSender == null) {
            logger.warn("Mail sender not configured. OTP for {}: {}", toEmail, otp);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Log the OTP so you can manually verify during development
            logger.info("OTP for {} is: {}", toEmail, otp);
        } catch (Exception e) {
            logger.error("Unexpected error sending OTP email: {}", e.getMessage());
            logger.info("OTP for {} is: {}", toEmail, otp);
        }
    }

    @Async
    public void sendPasswordResetOTPEmail(String toEmail, String otp) {
        String htmlContent = buildPasswordResetOTPEmailTemplate(otp);
        String subject = "Password Reset Code - " + appName;
        if (sendViaResend(toEmail, subject, htmlContent)) {
            return;
        }

        if (mailSender == null) {
            logger.warn("Mail sender not configured. Password reset OTP for {}: {}", toEmail, otp);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Password reset OTP email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset OTP email to {}: {}", toEmail, e.getMessage());
            logger.info("Password reset OTP for {} is: {}", toEmail, otp);
        } catch (Exception e) {
            logger.error("Unexpected error sending password reset OTP email: {}", e.getMessage());
            logger.info("Password reset OTP for {} is: {}", toEmail, otp);
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured. Reset token for {}: {}", toEmail, resetToken);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - " + appName);

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmailTemplate(resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error sending password reset email: {}", e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured. Skipping welcome email for: {}", toEmail);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + appName);

            String htmlContent = buildWelcomeEmailTemplate(firstName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Welcome email sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error sending welcome email: {}", e.getMessage());
        }
    }

    private String buildOTPEmailTemplate(String otp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                        <p>Email Verification</p>
                    </div>
                    <div class="content">
                        <h2>Verify Your Email Address</h2>
                        <p>Thank you for registering! Please use the following OTP code to verify your email address:</p>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                        </div>
                        <p><strong>This code will expire in 10 minutes.</strong></p>
                        <p>If you didn't request this verification, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, appName, otp, appName);
    }

    private String buildPasswordResetOTPEmailTemplate(String otp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #dc2626; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                        <p>Password Reset Request</p>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>You requested to reset your password. Use the following OTP code to proceed:</p>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                        </div>
                        <p><strong>This code will expire in 10 minutes.</strong></p>
                        <p>If you didn't request this password reset, please ignore this email and consider changing your password.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, appName, otp, appName);
    }

    private String buildPasswordResetEmailTemplate(String resetLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                        <p>Password Reset Request</p>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, appName, resetLink, appName);
    }

    private String buildLoginOTPEmailTemplate(String otp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f97316 0%%, #ef4444 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #f97316; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                        <p>Login Verification</p>
                    </div>
                    <div class="content">
                        <h2>Complete Your Login</h2>
                        <p>Someone is trying to sign in to your account. Use the following OTP code to complete your login:</p>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                        </div>
                        <p><strong>This code will expire in 10 minutes.</strong></p>
                        <p>If you didn't attempt to log in, please ignore this email and consider changing your password.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, appName, otp, appName);
    }

    private String buildWelcomeEmailTemplate(String firstName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to %s!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi %s!</h2>
                        <p>Thank you for joining us. We're excited to have you on board!</p>
                        <p>Happy ordering!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, appName, firstName, appName);
    }
}