package com.rtrom.backend.service;

import com.rtrom.backend.domain.enums.PaymentMethod;
import com.rtrom.backend.domain.enums.PaymentStatus;
import com.rtrom.backend.domain.model.Bill;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.domain.model.OrderStatus;
import com.rtrom.backend.domain.model.Payment;
import com.rtrom.backend.domain.model.*;
import com.rtrom.backend.domain.model.TableStatus;
import com.rtrom.backend.domain.model.ReservationStatus;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.dto.PaymentIntentRequest;
import com.rtrom.backend.dto.PaymentIntentResponse;
import com.rtrom.backend.dto.PaymentVerificationRequest;
import com.rtrom.backend.repository.*;
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
import java.time.temporal.ChronoUnit;


@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String STRIPE_SECRET_PREFIX_TEST = "sk_test_";
    private static final String STRIPE_SECRET_PREFIX_LIVE = "sk_live_";
    private static final BigDecimal MIN_STRIPE_AMOUNT_INR = new BigDecimal("50.00");

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private String normalizedStripeSecretKey;

    @PostConstruct
    public void init() {
        normalizedStripeSecretKey = normalizeConfigValue(stripeSecretKey);
        if (isValidStripeSecretKey(normalizedStripeSecretKey)) {
            Stripe.apiKey = normalizedStripeSecretKey;
        }
    }

    private void ensureStripeConfigured() {
        if (!isValidStripeSecretKey(normalizedStripeSecretKey)) {
            throw new IllegalStateException(
                    "Stripe secret key is missing or still a placeholder. Set a real STRIPE_SECRET_KEY in backend/.env.");
        }
        Stripe.apiKey = normalizedStripeSecretKey;
    }

    private String normalizeConfigValue(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        String normalized = value.trim();
        int commentIndex = normalized.indexOf('#');
        if (commentIndex >= 0) {
            normalized = normalized.substring(0, commentIndex).trim();
        }
        return normalized;
    }

    private boolean isValidStripeSecretKey(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        if (value.contains("...")) {
            return false;
        }

        String lowercase = value.toLowerCase();
        if (lowercase.contains("replace with actual")) {
            return false;
        }

        return value.startsWith(STRIPE_SECRET_PREFIX_TEST) || value.startsWith(STRIPE_SECRET_PREFIX_LIVE);
    }

    @Transactional
    public PaymentIntentResponse createOrder(PaymentIntentRequest request) throws StripeException {
        ensureStripeConfigured();

        if (request == null || request.getBillId() == null) {
            throw new BadRequestException("Bill id is required to create a payment.");
        }

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + request.getBillId()));

        if (bill.getGrandTotal().compareTo(MIN_STRIPE_AMOUNT_INR) < 0) {
            throw new BadRequestException(
                    "Online card payments require a bill total of at least Rs 50.00 because of Stripe's minimum charge. Please add more items or settle this bill offline.");
        }

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

        if (request == null || request.getPaymentId() == null || !StringUtils.hasText(request.getPaymentIntentId())) {
            throw new BadRequestException("Payment id and payment intent id are required.");
        }

        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getStripePaymentIntentId().equals(request.getPaymentIntentId())) {
            throw new BadRequestException("Payment Intent ID mismatch");
        }

        PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));


            // Mark bill and orders as PAID
            Bill bill = payment.getBill();
            bill.setStatus("PAID");
            billRepository.save(bill);

            for (Order order : bill.getOrders()) {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
            }

            // Release Table
            RestaurantTable table = bill.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);

            // Complete Reservation if exists
            if (bill.getReservation() != null) {
                Reservation reservation = bill.getReservation();
                reservation.setStatus(ReservationStatus.COMPLETED);
                reservationRepository.save(reservation);
            }

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
