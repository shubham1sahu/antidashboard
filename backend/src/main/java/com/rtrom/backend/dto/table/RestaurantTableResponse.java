package com.rtrom.backend.dto.table;

import com.rtrom.backend.domain.model.RestaurantTable;
import java.time.LocalDateTime;

public record RestaurantTableResponse(
    Long id,
    String tableNumber,
    Integer capacity,
    String status,
    String location,
    Integer floorNumber,
    LocalDateTime createdAt
) {
    public static RestaurantTableResponse from(RestaurantTable table) {
        return new RestaurantTableResponse(
            table.getId(),
            table.getTableNumber(),
            table.getCapacity(),
            table.getStatus().name(),
            table.getLocation(),
            table.getFloorNumber(),
            table.getCreatedAt()
        );
    }
}
