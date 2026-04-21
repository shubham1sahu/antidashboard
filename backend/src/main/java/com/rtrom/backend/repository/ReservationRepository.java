package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Reservation;
import com.rtrom.backend.domain.model.ReservationStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM Reservation r
        WHERE r.table.id = :tableId
          AND r.reservationDate = :date
          AND r.status IN :statuses
          AND :startTime < r.endTime
          AND :endTime > r.startTime
        """)
    boolean existsConflict(
        @Param("tableId") Long tableId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("statuses") Collection<ReservationStatus> statuses
    );

    @Query("""
        SELECT DISTINCT r.table.id
        FROM Reservation r
        WHERE r.reservationDate = :date
          AND r.status IN :statuses
          AND :startTime < r.endTime
          AND :endTime > r.startTime
        """)
    List<Long> findReservedTableIds(
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("statuses") Collection<ReservationStatus> statuses
    );

    List<Reservation> findByUserEmailOrderByReservationDateDescStartTimeDesc(String email);

    List<Reservation> findByReservationDateOrderByStartTimeAsc(LocalDate reservationDate);

    List<Reservation> findByTableIdAndStatus(Long tableId, ReservationStatus status);
    
    List<Reservation> findByUserId(Long userId);

    long countByUserEmail(String email);

    long countByUserEmailAndStatus(String email, ReservationStatus status);

    @Query("SELECT SUM(r.guestCount) FROM Reservation r WHERE r.user.email = :email AND r.status = 'COMPLETED'")
    Long sumGuestCountByUserEmail(@Param("email") String email);

    @Query("SELECT AVG(r.guestCount) FROM Reservation r WHERE r.user.email = :email AND r.status = 'COMPLETED'")
    Double avgGuestCountByUserEmail(@Param("email") String email);

    @Query(value = "SELECT t.table_number FROM reservations r JOIN restaurant_tables t ON r.table_id = t.id WHERE r.user_id = (SELECT id FROM users WHERE email = :email) GROUP BY t.table_number ORDER BY COUNT(r.id) DESC LIMIT 1", nativeQuery = true)
    String findFavoriteTableByUserEmail(@Param("email") String email);

    void deleteByTableId(Long tableId);

    void deleteByUserId(Long userId);
}
