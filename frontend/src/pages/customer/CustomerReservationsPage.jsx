import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerReservationsPage() {
  const reservations = [
    { date: '15 Apr 2026', time: '8:00 PM', party: 4, status: 'Reserved' },
    { date: '23 Apr 2026', time: '7:15 PM', party: 2, status: 'Pending' },
  ];

  return (
    <DashboardShell
      title="Your Reservations"
      subtitle="Manage upcoming bookings and modify seating preferences."
      navItems={navItems}
    >
      <section className="space-y-4">
        {reservations.map((item) => (
          <article
            key={`${item.date}-${item.time}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]"
          >
            <div>
              <p className="text-sm text-[color:var(--text-secondary)]">{item.date}</p>
              <p className="text-lg font-semibold text-[color:var(--text-primary)]">{item.time}</p>
              <p className="text-sm text-[color:var(--text-secondary)]">Party of {item.party}</p>
            </div>
            <StatusBadge status={item.status} />
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}

export default CustomerReservationsPage;
