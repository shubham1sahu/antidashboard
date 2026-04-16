package com.rtrom.backend.dto.error;

import java.time.LocalDateTime;

public record ApiErrorResponse(
    String error,
    int status,
    LocalDateTime timestamp
) {
}
