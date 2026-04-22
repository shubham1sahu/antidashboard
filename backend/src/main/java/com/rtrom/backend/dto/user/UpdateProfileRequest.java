package com.rtrom.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record UpdateProfileRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank @Email String email,
    String phone,
    String countryCode,
    LocalDate dateOfBirth,
    String preferredLanguage
) {}
