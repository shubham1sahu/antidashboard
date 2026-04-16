import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { getReservationsByDate } from '../../api/reservationApi';
import { getTables } from '../../api/tableApi';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
];

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTables: 0,
    availableTables: 0,
    occupiedTables: 0,
    todaysReservations: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [tables, reservations] = await Promise.all([
          getTables(),
          getReservationsByDate(today),
        ]);

        setStats({
          totalTables: tables.length,
          availableTables: tables.filter((table) => table.status === 'AVAILABLE').length,
          occupiedTables: tables.filter((table) => table.status === 'OCCUPIED').length,
          todaysReservations: reservations.length,
        });
      } catch (error) {
        setStats((current) => current);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    { label: 'Total Tables', value: stats.totalTables },
    { label: 'Available Tables', value: stats.availableTables },
    { label: 'Occupied Tables', value: stats.occupiedTables },
    { label: "Today's Reservations", value: stats.todaysReservations },
  ];

  return (
    <DashboardShell
      title="Admin Overview"
      subtitle="Epic-1 control center for table inventory, live availability, and reservation flow health."
      navItems={navItems}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm text-[color:var(--text-secondary)]">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-[color:var(--primary)]">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Availability Snapshot</h3>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Use this as the reception desk pulse for how much floor capacity is currently sellable.</p>
          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${stats.totalTables ? (stats.availableTables / stats.totalTables) * 100 : 0}%` }}
            />
          </div>
        </article>

        <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Reservation Pulse</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
            <li className="flex items-center justify-between"><span>Tables Ready to Sell</span><span className="font-semibold text-[color:var(--success)]">{stats.availableTables}</span></li>
            <li className="flex items-center justify-between"><span>Tables Occupied</span><span className="font-semibold text-[color:var(--error)]">{stats.occupiedTables}</span></li>
            <li className="flex items-center justify-between"><span>Reservations Today</span><span className="font-semibold">{stats.todaysReservations}</span></li>
          </ul>
        </article>
      </section>
    </DashboardShell>
  );
}

export default AdminDashboardPage;
