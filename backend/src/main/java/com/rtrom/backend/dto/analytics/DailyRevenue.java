package com.rtrom.backend.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenue(
    LocalDate date,
    BigDecimal amount
) {}
