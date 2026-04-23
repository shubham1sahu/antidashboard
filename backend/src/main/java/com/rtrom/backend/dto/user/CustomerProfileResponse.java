package com.rtrom.backend.dto.user;

import com.rtrom.backend.domain.model.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerProfileResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    Role role,
    String phone,
    String countryCode,
    LocalDate dateOfBirth,
    String preferredLanguage,
    String avatarUrl,
    
    // Dining Preferences
    String cuisinePreferences,
    String dietaryRestrictions,
    String seatingPreference,
    Integer defaultGuestCount,
    String defaultDuration,
    String preferredTimeSlots,
    String savedSpecialRequests,
    
    // Notification Preferences
    boolean notifyReservationConfirm,
    boolean notifyReservationReminder,
    String reminderTimeBefore,
    boolean notifyStatusUpdates,
    boolean notifyOffers,
    boolean notifyOrderUpdates,
    boolean notifyWeeklyDigest,
    
    // Channels
    boolean channelEmail,
    boolean channelSms,
    boolean channelPush,
    
    // Stats
    long totalReservations,
    long completedReservations,
    long cancelledReservations,
    long totalGuestsHosted,
    String favoriteTable,
    String loyaltyTier,
    LocalDateTime memberSince
) {}
