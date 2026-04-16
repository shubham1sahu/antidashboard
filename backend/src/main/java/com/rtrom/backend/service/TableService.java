package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.ReservationStatus;
import com.rtrom.backend.domain.model.RestaurantTable;
import com.rtrom.backend.domain.model.TableStatus;
import com.rtrom.backend.dto.table.CreateTableRequest;
import com.rtrom.backend.dto.table.RestaurantTableResponse;
import com.rtrom.backend.dto.table.UpdateTableRequest;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.ReservationRepository;
import com.rtrom.backend.repository.RestaurantTableRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TableService {

    private static final EnumSet<ReservationStatus> ACTIVE_RESERVATION_STATUSES =
        EnumSet.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;

    public TableService(
        RestaurantTableRepository restaurantTableRepository,
        ReservationRepository reservationRepository
    ) {
        this.restaurantTableRepository = restaurantTableRepository;
        this.reservationRepository = reservationRepository;
    }

    public RestaurantTableResponse createTable(CreateTableRequest request) {
        validateUniqueTableNumber(request.tableNumber(), null);

        RestaurantTable table = new RestaurantTable();
        applyValues(table, request.tableNumber(), request.capacity(), request.status(), request.location(), request.floorNumber());
        return RestaurantTableResponse.from(restaurantTableRepository.save(table));
    }

    public RestaurantTableResponse updateTable(Long id, UpdateTableRequest request) {
        RestaurantTable table = getTableEntity(id);
        validateUniqueTableNumber(request.tableNumber(), id);
        applyValues(table, request.tableNumber(), request.capacity(), request.status(), request.location(), request.floorNumber());
        return RestaurantTableResponse.from(restaurantTableRepository.save(table));
    }

    public void deleteTable(Long id) {
        RestaurantTable table = getTableEntity(id);
        try {
            restaurantTableRepository.delete(table);
            restaurantTableRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Table cannot be deleted while reservations exist for it");
        }
    }

    @Transactional(readOnly = true)
    public List<RestaurantTableResponse> getAllTables() {
        return restaurantTableRepository.findAll()
            .stream()
            .map(RestaurantTableResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<RestaurantTableResponse> getAvailableTables(LocalDate date, LocalTime startTime, LocalTime endTime, Integer capacity) {
        if (capacity == null || capacity < 1) {
            throw new BadRequestException("Capacity must be at least 1");
        }
        if (endTime != null && !startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        LocalTime availabilityEnd = endTime == null ? startTime.plusHours(2) : endTime;
        List<Long> reservedTableIds = reservationRepository.findReservedTableIds(
            date,
            startTime,
            availabilityEnd,
            ACTIVE_RESERVATION_STATUSES
        );

        return restaurantTableRepository.findAll()
            .stream()
            .filter(table -> table.getCapacity() >= capacity)
            .filter(table -> !reservedTableIds.contains(table.getId()))
            .map(RestaurantTableResponse::from)
            .toList();
    }

    public RestaurantTableResponse updateStatus(Long id, TableStatus status) {
        RestaurantTable table = getTableEntity(id);
        table.setStatus(status);
        return RestaurantTableResponse.from(restaurantTableRepository.save(table));
    }

    public RestaurantTable getTableEntity(Long id) {
        return restaurantTableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));
    }

    private void validateUniqueTableNumber(String tableNumber, Long id) {
        boolean exists = id == null
            ? restaurantTableRepository.existsByTableNumberIgnoreCase(tableNumber)
            : restaurantTableRepository.existsByTableNumberIgnoreCaseAndIdNot(tableNumber, id);

        if (exists) {
            throw new BadRequestException("Table number already exists");
        }
    }

    private void applyValues(
        RestaurantTable table,
        String tableNumber,
        Integer capacity,
        TableStatus status,
        String location,
        Integer floorNumber
    ) {
        table.setTableNumber(tableNumber.trim());
        table.setCapacity(capacity);
        table.setStatus(status == null ? TableStatus.AVAILABLE : status);
        table.setLocation(location.trim());
        table.setFloorNumber(floorNumber);
    }
}
