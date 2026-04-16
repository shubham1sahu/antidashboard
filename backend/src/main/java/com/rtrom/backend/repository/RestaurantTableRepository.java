package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    boolean existsByTableNumberIgnoreCase(String tableNumber);

    boolean existsByTableNumberIgnoreCaseAndIdNot(String tableNumber, Long id);

    Optional<RestaurantTable> findByTableNumberIgnoreCase(String tableNumber);
}
