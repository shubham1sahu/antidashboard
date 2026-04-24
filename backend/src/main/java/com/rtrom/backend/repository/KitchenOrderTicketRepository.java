package com.rtrom.backend.repository;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import com.rtrom.backend.domain.model.KitchenOrderTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenOrderTicketRepository extends JpaRepository<KitchenOrderTicket, Long> {

    @Query("SELECT k FROM KitchenOrderTicket k JOIN FETCH k.order o JOIN FETCH o.table t WHERE k.kitchenStatus = :status ORDER BY k.createdAt ASC")
    List<KitchenOrderTicket> findByKitchenStatusOrderByCreatedAtAsc(@Param("status") KitchenTicketStatus status);

    @Query("SELECT k FROM KitchenOrderTicket k JOIN FETCH k.order o JOIN FETCH o.table t ORDER BY k.createdAt ASC")
    List<KitchenOrderTicket> findAllByOrderByCreatedAtAsc();

    @Query("SELECT k FROM KitchenOrderTicket k JOIN FETCH k.order o JOIN FETCH o.table t WHERE k.createdAt >= :start AND k.createdAt <= :end ORDER BY k.createdAt ASC")
    List<KitchenOrderTicket> findAllByCreatedAtBetweenOrderByCreatedAtAsc(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT k FROM KitchenOrderTicket k JOIN FETCH k.order o JOIN FETCH o.table t WHERE k.kitchenStatus = :status AND k.createdAt >= :start AND k.createdAt <= :end ORDER BY k.createdAt ASC")
    List<KitchenOrderTicket> findByKitchenStatusAndCreatedAtBetweenOrderByCreatedAtAsc(@Param("status") KitchenTicketStatus status, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    Optional<KitchenOrderTicket> findByOrderId(Long orderId);

    @Query("SELECT k FROM KitchenOrderTicket k WHERE k.order.table.id = :tableId AND k.kitchenStatus != 'SERVED'")
    List<KitchenOrderTicket> findActiveTicketsByTableId(@Param("tableId") Long tableId);

    boolean existsByOrderIdAndKitchenStatusNot(Long orderId, KitchenTicketStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM KitchenOrderTicket k WHERE k.order.user.id = :userId")
    void deleteByOrderUserId(@Param("userId") Long userId);
}
