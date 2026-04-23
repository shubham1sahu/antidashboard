package com.rtrom.backend.controller;

import com.rtrom.backend.dto.error.ApiErrorResponse;
import com.rtrom.backend.dto.PaymentIntentRequest;
import com.rtrom.backend.dto.PaymentIntentResponse;
import com.rtrom.backend.dto.PaymentVerificationRequest;
import com.rtrom.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private ResponseEntity<ApiErrorResponse> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(message, status.value(), LocalDateTime.now()));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentIntentRequest request) {
        try {
            return ResponseEntity.ok(paymentService.createOrder(request));
        } catch (StripeException e) {
            return buildError(HttpStatus.BAD_GATEWAY, "Stripe request failed: " + e.getMessage());
        } catch (IllegalStateException e) {
            return buildError(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            String status = paymentService.verifyPayment(request);
            if ("Payment Successful".equals(status)) {
                return ResponseEntity.ok(status);
            } else {
                return ResponseEntity.badRequest().body(status);
            }
        } catch (StripeException e) {
            return buildError(HttpStatus.BAD_GATEWAY, "Stripe verification failed: " + e.getMessage());
        } catch (IllegalStateException e) {
            return buildError(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
        }
    }
}
