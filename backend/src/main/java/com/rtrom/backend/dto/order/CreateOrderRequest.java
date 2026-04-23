package com.rtrom.backend.dto.order;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(
    @NotNull Long tableId,
    @NotEmpty List<OrderItemRequest> items
) {}
