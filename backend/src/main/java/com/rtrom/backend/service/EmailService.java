package com.rtrom.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@luxeserve.com"); // Should match your mail username or domain
        message.setTo(toEmail);
        message.setSubject("Password Reset Request - LuxeServe");
        message.setText("Hello,\n\nYou have requested to reset your password. " +
                "Please use the following 6-digit verification code to reset your password:\n\n" +
                resetCode + "\n\nThis code will expire in 15 minutes.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Thanks,\nLuxeServe Team");
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (org.springframework.mail.MailException e) {
            System.err.println("Failed to send email to " + toEmail + ". " + e.getMessage());
            System.out.println("=========================================");
            System.out.println("FORGOT PASSWORD CODE FOR " + toEmail + ": " + resetCode);
            System.out.println("=========================================");
        }
    }
}
