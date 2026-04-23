package com.rtrom.backend.dto;

public class PaymentIntentRequest {
    private Long billId;

    public PaymentIntentRequest() {}

    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }
}
