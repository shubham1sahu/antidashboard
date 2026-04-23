package com.rtrom.backend.controller;

import com.rtrom.backend.domain.model.Role;

public record RegisterRequest(
    String firstName,
    String lastName,
    String email,
    String password,
    Role role
) {
}
