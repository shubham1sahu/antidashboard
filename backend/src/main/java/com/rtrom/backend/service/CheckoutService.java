package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.*;
import com.rtrom.backend.dto.BillDto;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final BillService billService;

    @Transactional
    public BillDto checkout(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (table.getStatus() != TableStatus.OCCUPIED && table.getStatus() != TableStatus.RESERVED) {
            throw new BadRequestException("Table is not ready for checkout");
        }

        // Fetch all active orders for this table (excluding PAID, COMPLETED, CANCELLED)
        List<OrderStatus> activeStatuses = Arrays.asList(
                OrderStatus.PENDING,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED
        );

        List<Order> activeOrders = orderRepository.findByTableIdAndStatusIn(tableId, activeStatuses);

        if (activeOrders.isEmpty()) {
            throw new BadRequestException("No active orders found for Table " + table.getTableNumber());
        }

        // Calculate current totals
        BigDecimal subtotal = activeOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRate = new BigDecimal("0.05"); // 5% tax
        BigDecimal tax = subtotal.multiply(taxRate);
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.add(tax).subtract(discount);

        // Check if an unpaid bill already exists
        return billRepository.findByTableIdAndStatus(tableId, "GENERATED")
                .map(existingBill -> {
                    // Update existing bill
                    existingBill.setSubtotal(subtotal);
                    existingBill.setTax(tax);
                    existingBill.setDiscount(discount);
                    existingBill.setGrandTotal(grandTotal);
                    existingBill.setTotalAmount(grandTotal);
                    existingBill.setSourceOrder(activeOrders.get(0));
                    
                    // Re-link all current orders to this bill
                    for (Order order : activeOrders) {
                        order.setBill(existingBill);
                        orderRepository.save(order);
                    }
                    
                    Bill updatedBill = billRepository.save(existingBill);
                    return billService.mapToDto(updatedBill);
                })
                .orElseGet(() -> {
                    // Find current reservation
                    Reservation reservation = reservationRepository.findByTableIdAndStatus(tableId, ReservationStatus.CONFIRMED)
                            .stream()
                            .filter(r -> r.getReservationDate().equals(java.time.LocalDate.now()))
                            .findFirst()
                            .orElse(null);

                    // Create New Bill
                    Bill bill = Bill.builder()
                            .billNumber("BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .table(table)
                            .reservation(reservation)
                            .sourceOrder(activeOrders.get(0))
                            .subtotal(subtotal)
                            .tax(tax)
                            .discount(discount)
                            .grandTotal(grandTotal)
                            .totalAmount(grandTotal)
                            .status("GENERATED")
                            .build();

                    Bill savedBill = billRepository.save(bill);

                    // Link all current orders to the new bill.
                    for (Order order : activeOrders) {
                        order.setBill(savedBill);
                        orderRepository.save(order);
                    }

                    return billService.mapToDto(savedBill);
                });
    }
}
