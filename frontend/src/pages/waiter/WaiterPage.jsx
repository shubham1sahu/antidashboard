import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { getTables, updateStatus } from '../../api/tableApi';
import { createWalkIn } from '../../api/reservationApi';
import { menuApi } from '../../api/menuApi';
import { createOrder, getOrders, updateOrderStatus } from '../../api/orderApi';
import { billService } from '../../api/billService';
import { categoryApi } from '../../api/categoryApi';
import useKitchenSocket from '../../hooks/useKitchenSocket';

const navItems = [
  { to: '/waiter', label: 'Floor Map', end: true },
];

function WaiterPage() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  // UI State
  const [activeTable, setActiveTable] = useState(null);
  const [tableDrafts, setTableDrafts] = useState({}); // { tableId: [{ menuItemId, quantity, name, price }] }
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('ORDERS'); // 'ORDERS', 'PAST_ORDERS', or 'MENU'

  // Modals state
  const [walkInTable, setWalkInTable] = useState(null);
  const [walkInForm, setWalkInForm] = useState({ guestCount: 1, customerName: '' });

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = (msg) => {
    console.log('[Waiter] Syncing...', msg);
    if (msg && msg.ticketId && msg.kitchenStatus && msg.tableNumber) {
      setToast({ type: 'success', message: `Table ${msg.tableNumber} order is ${msg.kitchenStatus.replace('_', ' ')}` });
    }
    loadData();
  };

  useKitchenSocket(handleUpdate);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = async () => {
    try {
      const [tableData, orderData, menuData, categoryData] = await Promise.all([
        getTables(),
        getOrders(),
        menuApi.getAllMenuItems(true),
        categoryApi.getAllCategories()
      ]);
      setTables(Array.isArray(tableData) ? tableData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setMenuItems(menuData?.data && Array.isArray(menuData.data) ? menuData.data : []);
      setCategories(categoryData?.data && Array.isArray(categoryData.data) ? categoryData.data : []);
      setLastUpdated(new Date());
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to sync data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    if (table.status === 'AVAILABLE') {
      setWalkInTable(table);
      setWalkInForm({ guestCount: table.capacity, customerName: '' });
    } else if (table.status === 'OCCUPIED') {
      setActiveTable(table);
      setViewMode('MENU');
    }
  };

  const updateDraft = (tableId, menuItem, delta) => {
    setTableDrafts(prev => {
      const currentDraft = prev[tableId] || [];
      const existing = currentDraft.find(i => i.menuItemId === menuItem.id);

      let newDraft;
      if (existing) {
        newDraft = currentDraft.map(i =>
          i.menuItemId === menuItem.id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        ).filter(i => i.quantity > 0);
      } else if (delta > 0) {
        newDraft = [...currentDraft, { menuItemId: menuItem.id, quantity: 1, name: menuItem.name, price: menuItem.price }];
      } else {
        newDraft = currentDraft;
      }

      return { ...prev, [tableId]: newDraft };
    });
  };

  const handlePlaceOrder = async () => {
    const draft = tableDrafts[activeTable.id];
    if (!draft || draft.length === 0) return;

    try {
      await createOrder({
        tableId: activeTable.id,
        items: draft.map(({ menuItemId, quantity }) => ({ menuItemId, quantity }))
      });
      setToast({ type: 'success', message: `Order sent for Table ${activeTable.tableNumber}` });
      setTableDrafts(prev => {
        const next = { ...prev };
        delete next[activeTable.id];
        return next;
      });
      setActiveTable(null);
      setViewMode('ORDERS');
      await loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to place order.' });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', message: `Order updated to ${newStatus}` });
      await loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update order status.' });
    }
  };

  const handleCheckoutTable = async (tableId) => {
    try {
      await billService.checkout(tableId);
      setToast({ type: 'success', message: 'Table checkout triggered successfully.' });
      await loadData();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || error.response?.data?.message || 'Checkout failed.' });
    }
  };

  const currentDraft = activeTable ? (tableDrafts[activeTable.id] || []) : [];
  const draftTotal = currentDraft.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  return (
    <DashboardShell
      title="Waiter Dashboard"
      subtitle={`Live Floor Status • Updated: ${lastUpdated.toLocaleTimeString()}`}
      navItems={navItems}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 h-[calc(100vh-14rem)] overflow-hidden">

        {/* ── LEFT SIDE: TABLE MAP ────────────────────────────────────────── */}
        <section className="flex flex-col overflow-hidden bg-white rounded-3xl border border-[color:var(--border)] shadow-[var(--shadow-sm)]">
          <div className="p-6 border-b border-[color:var(--border)] bg-[color:var(--surface-alt)] flex items-center justify-between">
            <h3 className="font-heading text-xl text-[color:var(--primary)]">Floor Map</h3>
            <button onClick={loadData} className="btn-ghost p-2 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/30">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 ${activeTable?.id === table.id
                    ? 'border-[color:var(--accent)] bg-[color:var(--surface)] shadow-[var(--shadow-lg)] -translate-y-1'
                    : 'bg-white border-[color:var(--border)] hover:border-[color:var(--accent)] shadow-[var(--shadow-sm)]'
                  }`}
              >
                {tableDrafts[table.id]?.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[color:var(--accent)] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white">
                    {tableDrafts[table.id].reduce((acc, i) => acc + i.quantity, 0)}
                  </div>
                )}
                <div className={`text-3xl font-heading mb-1 ${activeTable?.id === table.id ? 'text-[color:var(--accent)]' : 'text-[color:var(--primary)]'}`}>
                  {table.tableNumber}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
                  {table.status}
                </div>
                <div className={`mt-3 w-2 h-2 rounded-full ${table.status === 'AVAILABLE' ? 'bg-[color:var(--success)]' :
                    table.status === 'OCCUPIED' ? 'bg-[color:var(--warning)]' : 'bg-[color:var(--text-muted)]'
                  }`} />
              </button>
            ))}
          </div>
        </section>

        {/* ── RIGHT SIDE: DYNAMIC PANEL ───────────────────────────────────── */}
        <aside className="bg-white rounded-3xl border border-[color:var(--border)] shadow-[var(--shadow-md)] flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="p-3 border-b border-[color:var(--border)] bg-[color:var(--surface-alt)] flex gap-1">
            <button
              onClick={() => setViewMode('ORDERS')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition ${viewMode === 'ORDERS' ? 'bg-[color:var(--primary)] text-white' : 'text-[color:var(--text-secondary)] hover:bg-white'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('PAST_ORDERS')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition ${viewMode === 'PAST_ORDERS' ? 'bg-[color:var(--primary)] text-white' : 'text-[color:var(--text-secondary)] hover:bg-white'
                }`}
            >
              Past
            </button>
            <button
              onClick={() => setViewMode('MENU')}
              disabled={!activeTable}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition ${viewMode === 'MENU' ? 'bg-[color:var(--primary)] text-white' : 'text-[color:var(--text-secondary)] hover:bg-white disabled:opacity-30'
                }`}
            >
              Menu
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {viewMode === 'ORDERS' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--text-muted)] mb-2">Live Orders</h3>
                {orders.filter(o => !['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).map(order => (
                  <div key={order.id} className="p-4 rounded-xl border border-[color:var(--border)] bg-white hover:shadow-[var(--shadow-md)] transition duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-lg font-heading text-[color:var(--primary)]">Table {order.table.tableNumber}</div>
                        <div className="text-[10px] font-medium text-[color:var(--text-muted)] uppercase tracking-tight">#{order.id} • {order.items.length} Items</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex gap-2 mt-3">
                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                          className="btn-accent w-full justify-center py-2 text-[10px] uppercase tracking-widest"
                        >
                          Ready to Serve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {orders.filter(o => !['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <svg className="w-12 h-12 mx-auto mb-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">No active orders</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'PAST_ORDERS' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--text-muted)] mb-2">Past Orders</h3>
                {orders.filter(o => ['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).map(order => (
                  <div key={order.id} className="p-4 rounded-xl border border-[color:var(--border)] bg-white opacity-80 hover:opacity-100 transition duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-lg font-heading text-[color:var(--primary)]">Table {order.table.tableNumber}</div>
                        <div className="text-[10px] font-medium text-[color:var(--text-muted)] uppercase tracking-tight">#{order.id} • {order.items.length} Items</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
                {orders.filter(o => ['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <svg className="w-12 h-12 mx-auto mb-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">No past orders</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'MENU' && activeTable && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[color:var(--border)] space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['ALL', ...categories.map(c => c.name)].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition whitespace-nowrap ${filterCategory === cat ? 'bg-[color:var(--accent)] text-white' : 'bg-[color:var(--surface-alt)] text-[color:var(--text-secondary)] hover:bg-[color:var(--border)]'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="input py-2"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {menuItems.filter(item => {
                    const matchCat = filterCategory === 'ALL' || item.category?.name === filterCategory;
                    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchCat && matchSearch;
                  }).map(item => {
                    const quantity = currentDraft.find(i => i.menuItemId === item.id)?.quantity || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[color:var(--surface-alt)] transition border border-transparent hover:border-[color:var(--border)]">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[color:var(--text-primary)]">{item.name}</div>
                          <div className="text-[10px] font-bold text-[color:var(--accent)]">${item.price}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-3 bg-[color:var(--primary)] text-white px-2 py-1 rounded-lg shadow-lg animate-in fade-in zoom-in duration-200">
                              <button onClick={() => updateDraft(activeTable.id, item, -1)} className="w-6 h-6 flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold min-w-[12px] text-center">{quantity}</span>
                              <button onClick={() => updateDraft(activeTable.id, item, 1)} className="w-6 h-6 flex items-center justify-center font-bold">+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateDraft(activeTable.id, item, 1)}
                              className="w-9 h-9 rounded-lg bg-[color:var(--surface-alt)] flex items-center justify-center text-[color:var(--text-muted)] hover:bg-[color:var(--primary)] hover:text-white transition shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 bg-[color:var(--surface-alt)] border-t border-[color:var(--border)]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-[color:var(--text-muted)] uppercase tracking-widest">Draft Total</div>
                      <div className="text-2xl font-heading text-[color:var(--primary)]">${draftTotal.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-[color:var(--text-muted)] uppercase tracking-widest">Table</div>
                      <div className="text-lg font-heading text-[color:var(--primary)]">{activeTable.tableNumber}</div>
                    </div>
                  </div>
                  <button
                    disabled={currentDraft.length === 0}
                    onClick={handlePlaceOrder}
                    className="btn-accent w-full justify-center py-3.5 text-xs uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-[color:var(--accent)]/20"
                  >
                    Send to Kitchen
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Walk-in Modal */}
      {walkInTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--primary)]/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[var(--shadow-lg)] border border-[color:var(--border)]">
            <h3 className="text-3xl font-heading text-[color:var(--primary)] mb-1">Table {walkInTable.tableNumber}</h3>
            <p className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-widest mb-6">Initialize Service</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createWalkIn({
                  tableId: walkInTable.id,
                  guestCount: Number(walkInForm.guestCount),
                  customerName: walkInForm.customerName,
                });
                setToast({ type: 'success', message: 'Service Started' });
                setWalkInTable(null);
                await loadData();
              } catch (error) {
                setToast({ type: 'error', message: 'Failed to start service' });
              }
            }} className="space-y-5">
              <div>
                <label className="label">Guest Count</label>
                <input
                  type="number" min="1" max={walkInTable.capacity} className="input text-lg font-bold"
                  value={walkInForm.guestCount} onChange={(e) => setWalkInForm({ ...walkInForm, guestCount: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Customer Name (Optional)</label>
                <input
                  type="text" className="input" placeholder="e.g. John Doe"
                  value={walkInForm.customerName} onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-accent flex-1 justify-center py-3">Start Service</button>
                <button type="button" onClick={() => setWalkInTable(null)} className="btn-ghost px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />
    </DashboardShell>
  );
}

export default WaiterPage;

