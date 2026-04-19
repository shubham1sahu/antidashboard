package com.rtrom.backend.config;

import com.rtrom.backend.domain.model.Role;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@rtrom.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setFirstName("Restaurant");
                admin.setLastName("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Default admin user created: " + adminEmail);
            }
        };
    }
}
