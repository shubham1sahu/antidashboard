import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { getTables } from '../../api/tableApi';
import { createWalkIn } from '../../api/reservationApi';
import { menuApi } from '../../api/menuApi';
import { createOrder, getOrders } from '../../api/orderApi';

function WaiterPage() {
  const logout = useAuthStore((state) => state.logout);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  // Modals state
  const [walkInTable, setWalkInTable] = useState(null);
  const [walkInForm, setWalkInForm] = useState({ guestCount: 1, customerName: '' });
  const [orderTable, setOrderTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]); // Array of { menuItemId, quantity, name }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = async () => {
    try {
      // Don't show full loading spinner for background polls to avoid flickering
      const [tableData, orderData, menuData] = await Promise.all([
        getTables(),
        getOrders(),
        menuApi.getAllMenuItems(true)
      ]);
      setTables(tableData);
      setOrders(orderData);
      setMenuItems(menuData.data);
      setLastUpdated(new Date());
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load live data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWalkIn({
        tableId: walkInTable.id,
        guestCount: Number(walkInForm.guestCount),
        customerName: walkInForm.customerName,
      });
      setToast({ type: 'success', message: `Walk-in confirmed for ${walkInTable.tableNumber}.` });
      setWalkInTable(null);
      await loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Walk-in failed. Ensure table is available.' });
    }
  };

  const handleAddToOrder = (item) => {
    setCurrentOrder((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, quantity: 1, name: item.name }];
    });
  };

  const handlePlaceOrder = async () => {
    if (currentOrder.length === 0) return;
    try {
      await createOrder({
        tableId: orderTable.id,
        items: currentOrder.map(({ menuItemId, quantity }) => ({ menuItemId, quantity }))
      });
      setToast({ type: 'success', message: `Order placed for ${orderTable.tableNumber}.` });
      setOrderTable(null);
      setCurrentOrder([]);
      await loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to place order.' });
    }
  };

  return (
    <main className="min-h-screen bg-[color:var(--surface-alt)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div>
            <h1 className="font-heading text-3xl text-[color:var(--primary)]">Waiter Screen</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-[color:var(--text-secondary)]">Live table service and order status overview.</p>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-medium">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} type="button" className="btn-outline flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button onClick={logout} type="button" className="btn-accent">Logout</button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Table View */}
          <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Table View</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tables.map((item) => (
                <div key={item.id} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[color:var(--text-primary)]">{item.tableNumber}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Capacity: {item.capacity}</p>
                  
                  <div className="mt-4 flex gap-2">
                    {item.status === 'AVAILABLE' && (
                      <button 
                        onClick={() => { setWalkInTable(item); setWalkInForm({ guestCount: item.capacity, customerName: '' }); }}
                        className="btn-accent px-3 py-1 text-xs"
                      >
                        Walk-in
                      </button>
                    )}
                    {item.status === 'OCCUPIED' && (
                      <button 
                        onClick={() => { setOrderTable(item); setCurrentOrder([]); }}
                        className="btn-outline px-3 py-1 text-xs"
                      >
                        Place Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && tables.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-[color:var(--text-secondary)]">No tables have been added yet.</p>
                  <p className="text-xs text-[color:var(--text-secondary)] mt-1">Add tables in the Admin Dashboard to see them here.</p>
                </div>
              )}
            </div>
          </article>

          {/* Order Status */}
          <article className="rounded-xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Active Orders</h2>
            <ul className="mt-4 space-y-3">
              {orders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-[color:var(--border)] p-4">
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">{item.table.tableNumber}</p>
                    <p className="text-xs text-[color:var(--text-secondary)]">
                      {item.items.length} items • ${item.totalAmount}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
              {orders.length === 0 && <p className="text-center text-sm text-[color:var(--text-secondary)] py-4">No active orders.</p>}
            </ul>
          </article>
        </section>
      </div>

      {/* Walk-in Modal */}
      {walkInTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Quick Walk-in: {walkInTable.tableNumber}</h3>
            <form onSubmit={handleWalkInSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Guest Count</span>
                <input 
                  type="number" min="1" max={walkInTable.capacity} className="input mt-1" 
                  value={walkInForm.guestCount} onChange={(e) => setWalkInForm({ ...walkInForm, guestCount: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Customer Name</span>
                <input 
                  type="text" className="input mt-1" 
                  value={walkInForm.customerName} onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                />
              </label>
              <div className="mt-8 flex gap-3">
                <button type="submit" className="btn-accent flex-1">Confirm</button>
                <button type="button" className="btn-outline" onClick={() => setWalkInTable(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {orderTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="border-b p-6">
              <h3 className="text-xl font-bold">Place Order: {orderTable.tableNumber}</h3>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {menuItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleAddToOrder(item)}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-[color:var(--surface-alt)]"
                    >
                      <div className="text-left">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-[color:var(--text-secondary)]">${item.price}</p>
                      </div>
                      <span className="text-xl text-[color:var(--primary)]">+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Selection */}
              <div className="w-80 border-l bg-[color:var(--surface-alt)] p-6">
                <h4 className="font-semibold">Selected Items</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  {currentOrder.map((item) => (
                    <li key={item.menuItemId} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t pt-4">
                  <button 
                    disabled={currentOrder.length === 0}
                    onClick={handlePlaceOrder}
                    className="btn-accent w-full"
                  >
                    Send to Kitchen
                  </button>
                  <button onClick={() => setOrderTable(null)} className="btn-outline mt-2 w-full">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default WaiterPage;
