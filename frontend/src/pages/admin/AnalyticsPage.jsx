import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { getAnalytics } from '../../api/analyticsApi';
import ToastMessage from '../../components/ui/ToastMessage';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await getAnalytics();
      setData(result);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load analytics data.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <DashboardShell title="Analytics" navItems={navItems}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[color:var(--primary)]"></div>
        </div>
      </DashboardShell>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `$${Number(data?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: 'Reservations', value: data?.totalReservations || 0, icon: '📅', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Users', value: data?.totalUsers || 0, icon: '👥', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <DashboardShell
      title="Platform Analytics"
      subtitle="Comprehensive insights into revenue growth, ordering trends, and operational efficiency."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      {/* Metric Cards */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[color:var(--text-secondary)]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <section className="rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-[color:var(--text-primary)]">Revenue Trend (Last 7 Days)</h3>
          <div className="relative flex h-64 items-end justify-between gap-2 pt-8">
            {data?.revenueTrend?.map((day, idx) => {
              const maxRevenue = Math.max(...data.revenueTrend.map(d => d.amount), 1);
              const height = (day.amount / maxRevenue) * 100;
              return (
                <div key={idx} className="group relative flex flex-1 flex-col items-center">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-[color:var(--primary)] to-[color:var(--accent)] transition-all duration-500 hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-800 px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                      ${day.amount}
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-medium text-[color:var(--text-secondary)] uppercase">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
              );
            })}
            <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--border)]"></div>
          </div>
        </section>

        {/* Top Selling Items */}
        <section className="rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-[color:var(--text-primary)]">Most Popular Dishes</h3>
          <div className="space-y-6">
            {data?.topItems?.map((item, idx) => {
              const maxQty = Math.max(...data.topItems.map(i => i.quantity), 1);
              const width = (item.quantity / maxQty) * 100;
              return (
                <div key={idx}>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span className="text-[color:var(--text-primary)]">{item.name}</span>
                    <span className="text-[color:var(--text-secondary)]">{item.quantity} sold</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[color:var(--accent)] transition-all duration-1000"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!data?.topItems || data.topItems.length === 0) && (
              <p className="py-8 text-center text-sm text-[color:var(--text-secondary)] italic">No sales data available yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Category Breakdown */}
      <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-xl font-bold text-[color:var(--text-primary)]">Revenue by Category</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.categorySales?.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] p-4 hover:bg-[color:var(--surface-alt)] transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)]/10 text-lg">
                🍴
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider">{cat.categoryName}</p>
                <p className="text-lg font-bold text-[color:var(--primary)]">${Number(cat.revenue).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {(!data?.categorySales || data.categorySales.length === 0) && (
            <p className="col-span-full py-8 text-center text-sm text-[color:var(--text-secondary)] italic">No category data available yet.</p>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

export default AnalyticsPage;
