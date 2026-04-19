package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.*;
import com.rtrom.backend.dto.order.CreateOrderRequest;
import com.rtrom.backend.dto.order.OrderItemRequest;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    public OrderService(
            OrderRepository orderRepository,
            RestaurantTableRepository tableRepository,
            MenuItemRepository menuItemRepository,
            UserRepository userRepository,
            ReservationRepository reservationRepository
    ) {
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
    }

    public Order createOrder(CreateOrderRequest request) {
        RestaurantTable table = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        // Find the user associated with the table (the one who has an active reservation or walk-in)
        // For simplicity, we'll look for the latest confirmed/in-progress reservation for this table
        Reservation reservation = reservationRepository.findByTableIdAndStatus(table.getId(), ReservationStatus.CONFIRMED)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active reservation found for this table"));

        User user = reservation.getUser();

        Order order = new Order();
        order.setTable(table);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        for (OrderItemRequest itemReq : request.items()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.menuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemReq.menuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.quantity());
            orderItem.setUnitPrice(menuItem.getPrice());
            orderItem.setNotes(itemReq.notes());
            
            order.addItem(orderItem);
        }

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllWithDetails();
    }
}
