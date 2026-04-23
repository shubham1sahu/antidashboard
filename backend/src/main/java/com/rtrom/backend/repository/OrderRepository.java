package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.table LEFT JOIN FETCH o.user LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.menuItem")
    List<Order> findAllWithDetails();

    List<Order> findByTableIdAndStatusIn(Long tableId, java.util.Collection<com.rtrom.backend.domain.model.OrderStatus> statuses);

    List<Order> findByTableIdAndStatusNot(Long tableId, com.rtrom.backend.domain.model.OrderStatus status);

    List<Order> findByUserId(Long userId);

    void deleteByTableId(Long tableId);

    void deleteByUserId(Long userId);
}
