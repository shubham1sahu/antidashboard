package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.Bill;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.dto.BillDto;
import com.rtrom.backend.repository.BillRepository;
import com.rtrom.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public BillDto generateBill(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // Check if bill already exists
        return billRepository.findByOrderId(orderId)
                .map(this::mapToDto)
                .orElseGet(() -> {
                    BigDecimal subtotal = order.getTotalAmount();
                    if (subtotal == null) subtotal = BigDecimal.ZERO;
                    
                    BigDecimal taxRate = new BigDecimal("0.05"); // 5% tax
                    BigDecimal tax = subtotal.multiply(taxRate);
                    BigDecimal discount = BigDecimal.ZERO; // Optional discount logic here
                    BigDecimal grandTotal = subtotal.add(tax).subtract(discount);

                    Bill bill = Bill.builder()
                            .billNumber("BILL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .order(order)
                            .subtotal(subtotal)
                            .tax(tax)
                            .discount(discount)
                            .grandTotal(grandTotal)
                            .status("GENERATED")
                            .build();

                    Bill savedBill = billRepository.save(bill);
                    return mapToDto(savedBill);
                });
    }

    public BillDto getBillByOrderId(Long orderId) {
        return billRepository.findByOrderId(orderId)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Bill not found for order id: " + orderId));
    }
    
    public BillDto getBillById(Long billId) {
        return billRepository.findById(billId)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
    }

    private BillDto mapToDto(Bill bill) {
        return BillDto.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .orderId(bill.getOrder().getId())
                .subtotal(bill.getSubtotal())
                .tax(bill.getTax())
                .discount(bill.getDiscount())
                .grandTotal(bill.getGrandTotal())
                .status(bill.getStatus())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}
