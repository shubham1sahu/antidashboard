package com.rtrom.backend.dto.user;

public record UpdatePreferencesRequest(
    String cuisinePreferences,
    String dietaryRestrictions,
    String seatingPreference,
    Integer defaultGuestCount,
    String defaultDuration,
    String preferredTimeSlots,
    String savedSpecialRequests
) {}
