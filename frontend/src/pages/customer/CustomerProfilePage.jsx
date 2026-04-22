import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import ToastMessage from '../../components/ui/ToastMessage';
import * as profileApi from '../../api/profileApi';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/customer', label: 'Reserve', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'My Reservations' },
  { to: '/customer/profile', label: 'Profile' },
];

function CustomerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ type: 'success', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      if (user) {
        setUser({ ...user, firstName: data.firstName, lastName: data.lastName });
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setLoading(true);
      await profileApi.updateProfile(data);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Convert multi-selects or checkboxes if needed
    const data = Object.fromEntries(formData.entries());
    
    try {
      setLoading(true);
      await profileApi.updatePreferences(data);
      setToast({ type: 'success', message: 'Dining preferences saved!' });
      await fetchProfile();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to save preferences.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value === 'on' || value === 'true';
    });
    
    try {
      setLoading(true);
      await profileApi.updateNotifications(data);
      setToast({ type: 'success', message: 'Notification settings updated!' });
      await fetchProfile();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update notification settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (data.newPassword !== data.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setToast({ type: 'success', message: 'Password changed successfully!' });
      e.target.reset();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      await profileApi.uploadAvatar(file);
      setToast({ type: 'success', message: 'Profile picture updated!' });
      await fetchProfile();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to upload avatar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    try {
      setLoading(true);
      await profileApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete account.' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile && loading) return (
    <DashboardShell title="Profile" navItems={navItems}>
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-48 rounded-2xl bg-white shadow-sm"></div>
        <div className="h-64 rounded-2xl bg-white shadow-sm"></div>
      </div>
    </DashboardShell>
  );

  const initials = `${profile?.firstName?.charAt(0) || ''}${profile?.lastName?.charAt(0) || ''}`;

  return (
    <DashboardShell 
      title="My Profile" 
      subtitle="Manage your personal information, dining preferences, and security settings."
      navItems={navItems}
    >
      <ToastMessage 
        type={toast.type} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, message: '' })} 
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-8">
          
          {/* Profile Header Card */}
          <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-sm)]">
            <div className="auth-page px-6 py-10 text-center">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[color:var(--primary)] text-3xl font-bold text-white shadow-lg">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : initials}
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-md transition hover:scale-110">
                  <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </label>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-[color:var(--text-secondary)]">{profile?.email}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-[color:var(--accent)] uppercase tracking-wide">
                  {profile?.loyaltyTier}
                </span>
                <span className="text-xs text-[color:var(--text-muted)]">
                  Member since {new Date(profile?.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline mt-6"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {isEditing && (
              <div className="border-t border-[color:var(--border)] p-6">
                <form onSubmit={handleUpdateProfile} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="label">First Name</label>
                    <input name="firstName" defaultValue={profile.firstName} className="input" required />
                  </div>
                  <div className="space-y-1">
                    <label className="label">Last Name</label>
                    <input name="lastName" defaultValue={profile.lastName} className="input" required />
                  </div>
                  <div className="space-y-1">
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <input name="email" defaultValue={profile.email} type="email" className="input" required />
                      <span className="absolute right-3 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label">Phone Number</label>
                    <div className="flex gap-2">
                      <select name="countryCode" defaultValue={profile.countryCode || '+91'} className="input w-24">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input name="phone" defaultValue={profile.phone} className="input flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label">Date of Birth</label>
                    <input name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth} className="input" />
                  </div>
                  <div className="space-y-1">
                    <label className="label">Preferred Language</label>
                    <select name="preferredLanguage" defaultValue={profile.preferredLanguage || 'English'} className="input">
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div className="pt-2 md:col-span-2">
                    <button type="submit" disabled={loading} className="btn-accent w-full justify-center">
                      {loading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Dining Preferences Card */}
          <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h4 className="flex items-center gap-2 text-lg font-bold text-[color:var(--text-primary)]">
              <svg className="h-5 w-5 text-[color:var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Dining Preferences
            </h4>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">These preferences help us auto-fill your reservation forms.</p>
            
            <form onSubmit={handleUpdatePreferences} className="mt-6 space-y-6">
              <div className="space-y-3">
                <label className="label">Seating Preference</label>
                <div className="flex gap-4">
                  {['Indoor', 'Outdoor', 'No Preference'].map(pref => (
                    <label key={pref} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="seatingPreference" value={pref} defaultChecked={profile?.seatingPreference === pref} className="accent-[color:var(--accent)]" />
                      <span className="text-sm">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="label">Default Guest Count</label>
                  <input type="number" name="defaultGuestCount" min="1" max="20" defaultValue={profile?.defaultGuestCount || 2} className="input" />
                </div>
                <div className="space-y-1">
                  <label className="label">Typical Reservation Duration</label>
                  <select name="defaultDuration" defaultValue={profile?.defaultDuration || '1 hour'} className="input">
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label">Cuisine Preferences (Comma separated)</label>
                <input name="cuisinePreferences" defaultValue={profile?.cuisinePreferences} placeholder="Italian, Indian, Chinese..." className="input" />
              </div>

              <div className="space-y-1">
                <label className="label">Saved Special Requests</label>
                <textarea 
                  name="savedSpecialRequests" 
                  defaultValue={profile?.savedSpecialRequests} 
                  rows="3" 
                  className="input" 
                  placeholder="Always prefer a quiet corner, wheelchair accessible..."
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-accent px-8">Save Preferences</button>
            </form>
          </section>

          {/* Notification Preferences Card */}
          <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h4 className="flex items-center gap-2 text-lg font-bold text-[color:var(--text-primary)]">
              <svg className="h-5 w-5 text-[color:var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Notifications
            </h4>
            
            <form onSubmit={handleUpdateNotifications} className="mt-6 space-y-6">
              <div className="divide-y divide-[color:var(--border)]">
                {[
                  { id: 'notifyReservationConfirm', label: 'Reservation Confirmations', desc: 'Get notified when your booking is confirmed by admin.' },
                  { id: 'notifyReservationReminder', label: 'Reservation Reminders', desc: 'Stay reminded before your booking time.' },
                  { id: 'notifyStatusUpdates', label: 'Status Updates', desc: 'Updates on changes or cancellations.' },
                  { id: 'notifyOffers', label: 'Special Offers', desc: 'Receive exclusive discounts and festival offers.' },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-[color:var(--text-primary)]">{item.label}</p>
                      <p className="text-xs text-[color:var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" name={item.id} defaultChecked={profile?.[item.id]} className="peer sr-only" />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[color:var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-[color:var(--surface-alt)] p-4">
                <p className="text-sm font-semibold mb-3">Notification Channels</p>
                <div className="flex flex-wrap gap-6">
                  {['channelEmail', 'channelSms', 'channelPush'].map(ch => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={ch} defaultChecked={profile?.[ch]} className="h-4 w-4 rounded border-gray-300 text-[color:var(--accent)] focus:ring-[color:var(--accent)]" />
                      <span className="text-sm font-medium">{ch.replace('channel', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-accent px-8">Update Notifications</button>
            </form>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8 lg:col-span-4">
          
          {/* Stats Card */}
          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--primary)] p-6 text-white shadow-[var(--shadow-sm)]">
            <h4 className="text-lg font-bold opacity-90">Reservations Overview</h4>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{profile?.totalReservations}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Total Booked</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{profile?.completedReservations}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Completed</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{profile?.totalGuestsHosted}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Guests Hosted</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{profile?.cancelledReservations}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Cancelled</p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/20 pt-4">
              <p className="text-xs opacity-70 uppercase font-semibold">Favorite Table</p>
              <p className="text-lg font-bold">{profile?.favoriteTable}</p>
            </div>
            <button 
              onClick={() => navigate('/customer/reservations')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[color:var(--primary)] transition hover:bg-opacity-90"
            >
              View Full History
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </section>

          {/* Security Card */}
          <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h4 className="text-lg font-bold text-[color:var(--text-primary)]">Security</h4>
            
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="label">Current Password</label>
                <input type="password" name="currentPassword" required className="input" />
              </div>
              <div className="space-y-1">
                <label className="label">New Password</label>
                <input type="password" name="newPassword" required className="input" />
              </div>
              <div className="space-y-1">
                <label className="label">Confirm New Password</label>
                <input type="password" name="confirmPassword" required className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn-accent w-full justify-center">Update Password</button>
            </form>

            <div className="mt-8 border-t border-[color:var(--border)] pt-6">
              <p className="font-bold text-red-600">Danger Zone</p>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1">Permanently delete your account and all reservation history.</p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="mt-4 text-sm font-bold text-red-600 hover:underline"
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Delete Account?</h3>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              This action is irreversible. All your reservations, dining patterns, and preferences will be permanently wiped.
            </p>
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-widest">Type DELETE below to confirm</p>
              <input 
                type="text" 
                className="input border-red-200 bg-red-50 text-red-700" 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline flex-1 justify-center"
              >
                Go Back
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || loading}
                className="btn-accent bg-red-600 hover:bg-red-700 flex-1 justify-center disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default CustomerProfilePage;
