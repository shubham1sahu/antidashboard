function StatusBadge({ status }) {
  const map = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
    RESERVED: 'bg-amber-100 text-amber-700',
    OCCUPIED: 'bg-rose-100 text-rose-700',
    PREPARING: 'bg-blue-100 text-blue-700',
    READY: 'bg-emerald-100 text-emerald-700',
    SERVED: 'bg-slate-100 text-slate-700',
    PENDING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-slate-200 text-slate-700',
  };

  const normalizedStatus = String(status || '').toUpperCase();
  const label = normalizedStatus.replaceAll('_', ' ');

  return (
    <span className={["rounded-full px-2.5 py-1 text-xs font-semibold", map[normalizedStatus] || 'bg-slate-100 text-slate-700'].join(' ')}>
      {label}
    </span>
  );
}

export default StatusBadge;
