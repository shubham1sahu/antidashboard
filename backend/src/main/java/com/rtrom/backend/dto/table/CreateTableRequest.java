package com.rtrom.backend.dto.table;

import com.rtrom.backend.domain.model.TableStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTableRequest(
    @NotBlank(message = "Table number is required")
    String tableNumber,

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity,

    TableStatus status,

    @NotBlank(message = "Location is required")
    String location,

    @NotNull(message = "Floor number is required")
    Integer floorNumber
) {
}
