import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { getOrders, updateOrderStatus, deleteOrder } from '../../api/orderApi';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import useKitchenSocket from '../../hooks/useKitchenSocket';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED'];

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });
  const [deleting, setDeleting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    loadOrders();
    // WebSocket real-time updates handled below
  }, []);

  const handleUpdate = () => {
    console.log('[Admin] Real-time order update received');
    loadOrders();
  };

  useKitchenSocket(handleUpdate);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch orders.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) return;
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast({ type: 'success', message: `Order #${orderId} updated to ${newStatus}` });
      loadOrders();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to update order status.' });
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);
      await deleteOrder(orderToDelete.id);
      setToast({ type: 'success', message: `Order #${orderToDelete.id} deleted successfully.` });
      setOrderToDelete(null);
      loadOrders();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Deletion failed.' });
    } finally {
      setDeleting(false);
    }
  };


  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch = searchQuery === '' || String(o.id).includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <DashboardShell
      title="Order Management"
      subtitle="Monitor live kitchen flow, update dish status, and manage the complete guest dining lifecycle."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] shadow-sm transition"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="relative group">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)] group-focus-within:text-[color:var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-[color:var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] shadow-sm transition w-48"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
            {(statusFilter !== 'ALL' || searchQuery !== '') ? `${filteredOrders.length} Filtered` : `${orders.length} Total`} Orders
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-alt)]">

                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Order ID</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Table</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Customer</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Items</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Total</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Status</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {loading && orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[color:var(--text-secondary)]">
                    Loading orders...
                  </td>
                </tr>
              )}
              {Array.isArray(filteredOrders) && filteredOrders.map((order) => (
                <tr key={order?.id} className="hover:bg-gray-50 transition-colors">

                  <td className="px-6 py-4 font-medium text-[color:var(--primary)]">#{order?.id}</td>
                  <td className="px-6 py-4">{order?.table?.tableNumber || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {order?.customerName || `${order?.user?.firstName || 'Unknown'} ${order?.user?.lastName || 'User'}`}
                    </div>
                    <div className="text-[10px] text-[color:var(--text-secondary)]">{order?.user?.email || 'No Email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="max-w-xs space-y-1">
                      {order?.items?.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600">
                          <span className="font-bold text-slate-900">{item?.quantity}x</span> {item?.menuItem?.name || 'Unknown Item'}
                        </li>
                      ))}
                      {(!order?.items || order.items.length === 0) && (
                        <li className="text-xs italic text-gray-400">No items</li>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-bold text-[color:var(--primary)]">
                    Rs {Number(order?.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 flex flex-col gap-2">
                    <StatusBadge status={order?.status || 'PENDING'} />
                    <select
                      value={order?.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(order?.id, e.target.value)}
                      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-2 py-1.5 text-[10px] font-semibold text-[color:var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[color:var(--text-secondary)] italic">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Confirm Order Deletion
            </h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">Order #{orderToDelete.id}</span>?
              {' '}This action cannot be undone and will permanently remove these records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default AdminOrdersPage;
