package com.rtrom.backend.dto.analytics;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AnalyticsResponse(
    BigDecimal totalRevenue,
    long totalOrders,
    long totalReservations,
    long totalUsers,
    List<DailyRevenue> revenueTrend,
    List<PopularItem> topItems,
    List<CategorySales> categorySales
) {}
