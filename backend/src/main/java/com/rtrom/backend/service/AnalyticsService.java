package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.domain.model.OrderItem;
import com.rtrom.backend.dto.analytics.*;
import com.rtrom.backend.repository.OrderRepository;
import com.rtrom.backend.repository.ReservationRepository;
import com.rtrom.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getDashboardAnalytics() {
        List<Order> allOrders = orderRepository.findAllWithDetails();
        
        List<Order> paidOrders = allOrders.stream()
                .filter(o -> com.rtrom.backend.domain.model.OrderStatus.PAID.equals(o.getStatus()))
                .collect(Collectors.toList());

        // Totals
        BigDecimal totalRevenue = paidOrders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalOrders = paidOrders.size();
        long totalReservations = reservationRepository.countByStatus(com.rtrom.backend.domain.model.ReservationStatus.COMPLETED);
        long totalUsers = userRepository.count();

        // Revenue Trend (Last 7 days)
        Map<LocalDate, BigDecimal> revenueMap = paidOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));
        
        List<DailyRevenue> revenueTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            revenueTrend.add(new DailyRevenue(date, revenueMap.getOrDefault(date, BigDecimal.ZERO)));
        }

        // Popular Items
        Map<String, Long> itemSales = new HashMap<>();
        Map<String, BigDecimal> categoryRevenue = new HashMap<>();

        for (Order order : paidOrders) {
            for (OrderItem item : order.getItems()) {
                if (item.getMenuItem() != null) {
                    String itemName = item.getMenuItem().getName();
                    itemSales.put(itemName, itemSales.getOrDefault(itemName, 0L) + item.getQuantity());

                    if (item.getMenuItem().getCategory() != null) {
                        String catName = item.getMenuItem().getCategory().getName();
                        categoryRevenue.put(catName, categoryRevenue.getOrDefault(catName, BigDecimal.ZERO).add(item.getSubtotal()));
                    }
                }
            }
        }

        List<PopularItem> topItems = itemSales.entrySet().stream()
                .map(e -> new PopularItem(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(PopularItem::quantity).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<CategorySales> categorySales = categoryRevenue.entrySet().stream()
                .map(e -> new CategorySales(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(CategorySales::revenue).reversed())
                .collect(Collectors.toList());

        return new AnalyticsResponse(
                totalRevenue,
                totalOrders,
                totalReservations,
                totalUsers,
                revenueTrend,
                topItems,
                categorySales
        );
    }
}
