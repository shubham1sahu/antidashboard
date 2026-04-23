package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.Reservation;
import com.rtrom.backend.domain.model.ReservationStatus;
import com.rtrom.backend.domain.model.RestaurantTable;
import com.rtrom.backend.domain.model.TableStatus;
import com.rtrom.backend.domain.model.Role;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.dto.reservation.CreateReservationRequest;
import com.rtrom.backend.dto.reservation.ReservationResponse;
import com.rtrom.backend.dto.reservation.WalkInRequest;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ConflictException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.ReservationRepository;
import com.rtrom.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReservationService {

    private static final EnumSet<ReservationStatus> ACTIVE_RESERVATION_STATUSES =
        EnumSet.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final TableService tableService;
    private final KitchenEventPublisher eventPublisher;

    public ReservationService(
        ReservationRepository reservationRepository,
        UserRepository userRepository,
        TableService tableService,
        KitchenEventPublisher eventPublisher
    ) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.tableService = tableService;
        this.eventPublisher = eventPublisher;
    }

    public ReservationResponse createReservation(String userEmail, CreateReservationRequest request) {
        validateReservationWindow(request);

        RestaurantTable table = tableService.getTableEntity(request.tableId());
        if (request.guestCount() > table.getCapacity()) {
            throw new BadRequestException("Guest count exceeds table capacity");
        }

        boolean hasConflict = reservationRepository.existsConflict(
            table.getId(),
            request.reservationDate(),
            request.startTime(),
            request.endTime(),
            ACTIVE_RESERVATION_STATUSES
        );
        if (hasConflict) {
            throw new ConflictException("Conflict: table already booked");
        }

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setTable(table);
        reservation.setReservationDate(request.reservationDate());
        reservation.setStartTime(request.startTime());
        reservation.setEndTime(request.endTime());
        reservation.setGuestCount(request.guestCount());
        reservation.setSpecialRequests(request.specialRequests());
        reservation.setStatus(ReservationStatus.PENDING);

        Reservation saved = reservationRepository.save(reservation);
        eventPublisher.publishGeneralUpdate("RESERVATION_CREATED");
        return ReservationResponse.from(saved);
    }

    public ReservationResponse confirmReservation(Long reservationId) {
        Reservation reservation = getReservationEntity(reservationId);
        ensureStatus(reservation, ReservationStatus.PENDING, "Only pending reservations can be confirmed");

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.getTable().setStatus(TableStatus.RESERVED);
        Reservation saved = reservationRepository.save(reservation);
        eventPublisher.publishGeneralUpdate("RESERVATION_CONFIRMED");
        return ReservationResponse.from(saved);
    }

    public ReservationResponse createWalkIn(WalkInRequest request) {
        RestaurantTable table = tableService.getTableEntity(request.getTableId());

        if (table.getStatus() != TableStatus.AVAILABLE) {
            throw new ConflictException("Table is not available for walk-in");
        }

        if (request.getGuestCount() > table.getCapacity()) {
            throw new BadRequestException("Guest count exceeds table capacity");
        }

        // Find or create a Walk-in user
        String email = "walkin@rtrom.com";
        User walkInUser = userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setFirstName("Walk-in");
            user.setLastName("Customer");
            user.setEmail(email);
            user.setPassword("NO_PASSWORD"); // System user
            user.setRole(Role.CUSTOMER);
            return userRepository.save(user);
        });

        Reservation reservation = new Reservation();
        reservation.setUser(walkInUser);
        reservation.setTable(table);
        reservation.setReservationDate(LocalDate.now());
        reservation.setStartTime(LocalTime.now());
        reservation.setEndTime(LocalTime.now().plusHours(2)); // Default 2 hours occupancy
        reservation.setGuestCount(request.getGuestCount());
        reservation.setSpecialRequests("Walk-in: " + (request.getCustomerName() != null ? request.getCustomerName() : "Anonymous"));
        reservation.setStatus(ReservationStatus.CONFIRMED);

        table.setStatus(TableStatus.OCCUPIED);

        Reservation saved = reservationRepository.save(reservation);
        eventPublisher.publishGeneralUpdate("WALK_IN_CREATED");
        return ReservationResponse.from(saved);
    }

    public ReservationResponse cancelReservation(Long reservationId, String userEmail, boolean adminAction) {
        Reservation reservation = getReservationEntity(reservationId);
        if (!adminAction && !reservation.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("Reservation does not belong to the authenticated user");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException("Reservation cannot be cancelled in its current status");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.getTable().setStatus(TableStatus.AVAILABLE);
        Reservation saved = reservationRepository.save(reservation);
        eventPublisher.publishGeneralUpdate("RESERVATION_CANCELLED");
        return ReservationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String userEmail) {
        return reservationRepository.findByUserEmailOrderByReservationDateDescStartTimeDesc(userEmail)
            .stream()
            .map(ReservationResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByReservationDateOrderByStartTimeAsc(date)
            .stream()
            .map(ReservationResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public Reservation getReservationEntity(Long reservationId) {
        return reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
    }

    private void validateReservationWindow(CreateReservationRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        LocalDate today = LocalDate.now();
        if (request.reservationDate().isBefore(today)) {
            throw new BadRequestException("Reservation date cannot be in the past");
        }
    }

    private void ensureStatus(Reservation reservation, ReservationStatus expected, String message) {
        if (reservation.getStatus() != expected) {
            throw new BadRequestException(message);
        }
    }
}
