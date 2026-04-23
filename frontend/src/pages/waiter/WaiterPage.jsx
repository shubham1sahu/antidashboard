import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { getTables, updateStatus } from '../../api/tableApi';
import { createWalkIn } from '../../api/reservationApi';
import { menuApi } from '../../api/menuApi';
import { createOrder, getOrders, updateOrderStatus } from '../../api/orderApi';
import { categoryApi } from '../../api/categoryApi';
import useKitchenSocket from '../../hooks/useKitchenSocket';

function WaiterPage() {
  const logout = useAuthStore((state) => state.logout);
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
  const [viewMode, setViewMode] = useState('ORDERS'); // 'ORDERS' or 'MENU'

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
      setTables(tableData);
      setOrders(orderData);
      setMenuItems(menuData.data);
      setCategories(categoryData.data);
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
      setToast({ type: 'success', message: `Order sent for ${activeTable.tableNumber}` });
      setTableDrafts(prev => {
        const next = { ...prev };
        delete next[activeTable.id];
        return next;
      });
      setActiveTable(null);
      setViewMode('ORDERS');
      await loadData();
    } catch (error) {
      // Notification removed per user request
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', message: `Order updated to ${newStatus}` });
      await loadData();
    } catch (error) {
      // Notification removed per user request
    }
  };

  const currentDraft = activeTable ? (tableDrafts[activeTable.id] || []) : [];
  const draftTotal = currentDraft.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* ── LEFT SIDE: TABLE MAP ────────────────────────────────────────── */}
        <section className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
          <header className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Table Map</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Floor Status • {lastUpdated.toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
              <button onClick={logout} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition">LOGOUT</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/50">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 transform active:scale-95 ${
                  activeTable?.id === table.id 
                    ? 'bg-slate-900 border-slate-900 shadow-2xl -translate-y-1' 
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                {tableDrafts[table.id]?.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white">
                    {tableDrafts[table.id].reduce((acc, i) => acc + i.quantity, 0)}
                  </div>
                )}
                <div className={`text-3xl font-black mb-1 ${activeTable?.id === table.id ? 'text-white' : 'text-slate-900'}`}>
                  {table.tableNumber}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${activeTable?.id === table.id ? 'text-slate-400' : 'text-slate-400'}`}>
                  {table.status}
                </div>
                <div className={`mt-3 w-2 h-2 rounded-full ${
                  table.status === 'AVAILABLE' ? 'bg-emerald-400' : 
                  table.status === 'OCCUPIED' ? 'bg-amber-400' : 'bg-slate-300'
                }`} />
              </button>
            ))}
          </div>
        </section>

        {/* ── RIGHT SIDE: DYNAMIC PANEL ───────────────────────────────────── */}
        <aside className="w-[450px] bg-white flex flex-col shadow-2xl z-20">
          
          {/* Tabs / Header */}
          <div className="p-4 border-b border-slate-100 flex gap-2">
            <button 
              onClick={() => setViewMode('ORDERS')}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition ${
                viewMode === 'ORDERS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => setViewMode('PAST_ORDERS')}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition ${
                viewMode === 'PAST_ORDERS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Past
            </button>
            <button 
              onClick={() => setViewMode('MENU')}
              disabled={!activeTable}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition ${
                viewMode === 'MENU' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50'
              }`}
            >
              Menu
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {viewMode === 'ORDERS' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Live Orders</h3>
                {orders.filter(o => !['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).map(order => (
                  <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-lg font-black">Table {order.table.tableNumber}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{order.id} • {order.items.length} Items</div>
                        
                        {(order.assignedTo || order.estimatedMinutes) && (
                          <div className="mt-2 flex gap-2">
                            {order.assignedTo && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-md border border-slate-100">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                {order.assignedTo}
                              </span>
                            )}
                            {order.estimatedMinutes && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-[9px] font-bold text-amber-600 rounded-md border border-amber-100">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {order.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={order.status} />
                    <div className="flex gap-2 mt-3">
                      {order.status === 'READY' && (
                        <button onClick={() => handleUpdateStatus(order.id, 'SERVED')} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition">Ready to Serve</button>
                      )}
                    </div>
                  </div>
                ))}
                {orders.filter(o => !['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <p className="text-xs font-black uppercase tracking-widest">No active orders</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'PAST_ORDERS' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Past Orders</h3>
                {orders.filter(o => ['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).map(order => (
                  <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition opacity-80">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-lg font-black">Table {order.table.tableNumber}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{order.id} • {order.items.length} Items</div>
                        
                        {(order.assignedTo || order.estimatedMinutes) && (
                          <div className="mt-2 flex gap-2">
                            {order.assignedTo && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-md border border-slate-100">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                {order.assignedTo}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={order.status} />
                  </div>
                ))}
                {orders.filter(o => ['SERVED', 'PAID', 'CANCELLED'].includes(o.status)).length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-xs font-black uppercase tracking-widest">No past orders</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'MENU' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Menu Filters */}
                <div className="p-4 border-b border-slate-100 space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['ALL', ...categories.map(c => c.name)].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition whitespace-nowrap ${
                          filterCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" placeholder="Search menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none text-xs font-bold focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Menu Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {menuItems.filter(item => {
                    const matchCat = filterCategory === 'ALL' || item.category?.name === filterCategory;
                    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchCat && matchSearch;
                  }).map(item => {
                    const quantity = currentDraft.find(i => i.menuItemId === item.id)?.quantity || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                        <div className="flex-1">
                          <div className="text-xs font-black text-slate-900">{item.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">${item.price}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-3 bg-slate-900 text-white px-2 py-1 rounded-xl shadow-lg animate-in fade-in zoom-in duration-200">
                              <button onClick={() => updateDraft(activeTable.id, item, -1)} className="w-6 h-6 flex items-center justify-center font-black">-</button>
                              <span className="text-xs font-black min-w-[12px] text-center">{quantity}</span>
                              <button onClick={() => updateDraft(activeTable.id, item, 1)} className="w-6 h-6 flex items-center justify-center font-black">+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => updateDraft(activeTable.id, item, 1)}
                              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Footer */}
                <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Draft</div>
                      <div className="text-2xl font-black text-slate-900">${draftTotal.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table</div>
                      <div className="text-lg font-black text-slate-900">{activeTable.tableNumber}</div>
                    </div>
                  </div>
                  <button 
                    disabled={currentDraft.length === 0}
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition shadow-2xl shadow-slate-200 disabled:opacity-30 disabled:shadow-none"
                  >
                    Send to Kitchen
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Walk-in Modal (Legacy but kept for flow) */}
      {walkInTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-[40px] bg-white p-10 shadow-2xl border border-white/20">
            <h3 className="text-3xl font-black tracking-tight mb-2">Table {walkInTable.tableNumber}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Start New Service</p>
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
                setToast({ type: 'error', message: 'Failed' });
              }
            }} className="space-y-6">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Guest Count</span>
                <input 
                  type="number" min="1" max={walkInTable.capacity} className="w-full mt-2 bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-lg focus:ring-2 focus:ring-slate-900" 
                  value={walkInForm.guestCount} onChange={(e) => setWalkInForm({ ...walkInForm, guestCount: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Customer (Optional)</span>
                <input 
                  type="text" className="w-full mt-2 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-slate-900" 
                  value={walkInForm.customerName} onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                />
              </label>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl shadow-slate-200">Start</button>
                <button type="button" className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition" onClick={() => setWalkInTable(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />
    </main>
  );
}

export default WaiterPage;
