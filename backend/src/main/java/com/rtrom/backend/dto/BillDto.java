package com.rtrom.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BillDto {
    private Long id;
    private String billNumber;
    private Long tableId;
    private Long reservationId;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private String status;
    private LocalDateTime createdAt;

    public BillDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static BillDtoBuilder builder() {
        return new BillDtoBuilder();
    }

    public static class BillDtoBuilder {
        private BillDto dto = new BillDto();

        public BillDtoBuilder id(Long id) { dto.setId(id); return this; }
        public BillDtoBuilder billNumber(String billNumber) { dto.setBillNumber(billNumber); return this; }
        public BillDtoBuilder orderId(Long orderId) { dto.setOrderId(orderId); return this; }
        public BillDtoBuilder subtotal(BigDecimal subtotal) { dto.setSubtotal(subtotal); return this; }
        public BillDtoBuilder tax(BigDecimal tax) { dto.setTax(tax); return this; }
        public BillDtoBuilder discount(BigDecimal discount) { dto.setDiscount(discount); return this; }
        public BillDtoBuilder grandTotal(BigDecimal grandTotal) { dto.setGrandTotal(grandTotal); return this; }
        public BillDtoBuilder status(String status) { dto.setStatus(status); return this; }
        public BillDtoBuilder createdAt(LocalDateTime createdAt) { dto.setCreatedAt(createdAt); return this; }
        public BillDto build() { return dto; }
    }
}
