package com.rtrom.backend.dto.reservation;

public record ReservationUserSummary(
    Long id,
    String firstName,
    String lastName,
    String email
) {
}
