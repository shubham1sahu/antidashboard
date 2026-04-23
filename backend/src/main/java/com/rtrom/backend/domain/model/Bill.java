package com.rtrom.backend.domain.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String billNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order sourceOrder;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
    private java.util.List<Order> orders = new java.util.ArrayList<>();

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(nullable = false)
    private BigDecimal tax;

    @Column(nullable = false)
    private BigDecimal discount;

    @Column(nullable = false)
    private BigDecimal grandTotal;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Bill() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public RestaurantTable getTable() {
        return table;
    }

    public void setTable(RestaurantTable table) {
        this.table = table;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public Order getSourceOrder() {
        return sourceOrder;
    }

    public void setSourceOrder(Order sourceOrder) {
        this.sourceOrder = sourceOrder;
    }

    public java.util.List<Order> getOrders() {
        return orders;
    }

    public void setOrders(java.util.List<Order> orders) {
        this.orders = orders;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (totalAmount == null) {
            totalAmount = grandTotal;
        }
    }

    // Manual Builder
    public static BillBuilder builder() {
        return new BillBuilder();
    }

    public static class BillBuilder {
        private Bill bill = new Bill();

        public BillBuilder id(Long id) {
            bill.setId(id);
            return this;
        }

        public BillBuilder billNumber(String billNumber) {
            bill.setBillNumber(billNumber);
            return this;
        }

        public BillBuilder table(RestaurantTable table) {
            bill.setTable(table);
            return this;
        }

        public BillBuilder reservation(Reservation reservation) {
            bill.setReservation(reservation);
            return this;
        }

        public BillBuilder sourceOrder(Order sourceOrder) {
            bill.setSourceOrder(sourceOrder);
            return this;
        }

        public BillBuilder orders(java.util.List<Order> orders) {
            bill.setOrders(orders);
            return this;
        }

        public BillBuilder subtotal(BigDecimal subtotal) {
            bill.setSubtotal(subtotal);
            return this;
        }

        public BillBuilder tax(BigDecimal tax) {
            bill.setTax(tax);
            return this;
        }

        public BillBuilder discount(BigDecimal discount) {
            bill.setDiscount(discount);
            return this;
        }

        public BillBuilder grandTotal(BigDecimal grandTotal) {
            bill.setGrandTotal(grandTotal);
            return this;
        }

        public BillBuilder totalAmount(BigDecimal totalAmount) {
            bill.setTotalAmount(totalAmount);
            return this;
        }

        public BillBuilder status(String status) {
            bill.setStatus(status);
            return this;
        }

        public BillBuilder createdAt(LocalDateTime createdAt) {
            bill.setCreatedAt(createdAt);
            return this;
        }

        public Bill build() {
            return bill;
        }
    }
}
