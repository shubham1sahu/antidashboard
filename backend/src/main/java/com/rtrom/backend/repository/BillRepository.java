package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    @Modifying
    @Query("DELETE FROM Bill b WHERE b.order.user.id = :userId")
    void deleteByOrderUserId(@Param("userId") Long userId);
}
