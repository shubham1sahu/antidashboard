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

    public Order createOrder(CreateOrderRequest request, String userEmail) {
        RestaurantTable table = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Find the reservation for this table today.
        // If it's a customer, it MUST be their reservation.
        // If it's a waiter/admin, they can place order for any active reservation on this table.
        Reservation reservation = reservationRepository.findByTableIdAndStatus(table.getId(), ReservationStatus.CONFIRMED)
                .stream()
                .filter(r -> r.getReservationDate().equals(java.time.LocalDate.now()))
                .filter(r -> {
                    if (currentUser.getRole() == com.rtrom.backend.domain.model.Role.CUSTOMER) {
                        return r.getUser().getId().equals(currentUser.getId());
                    }
                    return true;
                })
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active confirmed reservation found for Table " + table.getTableNumber() + " associated with you today."));

        User user = reservation.getUser();
        if (currentUser.getRole() != com.rtrom.backend.domain.model.Role.CUSTOMER) {
            // If admin/waiter is placing order, use the customer's account for billing
            // but we might want to track who placed it. For now, following existing pattern.
        }

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

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        orderRepository.deleteById(orderId);
    }
}
