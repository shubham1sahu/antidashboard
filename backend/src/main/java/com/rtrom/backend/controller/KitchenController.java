package com.rtrom.backend.controller;

import com.rtrom.backend.dto.response.KitchenTicketResponse;
import com.rtrom.backend.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    /**
     * GET /api/kitchen/orders
     * Optional query param: ?status=RECEIVED|IN_PROGRESS|READY|SERVED
     * Accessible by: ADMIN, KITCHEN_STAFF, WAITER
     */
    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF', 'WAITER')")
    public ResponseEntity<List<KitchenTicketResponse>> getAllTickets(
            @RequestParam(required = false) String status) {
        System.out.println("DEBUG: KitchenController.getAllTickets called");
        return ResponseEntity.ok(kitchenService.getAllTickets(status));
    }

    /**
     * GET /api/kitchen/orders/{id}
     * Accessible by: ADMIN, KITCHEN_STAFF, WAITER
     */
    @GetMapping("/orders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF', 'WAITER')")
    public ResponseEntity<KitchenTicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.getTicketById(id));
    }

    /**
     * PUT /api/kitchen/orders/{id}/start
     * Transitions: RECEIVED → IN_PROGRESS
     * Accessible by: ADMIN, KITCHEN_STAFF
     */
    @PutMapping("/orders/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> startCooking(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.startCooking(id));
    }

    /**
     * PUT /api/kitchen/orders/{id}/ready
     * Transitions: IN_PROGRESS → READY
     * Accessible by: ADMIN, KITCHEN_STAFF
     */
    @PutMapping("/orders/{id}/ready")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> markReady(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.markReady(id));
    }

    /**
     * PUT /api/kitchen/tickets/{id}/served
     * Transitions: READY → SERVED
     * Accessible by: ADMIN, WAITER
     * Note: This path matches the original scaffold spec exactly.
     */
    @PutMapping("/tickets/{id}/served")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAITER', 'ROLE_KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> markServed(@PathVariable Long id) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        System.out.println("DEBUG (served): User: " + auth.getName() + " Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(kitchenService.markServed(id));
    }

    /**
     * PUT /api/kitchen/orders/{id}/assign
     * Assigns a staff member to the ticket.
     * Accessible by: ADMIN, KITCHEN_STAFF
     */
    @PutMapping("/orders/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestParam String assignedTo) {
        return ResponseEntity.ok(kitchenService.assignTicket(id, assignedTo));
    }

    // ─── Legacy endpoints from original scaffold ─────────────────────────────
    // These preserve backward compatibility with the base scaffold endpoint paths.

    /**
     * GET /api/kitchen/tickets
     * Alias for /api/kitchen/orders — preserves original scaffold contract.
     */
    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF', 'WAITER')")
    public ResponseEntity<List<KitchenTicketResponse>> getAllTicketsAlias(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(kitchenService.getAllTickets(status));
    }

    /**
     * PUT /api/kitchen/tickets/{id}/start
     * Alias — preserves original scaffold contract.
     */
    @PutMapping("/tickets/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> startCookingAlias(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.startCooking(id));
    }

    /**
     * PUT /api/kitchen/tickets/{id}/ready
     * Alias — preserves original scaffold contract.
     */
    @PutMapping("/tickets/{id}/ready")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
    public ResponseEntity<KitchenTicketResponse> markReadyAlias(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.markReady(id));
    }
}
