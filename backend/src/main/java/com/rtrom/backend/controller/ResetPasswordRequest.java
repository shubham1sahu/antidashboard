package com.rtrom.backend.controller;

public record ResetPasswordRequest(String email, String code, String newPassword) {
}
