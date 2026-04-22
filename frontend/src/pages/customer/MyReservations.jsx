import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { cancelReservation, getMyReservations } from '../../api/reservationApi';
import useReservationStore from '../../store/reservationStore';

const navItems = [
  { to: '/customer', label: 'Reserve', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'My Reservations' },
  { to: '/customer/profile', label: 'Profile' },
];

function MyReservations() {
  const reservations = useReservationStore((state) => state.reservations);
  const setReservations = useReservationStore((state) => state.setReservations);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getMyReservations();
      setReservations(data);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelReservation(id);
      setToast({ type: 'success', message: 'Reservation cancelled successfully.' });
      await loadReservations();
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  return (
    <DashboardShell
      title="My Reservations"
      subtitle="Track reservation status in real time and cancel any pending or confirmed booking you no longer need."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <section className="space-y-4">
        {loading ? (
          <article className="rounded-2xl border border-[color:var(--border)] bg-white p-6 text-sm text-[color:var(--text-secondary)] shadow-[var(--shadow-sm)]">
            Loading your reservations...
          </article>
        ) : null}

        {!loading && reservations.length === 0 ? (
          <article className="rounded-2xl border border-[color:var(--border)] bg-white p-6 text-sm text-[color:var(--text-secondary)] shadow-[var(--shadow-sm)]">
            You have no reservations yet. Start with the reserve flow to book your table.
          </article>
        ) : null}

        {reservations.map((reservation) => {
          const cancellable = ['PENDING', 'CONFIRMED'].includes(reservation.status);

          return (
            <article
              key={reservation.id}
              className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Booking #{reservation.id}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">{reservation.tableNumber}</h3>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                    {reservation.reservationDate} | {reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)} | {reservation.guestCount} guests
                  </p>
                  {reservation.specialRequests ? (
                    <p className="mt-3 text-sm text-[color:var(--text-secondary)]">Note: {reservation.specialRequests}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={reservation.status} />
                  {cancellable ? (
                    <button type="button" className="btn-outline" onClick={() => handleCancel(reservation.id)}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </DashboardShell>
  );
}

function extractError(error) {
  return error?.response?.data?.error || error?.response?.data?.message || 'Unable to load reservations.';
}

export default MyReservations;
