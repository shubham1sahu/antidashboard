package com.rtrom.backend.controller;

import com.rtrom.backend.dto.user.*;
import com.rtrom.backend.service.CustomerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {

    private final CustomerProfileService profileService;

    public CustomerProfileController(CustomerProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication.getName()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        profileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/preferences")
    public ResponseEntity<Void> updatePreferences(
            @RequestBody UpdatePreferencesRequest request,
            Authentication authentication
    ) {
        profileService.updatePreferences(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/notifications")
    public ResponseEntity<Void> updateNotifications(
            @RequestBody UpdateNotificationsRequest request,
            Authentication authentication
    ) {
        profileService.updateNotifications(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        profileService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/avatar")
    public ResponseEntity<Void> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws Exception {
        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        String avatarData = "data:" + file.getContentType() + ";base64," + base64Image;
        profileService.uploadAvatar(authentication.getName(), avatarData);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        profileService.deleteAccount(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
