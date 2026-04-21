package com.rtrom.backend.controller;

import com.rtrom.backend.dto.reservation.CreateReservationRequest;
import com.rtrom.backend.dto.reservation.ReservationResponse;
import com.rtrom.backend.dto.reservation.WalkInRequest;
import com.rtrom.backend.service.ReservationService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> createReservation(
        @Valid @RequestBody CreateReservationRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reservationService.createReservation(authentication.getName(), request));
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
    public ResponseEntity<ReservationResponse> createWalkIn(@Valid @RequestBody WalkInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reservationService.createWalkIn(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication authentication) {
        return ResponseEntity.ok(reservationService.getMyReservations(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getReservationsByDate(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reservationService.getReservationsByDate(date));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservationResponse> confirmReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id, Authentication authentication) {
        boolean adminAction = authentication.getAuthorities()
            .stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        return ResponseEntity.ok(
            reservationService.cancelReservation(id, authentication.getName(), adminAction)
        );
    }
}
