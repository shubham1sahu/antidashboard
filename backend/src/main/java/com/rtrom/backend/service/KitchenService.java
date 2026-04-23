package com.rtrom.backend.service;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import com.rtrom.backend.domain.model.KitchenOrderTicket;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.dto.response.KitchenTicketResponse;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.KitchenOrderTicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KitchenService {
    private static final Logger log = LoggerFactory.getLogger(KitchenService.class);

    private final KitchenOrderTicketRepository kitchenTicketRepository;
    private final com.rtrom.backend.repository.OrderRepository orderRepository;
    private final KitchenEventPublisher kitchenEventPublisher;

    public KitchenService(
            KitchenOrderTicketRepository kitchenTicketRepository,
            com.rtrom.backend.repository.OrderRepository orderRepository,
            KitchenEventPublisher kitchenEventPublisher
    ) {
        this.kitchenTicketRepository = kitchenTicketRepository;
        this.orderRepository = orderRepository;
        this.kitchenEventPublisher = kitchenEventPublisher;
    }

    /**
     * Called internally by OrderService after an order is placed.
     * Creates a KitchenOrderTicket with status RECEIVED.
     * This is NOT a public API endpoint — it is called programmatically.
     */
    @Transactional
    public KitchenOrderTicket createTicketForOrder(Order order) {
        if (kitchenTicketRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BadRequestException("Kitchen ticket already exists for order ID: " + order.getId());
        }

        KitchenOrderTicket ticket = KitchenOrderTicket.builder()
                .order(order)
                .kitchenStatus(KitchenTicketStatus.RECEIVED)
                .build();

        KitchenOrderTicket saved = kitchenTicketRepository.save(ticket);
        log.info("Created kitchen ticket id={} for orderId={}", saved.getId(), order.getId());

        KitchenTicketResponse response = mapToResponse(saved);
        kitchenEventPublisher.publishTicketUpdate(response);
        kitchenEventPublisher.publishTableOrderUpdate(order.getTable().getId(), response);

        return saved;
    }

    /**
     * GET /api/kitchen/orders
     * Returns all kitchen tickets ordered by creation time ascending.
     * Optional filter by status query param.
     */
    @Transactional(readOnly = true)
    public List<KitchenTicketResponse> getAllTickets(String statusFilter) {
        List<KitchenOrderTicket> tickets;

        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                KitchenTicketStatus status = KitchenTicketStatus.valueOf(statusFilter.toUpperCase());
                tickets = kitchenTicketRepository.findByKitchenStatusOrderByCreatedAtAsc(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid kitchen status filter: " + statusFilter);
            }
        } else {
            tickets = kitchenTicketRepository.findAllByOrderByCreatedAtAsc();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * GET /api/kitchen/orders/{id}
     * Returns a single ticket by its ticket ID.
     */
    @Transactional(readOnly = true)
    public KitchenTicketResponse getTicketById(Long ticketId) {
        KitchenOrderTicket ticket = findTicketById(ticketId);
        return mapToResponse(ticket);
    }

    /**
     * PUT /api/kitchen/orders/{id}/start
     * Transitions ticket from RECEIVED → IN_PROGRESS.
     * Sets startedAt timestamp.
     */
    @Transactional
    public KitchenTicketResponse startCooking(Long ticketId) {
        KitchenOrderTicket ticket = findTicketById(ticketId);

        if (ticket.getKitchenStatus() != KitchenTicketStatus.RECEIVED) {
            throw new BadRequestException(
                "Cannot start cooking. Ticket is currently in status: " + ticket.getKitchenStatus()
            );
        }

        ticket.setKitchenStatus(KitchenTicketStatus.IN_PROGRESS);
        ticket.setStartedAt(LocalDateTime.now());

        KitchenOrderTicket saved = kitchenTicketRepository.save(ticket);
        
        // Sync Order status
        Order order = saved.getOrder();
        order.setStatus(com.rtrom.backend.domain.model.OrderStatus.PREPARING);
        order.setAssignedTo(saved.getAssignedTo());
        order.setEstimatedMinutes(saved.getEstimatedMinutes());
        orderRepository.save(order);

        KitchenTicketResponse response = mapToResponse(saved);

        kitchenEventPublisher.publishTicketUpdate(response);
        kitchenEventPublisher.publishTableOrderUpdate(order.getTable().getId(), response);
        kitchenEventPublisher.publishGeneralUpdate("ORDER_STATUS_UPDATED");

        log.info("Ticket id={} moved to IN_PROGRESS. Order status set to PREPARING.", ticketId);
        return response;
    }

    /**
     * PUT /api/kitchen/orders/{id}/ready
     * Transitions ticket from IN_PROGRESS → READY.
     * Sets completedAt timestamp.
     */
    @Transactional
    public KitchenTicketResponse markReady(Long ticketId) {
        KitchenOrderTicket ticket = findTicketById(ticketId);

        if (ticket.getKitchenStatus() != KitchenTicketStatus.IN_PROGRESS) {
            throw new BadRequestException(
                "Cannot mark ready. Ticket is currently in status: " + ticket.getKitchenStatus()
            );
        }

        ticket.setKitchenStatus(KitchenTicketStatus.READY);
        ticket.setCompletedAt(LocalDateTime.now());

        KitchenOrderTicket saved = kitchenTicketRepository.save(ticket);
        
        // Sync Order status
        Order order = saved.getOrder();
        order.setStatus(com.rtrom.backend.domain.model.OrderStatus.READY);
        order.setAssignedTo(saved.getAssignedTo());
        order.setEstimatedMinutes(saved.getEstimatedMinutes());
        orderRepository.save(order);

        KitchenTicketResponse response = mapToResponse(saved);

        kitchenEventPublisher.publishTicketUpdate(response);
        kitchenEventPublisher.publishTableOrderUpdate(order.getTable().getId(), response);
        kitchenEventPublisher.publishGeneralUpdate("ORDER_STATUS_UPDATED");

        log.info("Ticket id={} moved to READY. Order status set to READY.", ticketId);
        return response;
    }

    /**
     * PUT /api/kitchen/tickets/{id}/served  (existing endpoint from base scaffold)
     * Transitions ticket from READY → SERVED.
     * Called by WAITER role.
     */
    @Transactional
    public KitchenTicketResponse markServed(Long ticketId) {
        KitchenOrderTicket ticket = findTicketById(ticketId);

        if (ticket.getKitchenStatus() != KitchenTicketStatus.READY) {
            throw new BadRequestException(
                "Cannot mark served. Ticket is currently in status: " + ticket.getKitchenStatus()
            );
        }

        ticket.setKitchenStatus(KitchenTicketStatus.SERVED);

        KitchenOrderTicket saved = kitchenTicketRepository.save(ticket);
        
        // Sync Order status
        Order order = saved.getOrder();
        order.setStatus(com.rtrom.backend.domain.model.OrderStatus.SERVED);
        orderRepository.save(order);

        KitchenTicketResponse response = mapToResponse(saved);

        kitchenEventPublisher.publishTicketUpdate(response);
        kitchenEventPublisher.publishTableOrderUpdate(order.getTable().getId(), response);
        kitchenEventPublisher.publishGeneralUpdate("ORDER_STATUS_UPDATED");

        log.info("Ticket id={} moved to SERVED. Order status set to SERVED.", ticketId);
        return response;
    }

    /**
     * PUT /api/kitchen/orders/{id}/assign
     * Assigns a staff member name to the ticket.
     */
    @Transactional
    public KitchenTicketResponse assignTicket(Long ticketId, String assignedTo) {
        KitchenOrderTicket ticket = findTicketById(ticketId);
        ticket.setAssignedTo(assignedTo);
        KitchenOrderTicket saved = kitchenTicketRepository.save(ticket);
        
        // Sync to Order
        Order order = saved.getOrder();
        order.setAssignedTo(saved.getAssignedTo());
        orderRepository.save(order);

        KitchenTicketResponse response = mapToResponse(saved);
        kitchenEventPublisher.publishTicketUpdate(response);
        kitchenEventPublisher.publishGeneralUpdate("KITCHEN_ASSIGNMENT_UPDATED");
        return response;
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private KitchenOrderTicket findTicketById(Long ticketId) {
        return kitchenTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Kitchen ticket not found with id: " + ticketId));
    }

    /**
     * Maps a KitchenOrderTicket entity to KitchenTicketResponse DTO.
     * Ensures order items, table number, and all relevant fields are populated.
     */
    public KitchenTicketResponse mapToResponse(KitchenOrderTicket ticket) {
        Order order = ticket.getOrder();

        List<KitchenTicketResponse.KitchenOrderItemDetail> itemDetails = order.getItems()
                .stream()
                .map(oi -> KitchenTicketResponse.KitchenOrderItemDetail.builder()
                        .orderItemId(oi.getId())
                        .itemName(oi.getMenuItem().getName())
                        .quantity(oi.getQuantity())
                        .customizationNotes(oi.getNotes())
                        .isVegetarian(oi.getMenuItem().getIsVegetarian())
                        .build())
                .collect(Collectors.toList());

        return KitchenTicketResponse.builder()
                .ticketId(ticket.getId())
                .orderId(order.getId())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .kitchenStatus(ticket.getKitchenStatus())
                .assignedTo(ticket.getAssignedTo())
                .startedAt(ticket.getStartedAt())
                .completedAt(ticket.getCompletedAt())
                .estimatedMinutes(ticket.getEstimatedMinutes())
                .notes(ticket.getNotes())
                .specialInstructions(ticket.getSpecialInstructions())
                .createdAt(ticket.getCreatedAt())
                .items(itemDetails)
                .totalAmount(order.getTotalAmount())
                .build();
    }
}
