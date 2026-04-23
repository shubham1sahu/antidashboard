import useAuthStore from '../../store/useAuthStore';
import StatusBadge from '../../components/ui/StatusBadge';

function KitchenPage() {
  const logout = useAuthStore((state) => state.logout);

  const tickets = [
    { id: '#K-102', table: 'T4', items: '2x Pasta, 1x Soup', status: 'Preparing', eta: '06:30' },
    { id: '#K-103', table: 'T1', items: '1x Steak, 2x Salad', status: 'Ready', eta: '01:40' },
    { id: '#K-104', table: 'T7', items: '3x Burger, 1x Fries', status: 'Preparing', eta: '08:10' },
  ];

  return (
    <main className="min-h-screen bg-[color:var(--surface-alt)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div>
            <h1 className="font-heading text-3xl text-[color:var(--primary)]">Kitchen Screen</h1>
            <p className="text-sm text-[color:var(--text-secondary)]">Manage active tickets and cooking workflow.</p>
          </div>
          <button onClick={logout} type="button" className="btn-accent">Logout</button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">{ticket.id}</h2>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Table: {ticket.table}</p>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{ticket.items}</p>
              <p className="mt-4 text-sm font-semibold text-[color:var(--accent)]">ETA: {ticket.eta}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default KitchenPage;
