package com.rtrom.backend.controller;

public record AuthResponse(
    String token,
    String role
) {
}
