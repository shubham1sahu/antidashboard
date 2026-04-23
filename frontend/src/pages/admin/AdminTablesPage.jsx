import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
];

function AdminTablesPage() {
  const tables = [
    { table: 'T1', seats: 2, status: 'Occupied' },
    { table: 'T2', seats: 4, status: 'Reserved' },
    { table: 'T3', seats: 6, status: 'Available' },
    { table: 'T4', seats: 2, status: 'Occupied' },
    { table: 'T5', seats: 8, status: 'Available' },
    { table: 'T6', seats: 4, status: 'Reserved' },
  ];

  return (
    <DashboardShell title="Tables" subtitle="Visual table status and seat capacity overview." navItems={navItems}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((item) => (
          <article key={item.table} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{item.table}</h3>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">Seats: {item.seats}</p>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}

export default AdminTablesPage;
