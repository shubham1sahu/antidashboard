package com.rtrom.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rtrom.backend.domain.model.Reservation;
import com.rtrom.backend.domain.model.ReservationStatus;
import com.rtrom.backend.domain.model.RestaurantTable;
import com.rtrom.backend.domain.model.Role;
import com.rtrom.backend.domain.model.TableStatus;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.repository.ReservationRepository;
import com.rtrom.backend.repository.RestaurantTableRepository;
import com.rtrom.backend.repository.UserRepository;
import com.rtrom.backend.security.JwtTokenProvider;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EpicOneIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantTableRepository restaurantTableRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User admin;
    private User customer;
    private RestaurantTable table;

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        restaurantTableRepository.deleteAll();
        userRepository.deleteAll();

        admin = userRepository.save(buildUser("admin@rtrom.com", Role.ADMIN));
        customer = userRepository.save(buildUser("customer@rtrom.com", Role.CUSTOMER));
        table = restaurantTableRepository.save(buildTable("T-01", 4));
    }

    @Test
    void doubleBookingFails() throws Exception {
        reservationRepository.save(buildReservation(customer, table, ReservationStatus.PENDING));

        mockMvc.perform(post("/api/reservations")
                .header("Authorization", bearer(customer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "tableId", table.getId(),
                    "reservationDate", LocalDate.now().plusDays(1).toString(),
                    "startTime", "19:30:00",
                    "endTime", "20:30:00",
                    "guestCount", 2,
                    "specialRequests", "Window seat"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Conflict: table already booked"));
    }

    @Test
    void capacityOverflowFails() throws Exception {
        mockMvc.perform(post("/api/reservations")
                .header("Authorization", bearer(customer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "tableId", table.getId(),
                    "reservationDate", LocalDate.now().plusDays(2).toString(),
                    "startTime", "19:00:00",
                    "endTime", "20:00:00",
                    "guestCount", 6,
                    "specialRequests", "Birthday"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Guest count exceeds table capacity"));
    }

    @Test
    void validReservationWorks() throws Exception {
        mockMvc.perform(post("/api/reservations")
                .header("Authorization", bearer(customer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "tableId", table.getId(),
                    "reservationDate", LocalDate.now().plusDays(2).toString(),
                    "startTime", "18:00:00",
                    "endTime", "19:00:00",
                    "guestCount", 4,
                    "specialRequests", "Anniversary"
                ))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.tableId").value(table.getId().intValue()))
            .andExpect(jsonPath("$.user.email").value(customer.getEmail()));
    }

    @Test
    void cancelResetsTable() throws Exception {
        Reservation reservation = reservationRepository.save(buildReservation(customer, table, ReservationStatus.PENDING));

        mockMvc.perform(put("/api/reservations/{id}/confirm", reservation.getId())
                .header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mockMvc.perform(put("/api/reservations/{id}/cancel", reservation.getId())
                .header("Authorization", bearer(customer)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        RestaurantTable updatedTable = restaurantTableRepository.findById(table.getId()).orElseThrow();
        Reservation updatedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();

        org.assertj.core.api.Assertions.assertThat(updatedTable.getStatus()).isEqualTo(TableStatus.AVAILABLE);
        org.assertj.core.api.Assertions.assertThat(updatedReservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
    }

    @Test
    void confirmUpdatesStatus() throws Exception {
        Reservation reservation = reservationRepository.save(buildReservation(customer, table, ReservationStatus.PENDING));

        mockMvc.perform(put("/api/reservations/{id}/confirm", reservation.getId())
                .header("Authorization", bearer(admin)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMED"));

        RestaurantTable updatedTable = restaurantTableRepository.findById(table.getId()).orElseThrow();
        Reservation updatedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();

        org.assertj.core.api.Assertions.assertThat(updatedTable.getStatus()).isEqualTo(TableStatus.RESERVED);
        org.assertj.core.api.Assertions.assertThat(updatedReservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void unauthorizedBlocked() throws Exception {
        mockMvc.perform(get("/api/reservations")
                .header("Authorization", bearer(customer))
                .param("date", LocalDate.now().plusDays(1).toString()))
            .andExpect(status().isForbidden());
    }

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user.getEmail(), user.getRole());
    }

    private User buildUser(String email, Role role) {
        User user = new User();
        user.setFirstName(role.name());
        user.setLastName("User");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(role);
        return user;
    }

    private RestaurantTable buildTable(String tableNumber, int capacity) {
        RestaurantTable restaurantTable = new RestaurantTable();
        restaurantTable.setTableNumber(tableNumber);
        restaurantTable.setCapacity(capacity);
        restaurantTable.setLocation("Main hall");
        restaurantTable.setFloorNumber(1);
        restaurantTable.setStatus(TableStatus.AVAILABLE);
        return restaurantTable;
    }

    private Reservation buildReservation(User user, RestaurantTable restaurantTable, ReservationStatus status) {
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setTable(restaurantTable);
        reservation.setReservationDate(LocalDate.now().plusDays(1));
        reservation.setStartTime(LocalTime.of(19, 0));
        reservation.setEndTime(LocalTime.of(20, 0));
        reservation.setGuestCount(2);
        reservation.setStatus(status);
        reservation.setSpecialRequests("Quiet corner");
        return reservation;
    }
}
