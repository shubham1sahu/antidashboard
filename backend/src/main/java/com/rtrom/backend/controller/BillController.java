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

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<BillDto> getBillByTableId(@PathVariable Long tableId) {
        return ResponseEntity.ok(billService.getBillByTableId(tableId));
    }
}
