package com.rtrom.backend.service;

import com.rtrom.backend.domain.enums.PaymentMethod;
import com.rtrom.backend.domain.enums.PaymentStatus;
import com.rtrom.backend.domain.model.Bill;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.domain.model.OrderStatus;
import com.rtrom.backend.domain.model.Payment;
import com.rtrom.backend.dto.PaymentIntentRequest;
import com.rtrom.backend.dto.PaymentIntentResponse;
import com.rtrom.backend.dto.PaymentVerificationRequest;
import com.rtrom.backend.repository.BillRepository;
import com.rtrom.backend.repository.OrderRepository;
import com.rtrom.backend.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final OrderRepository orderRepository;

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(stripeSecretKey)) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    private void ensureStripeConfigured() {
        if (!StringUtils.hasText(stripeSecretKey)) {
            throw new IllegalStateException("Stripe is not configured. Set app.stripe.secret-key or STRIPE_SECRET_KEY.");
        }
    }

    @Transactional
    public PaymentIntentResponse createOrder(PaymentIntentRequest request) throws StripeException {
        ensureStripeConfigured();

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + request.getBillId()));

        // Amount in paise (multiply by 100)
        long amountInPaise = bill.getGrandTotal().multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInPaise)
                .setCurrency("inr")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .putMetadata("billId", String.valueOf(bill.getId()))
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .bill(bill)
                .amount(bill.getGrandTotal())
                .paymentMethod(PaymentMethod.CARD) // Defaulting to CARD for stripe elements
                .status(PaymentStatus.PENDING)
                .stripePaymentIntentId(paymentIntent.getId())
                .build();

        payment = paymentRepository.save(payment);

        return PaymentIntentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentId(payment.getId())
                .build();
    }

    @Transactional
    public String verifyPayment(PaymentVerificationRequest request) throws StripeException {
        ensureStripeConfigured();

        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getStripePaymentIntentId().equals(request.getPaymentIntentId())) {
            throw new RuntimeException("Payment Intent ID mismatch");
        }

        PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            // Mark order as completed/paid
            Bill bill = payment.getBill();
            bill.setStatus("PAID");
            billRepository.save(bill);

            Order order = bill.getOrder();
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            paymentRepository.save(payment);
            return "Payment Successful";
        } else if ("requires_payment_method".equals(paymentIntent.getStatus()) ||
                "canceled".equals(paymentIntent.getStatus())) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return "Payment Failed";
        }

        return "Payment Pending";
    }
}
