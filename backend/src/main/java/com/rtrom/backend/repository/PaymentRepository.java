package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.bill.sourceOrder.user.id = :userId")
    void deleteByOrderUserId(@Param("userId") Long userId);
}
