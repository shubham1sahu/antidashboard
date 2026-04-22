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
  const borderMap = {
    RECEIVED:    'border-[color:var(--accent)]',
    IN_PROGRESS: 'border-[color:var(--warning)]',
    READY:       'border-[color:var(--success)]',
    SERVED:      'border-[color:var(--border)]',
  };
  const border = borderMap[kitchenStatus] ?? borderMap.RECEIVED;

  // ── Format completedAt for SERVED cards
  const servedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  // ── Merged notes/instructions string
  const notesText = specialInstructions || notes || null;

  return (
    <div
      id={`ticket-card-${ticketId}`}
      className={`rounded-lg border ${border} bg-[color:var(--surface)] p-3 space-y-2`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* ── Header: Table number + timer ────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-bold text-[color:var(--text-primary)] leading-none">
          Table # {tableNumber}
        </span>
        <TimeElapsed createdAt={createdAt} />
      </div>

      {/* ── Item list ───────────────────────────────────────── */}
      {items && items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.orderItemId}>
              {/* Main item row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[color:var(--text-muted)] text-sm flex-shrink-0">•</span>
                  <span className="text-[color:var(--text-secondary)] text-sm truncate">{item.itemName}</span>
                </div>
                <span className="text-[color:var(--success)] text-xs font-semibold flex-shrink-0">x {item.quantity}</span>
              </div>
              {/* Customization note (indented) */}
              {item.customizationNotes && (
                <p className="text-xs text-[color:var(--text-muted)] pl-4 leading-tight">
                  ↳ {item.customizationNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────────── */}
      {notesText && (
        <p className="text-xs leading-snug">
          <span className="text-[color:var(--accent)] font-semibold">Notes: </span>
          <span className="text-[color:var(--text-secondary)]">{notesText}</span>
        </p>
      )}

      {/* ── Action button / Served state ────────────────────── */}
      {kitchenStatus === 'RECEIVED' && (
        <div className="flex justify-end pt-1">
          <button
            id={`btn-start-${ticketId}`}
            onClick={() => onStart(ticketId)}
            className="flex items-center gap-1.5 bg-[color:var(--accent)] hover:brightness-110 active:brightness-90 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            Start Cooking
          </button>
        </div>
      )}

      {kitchenStatus === 'IN_PROGRESS' && (
        <div className="flex justify-end pt-1">
          <button
            id={`btn-ready-${ticketId}`}
            onClick={() => onReady(ticketId)}
            className="flex items-center gap-1.5 bg-[color:var(--warning)] hover:brightness-110 active:brightness-90 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Mark Ready
          </button>
        </div>
      )}

      {kitchenStatus === 'READY' && (
        <button
          id={`btn-served-${ticketId}`}
          onClick={() => onServed(ticketId)}
          className="w-full bg-[color:var(--success)] hover:brightness-110 active:brightness-90 text-white text-xs font-bold py-2 rounded-md transition-all mt-1"
        >
          Ready to Serve
        </button>
      )}

      {kitchenStatus === 'SERVED' && servedTime && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[color:var(--success)] text-xs font-semibold">Served at {servedTime}</span>
          <span className="w-4 h-4 rounded-full border border-[color:var(--success)] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-[color:var(--success)]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </div>
      )}
    </div>
  );
}

export default KitchenTicketCard;
