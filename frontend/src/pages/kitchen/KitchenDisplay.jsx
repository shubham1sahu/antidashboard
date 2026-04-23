import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useKitchenStore } from '../../store/useKitchenStore';
import useKitchenSocket from '../../hooks/useKitchenSocket';
import kitchenApi from '../../api/kitchenApi';
import KitchenColumn from '../../components/kitchen/KitchenColumn';
import DashboardShell from '../../components/layout/DashboardShell';

const COLUMNS = [
  { status: 'RECEIVED', label: 'New' },
  { status: 'IN_PROGRESS', label: 'Preparing' },
  { status: 'READY', label: 'Ready' },
  { status: 'SERVED', label: 'Served' },
];

const NEXT_STATUS = { RECEIVED: 'IN_PROGRESS', IN_PROGRESS: 'READY', READY: 'SERVED' };
const PREV_STATUS = { IN_PROGRESS: 'RECEIVED', READY: 'IN_PROGRESS', SERVED: 'READY' };

const navItems = [
  { to: '/kitchen', label: 'Kitchen Screen', end: true },
];

function KitchenDisplay() {
  const {
    setTickets, updateTicket, setLoading,
    getTicketsByStatus, isLoading, optimisticUpdateStatus,
  } = useKitchenStore();

  const [wsConnected, setWsConnected] = useState(false);

  // Fetch real tickets — but NEVER clear the store on failure
  const fetchAllTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await kitchenApi.getAllTickets();
      const data = res?.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      // We only keep mock data if the incoming is null/undefined. 
      // If it's an empty array, it means the backend really has no tickets.
      if (list !== null && list !== undefined) {
        setTickets(list);
      }
    } catch (err) {
      console.warn('[KDS] API fetch failed (mock data preserved):', err?.message);
    } finally {
      setLoading(false);
    }
  }, [setTickets, setLoading]);

  useEffect(() => { fetchAllTickets(); }, [fetchAllTickets]);

  // WebSocket handlers
  const handleTicketUpdate = useCallback((ticket) => {
    // Global signals like "ORDER_UPDATED" come as strings
    if (typeof ticket === 'string') {
      console.log('[KDS] Received global signal:', ticket);
      fetchAllTickets();
      return;
    }

    const isNew = !getTicketsByStatus('RECEIVED').some(t => t.ticketId === ticket.ticketId) && 
                  !getTicketsByStatus('IN_PROGRESS').some(t => t.ticketId === ticket.ticketId) &&
                  !getTicketsByStatus('READY').some(t => t.ticketId === ticket.ticketId) &&
                  !getTicketsByStatus('SERVED').some(t => t.ticketId === ticket.ticketId);

    updateTicket(ticket);

    if (isNew && ticket.kitchenStatus === 'RECEIVED') {
      // Play a subtle notification sound for new orders
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Audio play blocked'));
      
      toast.success(`NEW ORDER: Table ${ticket.tableNumber}`, {
        icon: '🔔',
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
        }
      });
    } else {
      toast(`Table #${ticket.tableNumber} → ${ticket.kitchenStatus.replace('_', ' ')}`, {
        icon: '🍴', duration: 2500, id: `ws-${ticket.ticketId}`,
      });
    }
  }, [updateTicket, getTicketsByStatus, fetchAllTickets]);

  const handleReconnect = useCallback(() => {
    setWsConnected(true);
    fetchAllTickets();
  }, [fetchAllTickets]);

  useKitchenSocket(handleTicketUpdate, true, handleReconnect);

  const makeHandler = useCallback((apiCall, fromStatus) => async (ticketId) => {
    const next = NEXT_STATUS[fromStatus];
    if (!next) return;
    optimisticUpdateStatus(ticketId, next);
    if (ticketId >= 1000) return;
    try {
      await apiCall(ticketId);
    } catch (err) {
      optimisticUpdateStatus(ticketId, PREV_STATUS[next] ?? fromStatus);
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  }, [optimisticUpdateStatus]);

  const handleStart = useCallback(makeHandler(kitchenApi.startCooking, 'RECEIVED'), [makeHandler]);
  const handleReady = useCallback(makeHandler(kitchenApi.markReady, 'IN_PROGRESS'), [makeHandler]);
  const handleServed = useCallback(makeHandler(kitchenApi.markServed, 'READY'), [makeHandler]);

  return (
    <DashboardShell
      title="Kitchen Display"
      subtitle="Live order flow and kitchen performance monitoring."
      navItems={navItems}
    >
      <div className="flex flex-col h-[calc(100vh-220px)]">
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-hidden">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col overflow-hidden bg-white rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-sm)] p-4">
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

        <footer className="mt-6 flex flex-wrap items-center gap-6 text-xs text-[color:var(--text-secondary)] bg-white p-4 rounded-xl border border-[color:var(--border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[color:var(--success)]' : 'bg-[color:var(--text-muted)]'}`} />
            <span>{wsConnected ? 'Live Connection Active' : 'Connecting to Server...'}</span>
          </div>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[color:var(--primary)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Time = Total wait time
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[color:var(--error)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span className="text-[color:var(--error)] font-medium">Critical (15m+)</span>
          </span>
          {isLoading && <span className="ml-auto text-[color:var(--accent)] animate-pulse font-medium">Syncing...</span>}
        </footer>
      </div>
    </DashboardShell>
  );
}

export default KitchenDisplay;

