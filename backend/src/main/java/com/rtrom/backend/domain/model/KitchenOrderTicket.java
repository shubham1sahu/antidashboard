package com.rtrom.backend.domain.model;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;


@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "kitchen_order_tickets")




public class KitchenOrderTicket {
    public KitchenOrderTicket() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KitchenTicketStatus kitchenStatus;

    private String assignedTo;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer estimatedMinutes;

    private String notes;

    @Column(length = 500)
    private String specialInstructions;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        if (kitchenStatus == null) {
            kitchenStatus = KitchenTicketStatus.RECEIVED;
        }
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public KitchenTicketStatus getKitchenStatus() { return kitchenStatus; }
    public void setKitchenStatus(KitchenTicketStatus kitchenStatus) { this.kitchenStatus = kitchenStatus; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static KitchenOrderTicketBuilder builder() {
        return new KitchenOrderTicketBuilder();
    }

    public static class KitchenOrderTicketBuilder {
        private KitchenOrderTicket instance = new KitchenOrderTicket();
        public KitchenOrderTicketBuilder order(Order v) { instance.setOrder(v); return this; }
        public KitchenOrderTicketBuilder kitchenStatus(KitchenTicketStatus v) { instance.setKitchenStatus(v); return this; }
        public KitchenOrderTicketBuilder assignedTo(String v) { instance.setAssignedTo(v); return this; }
        public KitchenOrderTicketBuilder startedAt(LocalDateTime v) { instance.setStartedAt(v); return this; }
        public KitchenOrderTicketBuilder completedAt(LocalDateTime v) { instance.setCompletedAt(v); return this; }
        public KitchenOrderTicketBuilder estimatedMinutes(Integer v) { instance.setEstimatedMinutes(v); return this; }
        public KitchenOrderTicketBuilder notes(String v) { instance.setNotes(v); return this; }
        public KitchenOrderTicketBuilder specialInstructions(String v) { instance.setSpecialInstructions(v); return this; }
        public KitchenOrderTicket build() { return instance; }
    }
}
