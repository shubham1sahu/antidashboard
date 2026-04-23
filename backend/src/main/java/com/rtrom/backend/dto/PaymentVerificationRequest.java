package com.rtrom.backend.dto;

public class PaymentVerificationRequest {
    private Long paymentId;
    private String paymentIntentId;

    public PaymentVerificationRequest() {}

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
}
