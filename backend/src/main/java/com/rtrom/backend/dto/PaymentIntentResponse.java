package com.rtrom.backend.dto;

public class PaymentIntentResponse {
    private String clientSecret;
    private Long paymentId;

    public PaymentIntentResponse() {}

    public PaymentIntentResponse(String clientSecret, Long paymentId) {
        this.clientSecret = clientSecret;
        this.paymentId = paymentId;
    }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public static PaymentIntentResponseBuilder builder() {
        return new PaymentIntentResponseBuilder();
    }

    public static class PaymentIntentResponseBuilder {
        private String clientSecret;
        private Long paymentId;

        public PaymentIntentResponseBuilder clientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
            return this;
        }

        public PaymentIntentResponseBuilder paymentId(Long paymentId) {
            this.paymentId = paymentId;
            return this;
        }

        public PaymentIntentResponse build() {
            return new PaymentIntentResponse(clientSecret, paymentId);
        }
    }
}
