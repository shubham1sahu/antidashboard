package com.rtrom.backend.controller;

import com.rtrom.backend.dto.user.CreateStaffRequest;
import com.rtrom.backend.dto.user.UpdateRoleRequest;
import com.rtrom.backend.dto.user.UserResponse;
import com.rtrom.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        String currentUsername = authentication.getName();
        userService.deleteUser(id, currentUsername);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/create-staff")
    public ResponseEntity<UserResponse> createStaffAccount(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(userService.createStaffAccount(request, passwordEncoder));
    }
}
