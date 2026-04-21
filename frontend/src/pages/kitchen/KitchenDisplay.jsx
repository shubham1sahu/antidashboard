import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import { useKitchenStore } from '../../store/useKitchenStore';
import useAuthStore from '../../store/useAuthStore';
import useKitchenSocket from '../../hooks/useKitchenSocket';
import kitchenApi from '../../api/kitchenApi';
import KitchenColumn from '../../components/kitchen/KitchenColumn';

const COLUMNS = [
  { status: 'RECEIVED', label: 'NEW' },
  { status: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { status: 'READY', label: 'READY' },
  { status: 'SERVED', label: 'SERVED' },
];

const NEXT_STATUS = { RECEIVED: 'IN_PROGRESS', IN_PROGRESS: 'READY', READY: 'SERVED' };
const PREV_STATUS = { IN_PROGRESS: 'RECEIVED', READY: 'IN_PROGRESS', SERVED: 'READY' };

function KitchenDisplay() {
  const {
    setTickets, updateTicket, setLoading, setError,
    getTicketsByStatus, isLoading, optimisticUpdateStatus,
  } = useKitchenStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [wsConnected, setWsConnected] = useState(false);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch real tickets — but NEVER clear the store on failure
  const fetchAllTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kitchenApi.getAllTickets();
      const data = res?.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      console.log('[KDS] API returned', list.length, 'tickets');
      setTickets(list); // store ignores empty arrays to preserve mock data
    } catch (err) {
      // Swallow error silently — mock data remains visible
      console.warn('[KDS] API fetch failed (mock data preserved):', err?.message);
    } finally {
      setLoading(false);
    }
  }, [setTickets, setLoading, setError]);

  // Only show loading spinner on very first mount if no tickets exist yet
  // Since mock data is pre-populated, isLoading should resolve instantly
  useEffect(() => { fetchAllTickets(); }, [fetchAllTickets]);

  // WebSocket handlers
  const handleTicketUpdate = useCallback((ticket) => {
    updateTicket(ticket);
    toast(`Table #${ticket.tableNumber} → ${ticket.kitchenStatus}`, {
      icon: '🍴', duration: 2500, id: `ws-${ticket.ticketId}`,
    });
  }, [updateTicket]);

  const handleReconnect = useCallback(() => {
    setWsConnected(true);
    fetchAllTickets();
  }, [fetchAllTickets]);

  useKitchenSocket(handleTicketUpdate, true, handleReconnect);

  // Optimistic action handlers with revert on API failure
  const makeHandler = useCallback((apiCall, fromStatus) => async (ticketId) => {
    const next = NEXT_STATUS[fromStatus];
    if (!next) return;
    // Move card instantly in UI
    optimisticUpdateStatus(ticketId, next);
    // Skip API for mock ticket IDs (>= 1000 are mock)
    if (ticketId >= 1000) return;
    try {
      await apiCall(ticketId);
    } catch (err) {
      optimisticUpdateStatus(ticketId, PREV_STATUS[next] ?? fromStatus); // revert
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  }, [optimisticUpdateStatus]);

  const handleStart = useCallback(makeHandler(kitchenApi.startCooking, 'RECEIVED'), [makeHandler]);
  const handleReady = useCallback(makeHandler(kitchenApi.markReady, 'IN_PROGRESS'), [makeHandler]);
  const handleServed = useCallback(makeHandler(kitchenApi.markServed, 'READY'), [makeHandler]);

  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-[#080d18] text-white flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className="bg-[#0b1120] border-b border-slate-800 px-5 py-2.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect y="4" width="24" height="2" rx="1" /><rect y="11" width="24" height="2" rx="1" /><rect y="18" width="24" height="2" rx="1" />
            </svg>
          </span>
          <span className="text-base">🍳</span>
          <h1 className="text-sm font-extrabold tracking-[0.16em] uppercase text-white">Kitchen Display</h1>
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}
            title={wsConnected ? 'Live' : 'Connecting…'}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400 hidden sm:block">{dateStr}</span>
          <div className="w-px h-5 bg-slate-700" />
          <time className="font-mono text-white tabular-nums">{timeStr}</time>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ══ KANBAN GRID ════════════════════════════════════════ */}
      <main className="flex-1 grid grid-cols-4 divide-x divide-slate-800/70 overflow-hidden">
        {COLUMNS.map((col) => (
          <div key={col.status} className="px-3 pt-3 pb-2 flex flex-col overflow-hidden">
            <KitchenColumn
              status={col.status}
              label={col.label}
              tickets={getTicketsByStatus(col.status)}
              onStart={handleStart}
              onReady={handleReady}
              onServed={handleServed}
            />
          </div>
        ))}
      </main>

      {/* ══ FOOTER LEGEND ═══════════════════════════════════════ */}
      <footer className="bg-[#0b1120] border-t border-slate-800 px-5 py-2 flex items-center gap-6 text-[11px] text-slate-500 flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Time = Time since order placed
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span className="text-red-400">Red time</span> = More than 15 mins
        </span>
        <span>Click on buttons to update order status</span>
        {isLoading && <span className="ml-auto text-blue-400 animate-pulse">Syncing with server…</span>}
      </footer>
    </div>
  );
}

export default KitchenDisplay;
