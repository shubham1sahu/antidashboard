import React from 'react';
import KitchenTicketCard from './KitchenTicketCard';

/**
 * Column header colors — refined for light theme.
 */
const COLUMN_COLORS = {
  RECEIVED:    { text: 'text-[color:var(--primary)]', badge: 'bg-[color:var(--primary)]', divider: 'border-[color:var(--border)]' },
  IN_PROGRESS: { text: 'text-[color:var(--warning)]', badge: 'bg-[color:var(--warning)]', divider: 'border-[color:var(--border)]' },
  READY:       { text: 'text-[color:var(--success)]',  badge: 'bg-[color:var(--success)]', divider: 'border-[color:var(--border)]' },
  SERVED:      { text: 'text-[color:var(--text-muted)]', badge: 'bg-[color:var(--text-muted)]', divider: 'border-[color:var(--border)]' },
};

/** Empty state text per column */
const EMPTY_TEXT = {
  RECEIVED:    'No new orders',
  IN_PROGRESS: 'No orders being prepared',
  READY:       'Nothing ready for service',
  SERVED:      'No served orders yet',
};

function KitchenColumn({ status, label, tickets, onStart, onReady, onServed }) {
  const colors = COLUMN_COLORS[status] ?? COLUMN_COLORS.RECEIVED;

  return (
    <div id={`column-${status}`} className="flex flex-col h-full">
      {/* ── Column header ──────────────────────────────── */}
      <div className={`flex items-center justify-between mb-4 pb-2 border-b ${colors.divider}`}>
        <h2 className={`text-xs font-bold tracking-wider uppercase ${colors.text}`}>
          {label}
        </h2>
        <span className={`text-[10px] font-bold ${colors.badge} text-white w-5 h-5 rounded-full flex items-center justify-center`}>
          {tickets.length}
        </span>
      </div>

      {/* ── Scrollable ticket list ─────────────────────── */}
      <div
        className="flex-1 space-y-4 overflow-y-auto pr-1"
        style={{
          maxHeight: 'calc(100vh - 300px)',
          scrollbarWidth: 'thin',
        }}
      >
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-xs text-[color:var(--text-muted)] font-medium italic">
              {EMPTY_TEXT[status]}
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <KitchenTicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onStart={onStart}
              onReady={onReady}
              onServed={onServed}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default KitchenColumn;
