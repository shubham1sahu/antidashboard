package com.rtrom.backend.dto.reservation;

import com.rtrom.backend.domain.model.Reservation;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationResponse(
    Long id,
    Long tableId,
    String tableNumber,
    LocalDate reservationDate,
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    LocalTime startTime,
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm:ss")
    LocalTime endTime,
    Integer guestCount,
    String status,
    String specialRequests,
    LocalDateTime createdAt,
    ReservationUserSummary user
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
            reservation.getId(),
            reservation.getTable().getId(),
            reservation.getTable().getTableNumber(),
            reservation.getReservationDate(),
            reservation.getStartTime(),
            reservation.getEndTime(),
            reservation.getGuestCount(),
            reservation.getStatus().name(),
            reservation.getSpecialRequests(),
            reservation.getCreatedAt(),
            new ReservationUserSummary(
                reservation.getUser().getId(),
                reservation.getUser().getFirstName(),
                reservation.getUser().getLastName(),
                reservation.getUser().getEmail()
            )
        );
    }
}
