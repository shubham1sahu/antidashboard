package com.rtrom.backend.controller;

import com.rtrom.backend.dto.BillDto;
import com.rtrom.backend.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping("/{orderId}/generate")
    public ResponseEntity<BillDto> generateBill(@PathVariable Long orderId) {
        return ResponseEntity.ok(billService.generateBill(orderId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<BillDto> getBillByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(billService.getBillByOrderId(orderId));
    }
}
