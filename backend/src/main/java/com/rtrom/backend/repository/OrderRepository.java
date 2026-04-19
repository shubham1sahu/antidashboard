package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.table LEFT JOIN FETCH o.items")
    List<Order> findAllWithDetails();

    List<Order> findByTableIdAndStatusNot(Long tableId, com.rtrom.backend.domain.model.OrderStatus status);

    void deleteByTableId(Long tableId);

    void deleteByUserId(Long userId);
}
