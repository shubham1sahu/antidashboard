package com.rtrom.backend.config;

import com.rtrom.backend.domain.model.Role;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        return args -> {
            // Manually alter column if Hibernate failed to do so automatically
            try {
                jdbcTemplate.execute("ALTER TABLE menu_items ALTER COLUMN image_url TYPE TEXT");
                System.out.println("Database migration: Altered menu_items.image_url to TEXT");
            } catch (Exception e) {
                System.out.println("Database migration: Column already altered or table not yet created.");
            }

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
