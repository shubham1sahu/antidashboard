import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { cancelReservation, confirmReservation, getReservationsByDate } from '../../api/reservationApi';
import { updateStatus } from '../../api/tableApi';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
];

function ReservationManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    loadReservations(selectedDate);
  }, [selectedDate]);

  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter((item) => item.status === 'PENDING').length,
    confirmed: reservations.filter((item) => item.status === 'CONFIRMED').length,
    cancelled: reservations.filter((item) => item.status === 'CANCELLED').length,
  }), [reservations]);

  const loadReservations = async (date) => {
    try {
      setLoading(true);
      const data = await getReservationsByDate(date);
      setReservations(data);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmReservation(id);
      setToast({ type: 'success', message: 'Reservation confirmed and table moved to RESERVED.' });
      await loadReservations(selectedDate);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelReservation(id);
      setToast({ type: 'success', message: 'Reservation cancelled and table released to AVAILABLE.' });
      await loadReservations(selectedDate);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  const handleOccupy = async (tableId) => {
    try {
      await updateStatus(tableId, 'OCCUPIED');
      setToast({ type: 'success', message: 'Table marked as OCCUPIED.' });
      await loadReservations(selectedDate);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  return (
    <DashboardShell
      title="Reservation Management"
      subtitle="Review the reservation pipeline by date, confirm pending bookings, cancel conflicts, and mark arrivals as occupied."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total reservations" value={stats.total} />
        <MetricCard label="Pending" value={stats.pending} />
        <MetricCard label="Confirmed" value={stats.confirmed} />
        <MetricCard label="Cancelled" value={stats.cancelled} />
      </section>

      <section className="mt-6 rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label className="label" htmlFor="reservation-filter-date">Reservation date</label>
            <input
              id="reservation-filter-date"
              type="date"
              className="input"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <p className="text-sm text-[color:var(--text-secondary)]">Customer reservations for the selected date appear here in live status order.</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--surface-alt)] text-[color:var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Guest</th>
                <th className="px-4 py-3 font-semibold">Table</th>
                <th className="px-4 py-3 font-semibold">Slot</th>
                <th className="px-4 py-3 font-semibold">Guests</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-[color:var(--text-secondary)]" colSpan="6">Loading reservations...</td>
                </tr>
              ) : null}

              {!loading && reservations.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-[color:var(--text-secondary)]" colSpan="6">No reservations found for this date.</td>
                </tr>
              ) : null}

              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4">{reservation.user.firstName} {reservation.user.lastName}</td>
                  <td className="px-4 py-4">{reservation.tableNumber}</td>
                  <td className="px-4 py-4">{reservation.startTime.slice(0, 5)} - {reservation.endTime.slice(0, 5)}</td>
                  <td className="px-4 py-4">{reservation.guestCount}</td>
                  <td className="px-4 py-4"><StatusBadge status={reservation.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {reservation.status === 'PENDING' ? (
                        <button type="button" className="btn-accent" onClick={() => handleConfirm(reservation.id)}>Confirm</button>
                      ) : null}
                      {['PENDING', 'CONFIRMED'].includes(reservation.status) ? (
                        <button type="button" className="btn-outline" onClick={() => handleCancel(reservation.id)}>Cancel</button>
                      ) : null}
                      {reservation.status === 'CONFIRMED' ? (
                        <button type="button" className="btn-ghost" onClick={() => handleOccupy(reservation.tableId)}>Mark occupied</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <p className="text-sm text-[color:var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[color:var(--primary)]">{value}</p>
    </article>
  );
}

function extractError(error) {
  return error?.response?.data?.error || error?.response?.data?.message || 'Unable to complete the reservation action.';
}

export default ReservationManagement;
