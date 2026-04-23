import DashboardShell from '../../components/layout/DashboardShell';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerDashboardPage() {
  return (
    <DashboardShell
      title="Customer Dashboard"
      subtitle="Track reservations, discover menu specials, and manage your dining schedule."
      navItems={navItems}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Upcoming Reservation', value: 'Today, 8:00 PM' },
          { title: 'Reward Points', value: '1,280 pts' },
          { title: 'Recent Orders', value: '6 orders' },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[color:var(--text-secondary)]">{item.title}</p>
            <p className="mt-3 text-2xl font-bold text-[color:var(--primary)]">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Recommended Tonight</h3>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
          Chef's seasonal tasting menu with wine pairing is available for your upcoming reservation.
        </p>
      </section>
    </DashboardShell>
  );
}

export default CustomerDashboardPage;
