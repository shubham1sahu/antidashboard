import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 md:px-8">
      <nav
        className={[
          'mx-auto flex w-full max-w-7xl items-center justify-between rounded-xl border px-4 py-3 transition-all md:px-6',
          scrolled
            ? 'border-[color:var(--border)] bg-white/80 shadow-[var(--shadow-md)] backdrop-blur-xl'
            : 'border-white/20 bg-white/60 backdrop-blur-md',
        ].join(' ')}
      >
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="LuxeServe" className="h-9 w-9 object-contain" />
          <span className="font-heading text-2xl text-[color:var(--primary)]">LuxeServe</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-[color:var(--text-secondary)] md:flex">
          <a href="#features" className="hover:text-[color:var(--primary)]">Features</a>
          <a href="#how-it-works" className="hover:text-[color:var(--primary)]">How It Works</a>
          <a href="#pricing" className="hover:text-[color:var(--primary)]">Pricing</a>
          <a href="#contact" className="hover:text-[color:var(--primary)]">Contact</a>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/login" className="btn-ghost hidden sm:inline-flex">
            Log In
          </Link>
          <Link to="/register" className="btn-accent">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default MarketingNavbar;
