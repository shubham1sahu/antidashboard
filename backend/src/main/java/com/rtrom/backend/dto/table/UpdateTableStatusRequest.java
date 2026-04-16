package com.rtrom.backend.dto.table;

import com.rtrom.backend.domain.model.TableStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTableStatusRequest(
    @NotNull(message = "Status is required")
    TableStatus status
) {
}
