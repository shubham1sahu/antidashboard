import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
];

function AdminReservationsPage() {
  const reservations = [
    { guest: 'Olivia Johnson', table: 'T4', time: '7:30 PM', status: 'Reserved' },
    { guest: 'Ravi Kapoor', table: 'T2', time: '8:00 PM', status: 'Reserved' },
    { guest: 'Emma Garcia', table: 'T7', time: '8:15 PM', status: 'Pending' },
    { guest: 'Noah Smith', table: 'T1', time: '8:45 PM', status: 'Completed' },
  ];

  return (
    <DashboardShell title="Reservations" subtitle="Daily reservation pipeline and statuses." navItems={navItems}>
      <section className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[color:var(--surface-alt)] text-[color:var(--text-secondary)]">
            <tr>
              <th className="px-6 py-4 font-semibold">Guest</th>
              <th className="px-6 py-4 font-semibold">Table</th>
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((item) => (
              <tr key={`${item.guest}-${item.time}`} className="border-t border-[color:var(--border)]">
                <td className="px-6 py-4">{item.guest}</td>
                <td className="px-6 py-4">{item.table}</td>
                <td className="px-6 py-4">{item.time}</td>
                <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardShell>
  );
}

export default AdminReservationsPage;
