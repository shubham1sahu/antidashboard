package com.rtrom.backend.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_profiles")
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String phone;
    private String countryCode;
    private LocalDate dateOfBirth;
    private String preferredLanguage;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    // Dining Preferences
    private String cuisinePreferences; // Comma-separated
    private String dietaryRestrictions; // Comma-separated
    private String seatingPreference;   // Indoor, Outdoor, No Preference
    private Integer defaultGuestCount;
    private String defaultDuration;      // 1hr, 1.5hr, 2hr
    private String preferredTimeSlots;  // Comma-separated

    @Column(columnDefinition = "TEXT")
    private String savedSpecialRequests;

    // Notification Preferences
    private boolean notifyReservationConfirm = true;
    private boolean notifyReservationReminder = true;
    private String reminderTimeBefore = "2 hours"; // 1hr, 2hr, 1 day
    private boolean notifyStatusUpdates = true;
    private boolean notifyOffers = false;
    private boolean notifyOrderUpdates = true;
    private boolean notifyWeeklyDigest = false;

    // Notification Channels
    private boolean channelEmail = true;
    private boolean channelSms = false;
    private boolean channelPush = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public CustomerProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getCuisinePreferences() { return cuisinePreferences; }
    public void setCuisinePreferences(String cuisinePreferences) { this.cuisinePreferences = cuisinePreferences; }

    public String getDietaryRestrictions() { return dietaryRestrictions; }
    public void setDietaryRestrictions(String dietaryRestrictions) { this.dietaryRestrictions = dietaryRestrictions; }

    public String getSeatingPreference() { return seatingPreference; }
    public void setSeatingPreference(String seatingPreference) { this.seatingPreference = seatingPreference; }

    public Integer getDefaultGuestCount() { return defaultGuestCount; }
    public void setDefaultGuestCount(Integer defaultGuestCount) { this.defaultGuestCount = defaultGuestCount; }

    public String getDefaultDuration() { return defaultDuration; }
    public void setDefaultDuration(String defaultDuration) { this.defaultDuration = defaultDuration; }

    public String getPreferredTimeSlots() { return preferredTimeSlots; }
    public void setPreferredTimeSlots(String preferredTimeSlots) { this.preferredTimeSlots = preferredTimeSlots; }

    public String getSavedSpecialRequests() { return savedSpecialRequests; }
    public void setSavedSpecialRequests(String savedSpecialRequests) { this.savedSpecialRequests = savedSpecialRequests; }

    public boolean isNotifyReservationConfirm() { return notifyReservationConfirm; }
    public void setNotifyReservationConfirm(boolean notifyReservationConfirm) { this.notifyReservationConfirm = notifyReservationConfirm; }

    public boolean isNotifyReservationReminder() { return notifyReservationReminder; }
    public void setNotifyReservationReminder(boolean notifyReservationReminder) { this.notifyReservationReminder = notifyReservationReminder; }

    public String getReminderTimeBefore() { return reminderTimeBefore; }
    public void setReminderTimeBefore(String reminderTimeBefore) { this.reminderTimeBefore = reminderTimeBefore; }

    public boolean isNotifyStatusUpdates() { return notifyStatusUpdates; }
    public void setNotifyStatusUpdates(boolean notifyStatusUpdates) { this.notifyStatusUpdates = notifyStatusUpdates; }

    public boolean isNotifyOffers() { return notifyOffers; }
    public void setNotifyOffers(boolean notifyOffers) { this.notifyOffers = notifyOffers; }

    public boolean isNotifyOrderUpdates() { return notifyOrderUpdates; }
    public void setNotifyOrderUpdates(boolean notifyOrderUpdates) { this.notifyOrderUpdates = notifyOrderUpdates; }

    public boolean isNotifyWeeklyDigest() { return notifyWeeklyDigest; }
    public void setNotifyWeeklyDigest(boolean notifyWeeklyDigest) { this.notifyWeeklyDigest = notifyWeeklyDigest; }

    public boolean isChannelEmail() { return channelEmail; }
    public void setChannelEmail(boolean channelEmail) { this.channelEmail = channelEmail; }

    public boolean isChannelSms() { return channelSms; }
    public void setChannelSms(boolean channelSms) { this.channelSms = channelSms; }

    public boolean isChannelPush() { return channelPush; }
    public void setChannelPush(boolean channelPush) { this.channelPush = channelPush; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
