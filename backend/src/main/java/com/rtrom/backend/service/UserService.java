package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.dto.user.UpdateRoleRequest;
import com.rtrom.backend.dto.user.UserResponse;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.OrderRepository;
import com.rtrom.backend.repository.ReservationRepository;
import com.rtrom.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;

    public UserService(UserRepository userRepository, OrderRepository orderRepository, ReservationRepository reservationRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse updateUserRole(Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
    }

    public void deleteUser(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getEmail().equals(currentUsername)) {
            throw new BadRequestException("You cannot delete your own account.");
        }

        try {
            logger.info("Attempting to delete user: {} (ID: {})", user.getEmail(), userId);
            
            // Delete associated data first to avoid integrity violations
            orderRepository.deleteByUserId(userId);
            reservationRepository.deleteByUserId(userId);
            
            userRepository.delete(user);
            userRepository.flush();
            logger.info("Successfully deleted user and associated data: {}", user.getEmail());
        } catch (Exception ex) {
            logger.error("Unexpected error deleting user {}: ", user.getEmail(), ex);
            throw ex;
        }
    }

    public UserResponse createStaffAccount(com.rtrom.backend.dto.user.CreateStaffRequest request, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already in use");
        }

        if (request.role() == com.rtrom.backend.domain.model.Role.CUSTOMER) {
            throw new BadRequestException("Only staff roles (WAITER, KITCHEN_STAFF, ADMIN) can be created via this endpoint.");
        }

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        return UserResponse.from(userRepository.save(user));
    }
}
