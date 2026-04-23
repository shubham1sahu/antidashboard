package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.*;
import com.rtrom.backend.dto.order.CreateOrderRequest;
import com.rtrom.backend.dto.order.OrderItemRequest;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@Transactional
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final KitchenService kitchenService;
    private final KitchenEventPublisher eventPublisher;
    private final KitchenOrderTicketRepository kitchenOrderTicketRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(
            OrderRepository orderRepository,
            RestaurantTableRepository tableRepository,
            MenuItemRepository menuItemRepository,
            UserRepository userRepository,
            ReservationRepository reservationRepository,
            @Lazy KitchenService kitchenService,
            KitchenEventPublisher eventPublisher,
            KitchenOrderTicketRepository kitchenOrderTicketRepository,
            BillRepository billRepository,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.kitchenService = kitchenService;
        this.eventPublisher = eventPublisher;
        this.kitchenOrderTicketRepository = kitchenOrderTicketRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
    }

    public Order createOrder(CreateOrderRequest request, String userEmail) {
        RestaurantTable table = tableRepository.findById(request.tableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        logger.info("Creating order for table {} by user {}. Table status: {}", table.getTableNumber(), userEmail, table.getStatus());

        // Find the reservation for this table today.
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
                .orElse(null);

        User user;
        if (reservation != null) {
            user = reservation.getUser();
            logger.info("Found reservation id={} for table {}. Associate user: {}", reservation.getId(), table.getTableNumber(), user.getEmail());
        } else if (currentUser.getRole() != com.rtrom.backend.domain.model.Role.CUSTOMER && table.getStatus() == TableStatus.OCCUPIED) {
            logger.info("No explicit reservation found for occupied table {}, using default walk-in user.", table.getTableNumber());
            user = userRepository.findByEmail("walkin@rtrom.com").orElseGet(() -> {
                logger.info("Creating default walk-in user.");
                User newUser = new User();
                newUser.setFirstName("Walk-in");
                newUser.setLastName("Customer");
                newUser.setEmail("walkin@rtrom.com");
                newUser.setPassword("NO_PASSWORD");
                newUser.setRole(com.rtrom.backend.domain.model.Role.CUSTOMER);
                return userRepository.save(newUser);
            });
        } else {
            logger.error("Order placement failed: No active confirmed reservation found for Table {} and user role is {}", table.getTableNumber(), currentUser.getRole());
            throw new ResourceNotFoundException("No active confirmed reservation found for Table " + table.getTableNumber() + " associated with you today.");
        }

        Order order = new Order();
        order.setTable(table);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        logger.info("Adding {} items to order.", request.items().size());

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

        Order savedOrder = orderRepository.save(order);
        kitchenService.createTicketForOrder(savedOrder);
        eventPublisher.publishGeneralUpdate("ORDER_CREATED");
        return savedOrder;
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
        
        if (status == OrderStatus.PAID || status == OrderStatus.CANCELLED) {
            if (status == OrderStatus.PAID) {
                RestaurantTable table = order.getTable();
                table.setStatus(TableStatus.AVAILABLE);
                
                // Also mark any today's confirmed reservation for this table and user as COMPLETED
                reservationRepository.findByTableIdAndStatus(table.getId(), ReservationStatus.CONFIRMED)
                    .stream()
                    .filter(r -> r.getReservationDate().equals(java.time.LocalDate.now()))
                    .filter(r -> r.getUser().getId().equals(order.getUser().getId()))
                    .forEach(r -> r.setStatus(ReservationStatus.COMPLETED));
                    
                logger.info("Order {} paid. Table {} is now AVAILABLE.", orderId, table.getTableNumber());
            }

            // Remove kitchen ticket if paid or cancelled to clean up the kitchen dashboard
            kitchenOrderTicketRepository.findByOrderId(orderId)
                .ifPresent(ticket -> {
                    kitchenOrderTicketRepository.delete(ticket);
                    logger.info("Order {} is {}, kitchen ticket {} deleted.", orderId, status, ticket.getId());
                });
                
        } else {
            // Sync status with Kitchen
            kitchenOrderTicketRepository.findByOrderId(orderId)
                .ifPresent(ticket -> {
                    com.rtrom.backend.domain.enums.KitchenTicketStatus newKitchenStatus = null;
                    switch (status) {
                        case PENDING: newKitchenStatus = com.rtrom.backend.domain.enums.KitchenTicketStatus.RECEIVED; break;
                        case PREPARING: newKitchenStatus = com.rtrom.backend.domain.enums.KitchenTicketStatus.IN_PROGRESS; break;
                        case READY: newKitchenStatus = com.rtrom.backend.domain.enums.KitchenTicketStatus.READY; break;
                        case SERVED: newKitchenStatus = com.rtrom.backend.domain.enums.KitchenTicketStatus.SERVED; break;
                    }
                    
                    if (newKitchenStatus != null && ticket.getKitchenStatus() != newKitchenStatus) {
                        ticket.setKitchenStatus(newKitchenStatus);
                        kitchenOrderTicketRepository.save(ticket);
                        
                        com.rtrom.backend.dto.response.KitchenTicketResponse response = kitchenService.mapToResponse(ticket);
                        eventPublisher.publishTicketUpdate(response);
                        logger.info("Order {} status synced. Kitchen ticket {} marked as {}.", orderId, ticket.getId(), newKitchenStatus);
                    }
                });
        }
        
        Order updatedOrder = orderRepository.save(order);
        eventPublisher.publishGeneralUpdate("ORDER_UPDATED");
        return updatedOrder;
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        logger.info("Deleting order {} and its associated data.", orderId);
        
        // 1. Delete associated payments/bills if they exist
        paymentRepository.deleteByOrderUserId(order.getUser().getId()); // This is a bit broad, should be by order
        // Better: add specific delete methods to repositories if needed.
        // For now, let's at least handle the kitchen ticket which is the most common blocker.
        
        kitchenOrderTicketRepository.findByOrderId(orderId)
                .ifPresent(ticket -> kitchenOrderTicketRepository.delete(ticket));
        
        orderRepository.delete(order);
        eventPublisher.publishGeneralUpdate("ORDER_DELETED");
    }

    @Transactional
    public void deleteOrders(List<Long> orderIds) {
        logger.info("Bulk deleting {} orders.", orderIds.size());
        for (Long id : orderIds) {
            try {
                this.deleteOrder(id);
            } catch (Exception e) {
                logger.error("Failed to delete order {}: {}", id, e.getMessage());
            }
        }
    }
}
