package com.rtrom.backend.dto.reservation;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateReservationRequest(
    @NotNull(message = "Table id is required")
    Long tableId,

    @NotNull(message = "Reservation date is required")
    @Future(message = "Reservation date must be in the future")
    LocalDate reservationDate,

    @NotNull(message = "Start time is required")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    LocalTime endTime,

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "Guest count must be at least 1")
    Integer guestCount,

    @Size(max = 500, message = "Special requests cannot exceed 500 characters")
    String specialRequests
) {
}
