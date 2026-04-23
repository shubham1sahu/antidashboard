package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.Bill;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.dto.BillDto;
import com.rtrom.backend.exception.ResourceNotFoundException;
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

    public BillDto getBillByTableId(Long tableId) {
        return billRepository.findByTableIdAndStatus(tableId, "GENERATED")
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Active bill not found for table id: " + tableId));
    }
    
    public BillDto getBillById(Long billId) {
        return billRepository.findById(billId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));
    }

    public BillDto mapToDto(Bill bill) {
        return BillDto.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .tableId(bill.getTable().getId())
                .reservationId(bill.getReservation() != null ? bill.getReservation().getId() : null)
                .subtotal(bill.getSubtotal())
                .tax(bill.getTax())
                .discount(bill.getDiscount())
                .grandTotal(bill.getGrandTotal())
                .status(bill.getStatus())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}
