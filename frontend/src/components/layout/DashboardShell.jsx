import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

function DashboardShell({ title, subtitle, navItems, children }) {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore((state) => ({
    role: state.role,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[color:var(--surface-alt)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-0 md:grid-cols-[240px_1fr]">
        <aside className="border-r border-[color:var(--border)] bg-white px-4 py-6 md:px-5">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="LuxeServe" className="h-8 w-8 object-contain" />
              <h1 className="font-heading text-2xl text-[color:var(--primary)]">LuxeServe</h1>
            </div>
            <p className="mt-1 text-xs tracking-wide text-[color:var(--text-muted)]">{role}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'block rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[color:var(--primary)] text-white'
                      : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={handleLogout} className="btn-accent mt-8 w-full justify-center">
            Logout
          </button>
        </aside>

        <main className="p-4 md:p-8">
          <header className="mb-6 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{subtitle}</p> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
