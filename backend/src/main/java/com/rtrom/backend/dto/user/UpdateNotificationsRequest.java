package com.rtrom.backend.dto.user;

public record UpdateNotificationsRequest(
    boolean notifyReservationConfirm,
    boolean notifyReservationReminder,
    String reminderTimeBefore,
    boolean notifyStatusUpdates,
    boolean notifyOffers,
    boolean notifyOrderUpdates,
    boolean notifyWeeklyDigest,
    boolean channelEmail,
    boolean channelSms,
    boolean channelPush
) {}
