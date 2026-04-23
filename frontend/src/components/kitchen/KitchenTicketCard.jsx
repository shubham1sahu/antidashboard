import React from 'react';
import TimeElapsed from './TimeElapsed';

/**
 * Individual kitchen ticket card — pixel-matched to reference UI.
 *
 * Layout per reference image:
 *  Row 1:  "Table # X"  ............ ⏱ N min
 *  Items:  • Item name          x N (right-aligned, green)
 *          ↳ customization note (indented, small grey)
 *  Notes:  Notes: <text>  (blue label + text)
 *  Button: [▶ Start Cooking] / [✓ Mark Ready] / [Ready to Serve]
 *          OR served state: green "Served at HH:MM AM ✓"
 */
function KitchenTicketCard({ ticket, onStart, onReady, onServed }) {
  const { kitchenStatus, ticketId, tableNumber, items, specialInstructions, notes, createdAt, completedAt } = ticket;

  // ── Border colors per status
  const accentMap = {
    RECEIVED: 'var(--primary)',
    IN_PROGRESS: 'var(--warning)',
    READY: 'var(--success)',
    SERVED: 'var(--text-muted)',
  };
  const accentColor = accentMap[kitchenStatus] ?? accentMap.RECEIVED;

  const servedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  const notesText = specialInstructions || notes || null;

  return (
    <div
      id={`ticket-card-${ticketId}`}
      className="group relative rounded-xl border border-[color:var(--border)] bg-white p-5 transition-all hover:shadow-[var(--shadow-md)]"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      {/* ── Header: Table number + timer ────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--surface-alt)] text-[10px] font-bold text-[color:var(--primary)]">
            #
          </span>
          <span className="text-base font-bold text-[color:var(--text-primary)]">
            Table {tableNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--surface-alt)] px-2.5 py-1">
          <TimeElapsed createdAt={createdAt} />
        </div>
      </div>

      {/* ── Urgency Banner ──────────────────────────────────── */}
      {kitchenStatus !== 'SERVED' && (new Date() - new Date(createdAt)) > 15 * 60 * 1000 && (
        <div className="mb-3 animate-pulse bg-red-50 border border-red-100 rounded-lg p-2 flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">CRITICAL DELAY</span>
        </div>
      )}

      {/* ── Item list ───────────────────────────────────────── */}
      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.orderItemId} className="relative pl-4">
              <div className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--border)]" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[color:var(--text-primary)] leading-tight block">
                    {item.itemName}
                  </span>
                  {item.customizationNotes && (
                    <p className="mt-1 text-[11px] text-[color:var(--text-secondary)] italic leading-tight">
                      Note: {item.customizationNotes}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-[color:var(--accent)] bg-[color:var(--surface-alt)] px-2 py-0.5 rounded">
                  ×{item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────────── */}
      {notesText && (
        <div className="mt-4 rounded-lg bg-[color:var(--surface-alt)] p-3">
          <p className="text-[11px] leading-relaxed">
            <span className="font-bold text-[color:var(--primary)] uppercase tracking-wider text-[9px]">Instructions: </span>
            <span className="text-[color:var(--text-secondary)]">{notesText}</span>
          </p>
        </div>
      )}

      {/* ── Action button / Served state ────────────────────── */}
      <div className="mt-5 pt-2">
        {kitchenStatus === 'RECEIVED' && (
          <button
            id={`btn-start-${ticketId}`}
            onClick={() => onStart(ticketId)}
            className="w-full btn-accent justify-center py-2 text-xs"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            Start Preparing
          </button>
        )}

        {kitchenStatus === 'IN_PROGRESS' && (
          <button
            id={`btn-ready-${ticketId}`}
            onClick={() => onReady(ticketId)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--warning)] px-5 py-2 text-xs font-bold text-white transition hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Mark as Ready
          </button>
        )}

        {kitchenStatus === 'READY' && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--surface-alt)] py-2">
            <span className="text-[color:var(--success)] text-[11px] font-bold uppercase tracking-wider">Waiting for Waiter</span>
          </div>
        )}

        {kitchenStatus === 'SERVED' && servedTime && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-[color:var(--surface-alt)] py-2">
            <span className="text-[color:var(--success)] text-[11px] font-bold uppercase tracking-wider">Served at {servedTime}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[color:var(--success)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenTicketCard;
