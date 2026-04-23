import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import TableCard from '../../components/ui/TableCard';
import ToastMessage from '../../components/ui/ToastMessage';
import { createReservation } from '../../api/reservationApi';
import { getAvailableTables } from '../../api/tableApi';
import useReservationStore from '../../store/reservationStore';

const navItems = [
  { to: '/customer', label: 'Reserve', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'My Reservations' },
  { to: '/customer/profile', label: 'Profile' },
];

const steps = ['Choose slot', 'Pick table', 'Confirm booking'];

function ReservePage() {
  const {
    availableTables,
    selectedTable,
    selectedDate,
    selectedTime,
    selectedEndTime,
    guestCount,
    setAvailableTables,
    setSelectedTable,
    setSelectedDate,
    setSelectedTime,
    setSelectedEndTime,
    setGuestCount,
    resetSelection,
  } = useReservationStore((state) => state);

  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeout = window.setTimeout(() => setToast({ type: 'error', message: '' }), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const currentStep = useMemo(() => {
    if (booking) return 3;
    if (selectedTable) return 2;
    if (availableTables.length > 0) return 1;
    return 0;
  }, [availableTables.length, booking, selectedTable]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setBooking(null);
    setSelectedTable(null);

    try {
      const tables = await getAvailableTables({
        date: selectedDate,
        time: `${selectedTime}:00`,
        endTime: `${selectedEndTime}:00`,
        capacity: Number(guestCount),
      });
      setAvailableTables(tables);

      if (tables.length === 0) {
        setToast({ type: 'error', message: 'No tables match this date, time, and guest count.' });
      }
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
      setAvailableTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedTable) {
      setToast({ type: 'error', message: 'Select a table before confirming the booking.' });
      return;
    }

    setLoading(true);
    try {
      const reservation = await createReservation({
        tableId: selectedTable.id,
        reservationDate: selectedDate,
        startTime: `${selectedTime}:00`,
        endTime: `${selectedEndTime}:00`,
        guestCount: Number(guestCount),
        specialRequests,
      });
      setBooking(reservation);
      setToast({ type: 'success', message: `Reservation created successfully. Booking ID #${reservation.id}` });
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAgain = () => {
    setBooking(null);
    setSpecialRequests('');
    resetSelection();
  };

  return (
    <DashboardShell
      title="Reserve a Table"
      subtitle="Search live availability, avoid conflicts automatically, and submit a pending reservation for admin confirmation."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <section className="mb-6 grid gap-3 rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] md:grid-cols-3">
        {steps.map((step, index) => {
          const active = index <= currentStep;
          return (
            <div
              key={step}
              className={[
                'rounded-xl border p-4 transition',
                active ? 'border-[color:var(--accent)] bg-rose-50' : 'border-[color:var(--border)] bg-[color:var(--surface-alt)]',
              ].join(' ')}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Step {index + 1}</p>
              <p className="mt-2 font-semibold text-[color:var(--text-primary)]">{step}</p>
            </div>
          );
        })}
      </section>

      {booking ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-[var(--shadow-sm)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Booking successful</p>
          <h3 className="mt-3 text-3xl font-bold text-[color:var(--text-primary)]">Reservation #{booking.id}</h3>
          <p className="mt-3 max-w-2xl text-sm text-emerald-800">
            Your reservation is now pending admin confirmation. We have reserved table {booking.tableNumber} for {booking.guestCount} guests on {booking.reservationDate} from {formatTime(booking.startTime)} to {formatTime(booking.endTime)}.
          </p>
          <button type="button" className="btn-accent mt-6" onClick={handleStartAgain}>Book another table</button>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleSearch}>
              <div>
                <label className="label" htmlFor="reservation-date">Date</label>
                <input id="reservation-date" type="date" className="input" value={selectedDate} min={minDate()} onChange={(event) => setSelectedDate(event.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="start-time">Start time</label>
                <input id="start-time" type="time" className="input" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="end-time">End time</label>
                <input id="end-time" type="time" className="input" value={selectedEndTime} onChange={(event) => setSelectedEndTime(event.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="guest-count">Guests</label>
                <input id="guest-count" type="number" min="1" className="input" value={guestCount} onChange={(event) => setGuestCount(event.target.value)} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-accent w-full justify-center" disabled={loading}>
                  {loading ? 'Checking availability...' : 'Find available tables'}
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">Available Tables</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">
                    {availableTables.length ? `${availableTables.length} table options found for this slot.` : 'Run an availability search to load table options.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {availableTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    selected={selectedTable?.id === table.id}
                    onSelect={setSelectedTable}
                  />
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Booking summary</p>
              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Date" value={selectedDate || '-'} />
                <SummaryRow label="Time" value={`${selectedTime} - ${selectedEndTime}`} />
                <SummaryRow label="Guests" value={String(guestCount)} />
                <SummaryRow label="Selected table" value={selectedTable?.tableNumber || 'Not selected'} />
              </div>

              <div className="mt-5">
                <label className="label" htmlFor="special-requests">Special requests</label>
                <textarea
                  id="special-requests"
                  rows="5"
                  className="input"
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Birthday note, accessibility support, quiet corner..."
                />
              </div>

              <button type="button" className="btn-accent mt-6 w-full justify-center" disabled={loading || !selectedTable} onClick={handleReserve}>
                {loading ? 'Submitting...' : 'Submit reservation'}
              </button>
            </aside>
          </section>
        </>
      )}
    </DashboardShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[color:var(--text-secondary)]">{label}</span>
      <span className="font-semibold text-[color:var(--text-primary)]">{value}</span>
    </div>
  );
}

function extractError(error) {
  return error?.response?.data?.error || error?.response?.data?.message || 'Something went wrong while processing the reservation.';
}

function minDate() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function formatTime(time) {
  if (!time) return '';
  return time.slice(0, 5);
}

export default ReservePage;
