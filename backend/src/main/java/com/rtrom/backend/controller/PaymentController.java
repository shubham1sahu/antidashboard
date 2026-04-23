package com.rtrom.backend.controller;

import com.rtrom.backend.dto.PaymentIntentRequest;
import com.rtrom.backend.dto.PaymentIntentResponse;
import com.rtrom.backend.dto.PaymentVerificationRequest;
import com.rtrom.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentIntentResponse> createOrder(@RequestBody PaymentIntentRequest request) {
        try {
            return ResponseEntity.ok(paymentService.createOrder(request));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(503).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            String status = paymentService.verifyPayment(request);
            if ("Payment Successful".equals(status)) {
                return ResponseEntity.ok(status);
            } else {
                return ResponseEntity.badRequest().body(status);
            }
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Error verifying payment");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(503).body(e.getMessage());
        }
    }
}
