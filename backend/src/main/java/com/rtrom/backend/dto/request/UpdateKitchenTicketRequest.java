package com.rtrom.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateKitchenTicketRequest {

    @NotNull
    private Long ticketId;

    private String assignedTo;

    private Integer estimatedMinutes;

    private String notes;
}
