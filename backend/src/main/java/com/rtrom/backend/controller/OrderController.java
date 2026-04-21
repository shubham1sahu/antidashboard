package com.rtrom.backend.controller;

import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.dto.order.CreateOrderRequest;
import com.rtrom.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'CUSTOMER')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request, java.security.Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request, principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'KITCHEN_STAFF')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'KITCHEN_STAFF')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam com.rtrom.backend.domain.model.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
