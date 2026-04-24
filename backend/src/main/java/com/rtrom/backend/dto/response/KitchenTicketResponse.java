package com.rtrom.backend.dto.response;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class KitchenTicketResponse {

    private Long ticketId;
    private Long orderId;
    private String tableNumber;
    private Long tableId;
    private KitchenTicketStatus kitchenStatus;
    private String assignedTo;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startedAt;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedAt;
    private Integer estimatedMinutes;
    private String notes;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    private List<KitchenOrderItemDetail> items;
    private String specialInstructions;
    private BigDecimal totalAmount;

    public KitchenTicketResponse() {
    }

    // Getters and Setters
    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public KitchenTicketStatus getKitchenStatus() {
        return kitchenStatus;
    }

    public void setKitchenStatus(KitchenTicketStatus kitchenStatus) {
        this.kitchenStatus = kitchenStatus;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<KitchenOrderItemDetail> getItems() {
        return items;
    }

    public void setItems(List<KitchenOrderItemDetail> items) {
        this.items = items;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public static KitchenTicketResponseBuilder builder() {
        return new KitchenTicketResponseBuilder();
    }

    public static class KitchenTicketResponseBuilder {
        private KitchenTicketResponse instance = new KitchenTicketResponse();

        public KitchenTicketResponseBuilder ticketId(Long v) {
            instance.setTicketId(v);
            return this;
        }

        public KitchenTicketResponseBuilder orderId(Long v) {
            instance.setOrderId(v);
            return this;
        }

        public KitchenTicketResponseBuilder tableNumber(String v) {
            instance.setTableNumber(v);
            return this;
        }

        public KitchenTicketResponseBuilder tableId(Long v) {
            instance.setTableId(v);
            return this;
        }

        public KitchenTicketResponseBuilder kitchenStatus(KitchenTicketStatus v) {
            instance.setKitchenStatus(v);
            return this;
        }

        public KitchenTicketResponseBuilder assignedTo(String v) {
            instance.setAssignedTo(v);
            return this;
        }

        public KitchenTicketResponseBuilder startedAt(LocalDateTime v) {
            instance.setStartedAt(v);
            return this;
        }

        public KitchenTicketResponseBuilder completedAt(LocalDateTime v) {
            instance.setCompletedAt(v);
            return this;
        }

        public KitchenTicketResponseBuilder estimatedMinutes(Integer v) {
            instance.setEstimatedMinutes(v);
            return this;
        }

        public KitchenTicketResponseBuilder notes(String v) {
            instance.setNotes(v);
            return this;
        }

        public KitchenTicketResponseBuilder createdAt(LocalDateTime v) {
            instance.setCreatedAt(v);
            return this;
        }

        public KitchenTicketResponseBuilder items(List<KitchenOrderItemDetail> v) {
            instance.setItems(v);
            return this;
        }

        public KitchenTicketResponseBuilder specialInstructions(String v) {
            instance.setSpecialInstructions(v);
            return this;
        }

        public KitchenTicketResponseBuilder totalAmount(BigDecimal v) {
            instance.setTotalAmount(v);
            return this;
        }

        public KitchenTicketResponse build() {
            return instance;
        }
    }

    public static class KitchenOrderItemDetail {
        private Long orderItemId;
        private String itemName;
        private Integer quantity;
        private String customizationNotes;
        private Boolean isVegetarian;

        public KitchenOrderItemDetail() {
        }

        public Long getOrderItemId() {
            return orderItemId;
        }

        public void setOrderItemId(Long v) {
            this.orderItemId = v;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String v) {
            this.itemName = v;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer v) {
            this.quantity = v;
        }

        public String getCustomizationNotes() {
            return customizationNotes;
        }

        public void setCustomizationNotes(String v) {
            this.customizationNotes = v;
        }

        public Boolean getIsVegetarian() {
            return isVegetarian;
        }

        public void setIsVegetarian(Boolean v) {
            this.isVegetarian = v;
        }

        public static KitchenOrderItemDetailBuilder builder() {
            return new KitchenOrderItemDetailBuilder();
        }

        public static class KitchenOrderItemDetailBuilder {
            private KitchenOrderItemDetail instance = new KitchenOrderItemDetail();

            public KitchenOrderItemDetailBuilder orderItemId(Long v) {
                instance.setOrderItemId(v);
                return this;
            }

            public KitchenOrderItemDetailBuilder itemName(String v) {
                instance.setItemName(v);
                return this;
            }

            public KitchenOrderItemDetailBuilder quantity(Integer v) {
                instance.setQuantity(v);
                return this;
            }

            public KitchenOrderItemDetailBuilder customizationNotes(String v) {
                instance.setCustomizationNotes(v);
                return this;
            }

            public KitchenOrderItemDetailBuilder isVegetarian(Boolean v) {
                instance.setIsVegetarian(v);
                return this;
            }

            public KitchenOrderItemDetail build() {
                return instance;
            }
        }
    }
}
