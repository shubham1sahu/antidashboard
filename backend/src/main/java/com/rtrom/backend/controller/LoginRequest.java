package com.rtrom.backend.controller;

public record LoginRequest(
    String email,
    String password
) {
}
