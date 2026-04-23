import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingNavbar from '../components/layout/MarketingNavbar';
import SiteFooter from '../components/layout/SiteFooter';

function CounterStat({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            const startTime = performance.now();
            const duration = 1200;

            const tick = (now) => {
              const progress = Math.min((now - startTime) / duration, 1);
              setCount(Math.floor(value * progress));
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-white md:text-5xl">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-slate-300">{label}</p>
    </div>
  );
}

function LandingPage() {
  const featureCards = useMemo(
    () => [
      {
        icon: '🪑',
        title: 'Table Management',
        description: 'Real-time floor view, drag & drop setup, instant status updates',
      },
      {
        icon: '📅',
        title: 'Smart Reservations',
        description: 'Online booking with conflict prevention and auto-confirmation',
      },
      {
        icon: '🍽️',
        title: 'Digital Menu & Ordering',
        description: 'QR menu, customizable items, live order tracking',
      },
      {
        icon: '💳',
        title: 'Billing & Payments',
        description: 'Itemized bills, multi-method payment, instant receipts',
      },
    ],
    []
  );

  return (
    <div className="bg-[color:var(--surface)] text-[color:var(--text-primary)]">
      <MarketingNavbar />

      <section className="hero-pattern relative isolate flex min-h-[100vh] items-center overflow-hidden px-6 pb-20 pt-10 md:px-10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[color:var(--border)] bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Restaurant Operations, Reimagined
            </p>
            <h1 className="font-heading text-5xl leading-tight text-white md:text-6xl">
              The Smartest Way to Run Your Restaurant
            </h1>
            <p className="mt-6 max-w-xl text-base text-slate-200 md:text-lg">
              Streamline reservations, floor management, and order fulfillment from one elegant dashboard your team
              can master in minutes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-accent">
                Get Started Free
              </Link>
              <a href="#how-it-works" className="btn-outline text-white hover:bg-white/10">
                See How It Works
              </a>
            </div>
          </div>

          <div className="animate-float rounded-xl border border-white/20 bg-white/10 p-6 shadow-[var(--shadow-lg)] backdrop-blur-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Live Floor Plan</h3>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Reserved
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Occupied
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 rounded-lg bg-white/80 p-4">
              {['Available', 'Reserved', 'Occupied', 'Available', 'Occupied', 'Reserved', 'Available', 'Available'].map(
                (status, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">T{idx + 1}</p>
                    <div
                      className={[
                        'mx-auto mt-2 h-3 w-3 rounded-full',
                        status === 'Available' && 'bg-emerald-500',
                        status === 'Reserved' && 'bg-amber-500',
                        status === 'Occupied' && 'bg-rose-500',
                      ].join(' ')}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <h2 className="font-heading text-center text-4xl text-[color:var(--primary)] md:text-5xl">
          Everything Your Restaurant Needs
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--accent)] text-lg text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--primary)] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <CounterStat value={98} suffix="%" label="Order Accuracy" />
          <CounterStat value={60} suffix="%" label="Online Reservations" />
          <CounterStat value={15} suffix=" min" label="Processing Time" />
          <CounterStat value={45} suffix="/5" label="Customer Rating" />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <h2 className="font-heading text-center text-4xl text-[color:var(--primary)] md:text-5xl">How It Works</h2>
        <div className="relative mt-12 grid gap-5 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-11 hidden border-t-2 border-dashed border-[color:var(--border)] md:block" />
          {[
            { title: 'Reserve', description: 'Guests book online with instant conflict checks.', icon: '📅' },
            { title: 'Seated', description: 'Host assigns optimized tables with live visibility.', icon: '🪑' },
            { title: 'Order', description: 'Orders flow to kitchen in real-time.', icon: '🍝' },
            { title: 'Pay', description: 'Fast checkout with digital receipts.', icon: '💳' },
          ].map((step, index) => (
            <div key={step.title} className="relative rounded-xl border border-[color:var(--border)] bg-white p-6 text-center shadow-[var(--shadow-sm)]">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-2xl">{step.icon}</p>
              <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">{step.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--surface-alt)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-center text-4xl text-[color:var(--primary)] md:text-5xl">Loved by Growing Restaurants</h2>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                quote: 'LuxeServe cut our table wait times by half and our staff finally feels in sync every shift.',
                name: 'Ariana Lopez',
                restaurant: 'Cedar Bistro',
              },
              {
                quote: 'Reservations, menu updates, and service handoffs now happen without chaos.',
                name: 'Marcus Chen',
                restaurant: 'Lotus & Grain',
              },
              {
                quote: 'The dashboards made decisions obvious. We improved throughput in just two weeks.',
                name: 'Nina Patel',
                restaurant: 'North Dock Kitchen',
              },
            ].map((testimonial) => (
              <article key={testimonial.name} className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                <p className="mb-3 text-amber-400">★★★★★</p>
                <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">“{testimonial.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[color:var(--primary-light)]" />
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{testimonial.name}</p>
                    <p className="text-xs text-[color:var(--text-muted)]">{testimonial.restaurant}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-[color:var(--primary)] px-6 py-12 text-center md:px-10">
          <h2 className="font-heading text-4xl text-white md:text-5xl">Ready to Transform Your Restaurant?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Launch LuxeServe in minutes and get your front-of-house, kitchen, and billing teams operating as one.
          </p>
          <Link to="/register" className="btn-accent mt-8 inline-flex">
            Start Free Today
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default LandingPage;
