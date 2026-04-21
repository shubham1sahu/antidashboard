package com.rtrom.backend.dto.analytics;

import java.math.BigDecimal;

public record CategorySales(
    String categoryName,
    BigDecimal revenue
) {}
