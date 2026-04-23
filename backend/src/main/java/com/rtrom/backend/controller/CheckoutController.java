package com.rtrom.backend.controller;

import com.rtrom.backend.dto.BillDto;
import com.rtrom.backend.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/{tableId}")
    public ResponseEntity<BillDto> checkout(@PathVariable Long tableId) {
        return ResponseEntity.ok(checkoutService.checkout(tableId));
    }
}
