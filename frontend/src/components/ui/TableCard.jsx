import StatusBadge from './StatusBadge';

function TableCard({ table, selected, onSelect, disabled = false }) {
  return (
    <article
      className={[
        'rounded-2xl border bg-white p-5 shadow-[var(--shadow-sm)] transition',
        selected ? 'border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20' : 'border-[color:var(--border)]',
        disabled ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Table</p>
          <h3 className="mt-2 text-2xl font-bold text-[color:var(--text-primary)]">{table.tableNumber}</h3>
        </div>
        <StatusBadge status={table.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[color:var(--surface-alt)] p-4 text-sm">
        <div>
          <p className="text-[color:var(--text-muted)]">Capacity</p>
          <p className="mt-1 font-semibold text-[color:var(--text-primary)]">{table.capacity} guests</p>
        </div>
        <div>
          <p className="text-[color:var(--text-muted)]">Floor</p>
          <p className="mt-1 font-semibold text-[color:var(--text-primary)]">{table.floorNumber}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[color:var(--text-muted)]">Location</p>
          <p className="mt-1 font-semibold text-[color:var(--text-primary)]">{table.location}</p>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect?.(table)}
        className={[
          'mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition',
          selected
            ? 'bg-[color:var(--primary)] text-white'
            : 'bg-[color:var(--surface-alt)] text-[color:var(--text-primary)] hover:bg-[color:var(--primary)] hover:text-white',
        ].join(' ')}
      >
        {selected ? 'Selected' : 'Select table'}
      </button>
    </article>
  );
}

export default TableCard;
