import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import useMenuStore from '../../store/menuStore';
import useCategoryStore from '../../store/categoryStore';
import useOrderStore from '../../store/orderStore';
import { getMyReservations } from '../../api/reservationApi';
import { createOrder } from '../../api/orderApi';
import ToastMessage from '../../components/ui/ToastMessage';

const navItems = [
  { to: '/customer', label: 'Reserve', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'My Reservations' },
  { to: '/customer/profile', label: 'Profile' },
];

function CustomerMenuPage() {
  const { menuItems, fetchMenuItems, isLoading } = useMenuStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, tableId, setTableId } = useOrderStore();
  
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [imgErrors, setImgErrors] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: 'error', message: '' });

  useEffect(() => {
    fetchMenuItems(true);
    fetchCategories();
    loadReservations();
  }, [fetchMenuItems, fetchCategories]);

  const loadReservations = async () => {
    try {
      const data = await getMyReservations();
      // Filter for confirmed reservations today (using local date)
      const localDate = new Date();
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const active = data.filter(r => 
        r.status === 'CONFIRMED' && r.reservationDate === today
      );
      setReservations(active);
      if (active.length > 0 && !tableId) {
        setTableId(active[0].tableId);
      }
    } catch (error) {
      console.error('Failed to load reservations', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!tableId) {
      setToast({ type: 'error', message: 'Please select an active reservation table first.' });
      return;
    }
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        tableId: tableId,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      });
      setToast({ type: 'success', message: 'Order placed successfully! Sending to kitchen...' });
      clearCart();
      setShowCart(false);
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to place order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableItems = menuItems.filter(item => item.available);
  
  const filteredItems = activeCategory === 'ALL' 
    ? availableItems 
    : availableItems.filter(item => item.category?.name === activeCategory);

  return (
    <DashboardShell title="Digital Menu" subtitle="Browse our finest selections and place your order directly." navItems={navItems}>
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      {/* Cart Toggle Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setShowCart(true)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold shadow-md">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>
      
      {/* Category Navigation */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform outline-none ${
            activeCategory === 'ALL' 
              ? 'bg-[color:var(--accent)] text-white shadow-lg scale-105' 
              : 'bg-white text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)] border border-[color:var(--border)] hover:shadow-md'
          }`}
        >
          Everything
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform outline-none ${
              activeCategory === cat.name 
                ? 'bg-[color:var(--accent)] text-white shadow-lg scale-105' 
                : 'bg-white text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)] border border-[color:var(--border)] hover:shadow-md'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-t-4 border-[color:var(--accent)] animate-spin"></div>
            <p className="mt-4 text-[color:var(--accent)] font-semibold">Loading delicacies...</p>
          </div>
        </div>
      ) : (
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <article 
              key={item.id} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-100">
                {item.imageUrl && !imgErrors[item.id] ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-6 text-center" style={{background: 'var(--primary-light)'}}>
                    <span className="text-4xl text-white drop-shadow-sm font-bold opacity-30 whitespace-nowrap overflow-hidden">
                      {item.category?.name || 'Dish'}
                    </span>
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm max-w-[120px] truncate">
                    {item.category?.name || 'Dish'}
                  </span>
                </div>
                {item.special && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-orange-500/30">
                    Chef's Special
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[color:var(--text-primary)] group-hover:text-[color:var(--accent)] transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)] line-clamp-3">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-black text-[color:var(--primary)]">
                    ${item.price.toFixed(2)}
                  </p>
                  
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-md transition-transform hover:scale-110 active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back soon!</p>
            </div>
          )}
        </section>
      )}

      {/* Cart Sidebar/Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform translate-x-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-2xl font-bold">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="p-2 text-gray-500 hover:text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                    <p className="mt-2 text-sm text-gray-500">Add some delicious items from the menu.</p>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {cart.map((item) => (
                      <li key={item.id} className="flex items-center gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[color:var(--primary-light)] text-white font-bold opacity-30">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-sm text-[color:var(--text-secondary)]">${item.price.toFixed(2)}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">-</button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t p-6 bg-gray-50">
                <div className="mb-4">
                  <label className="label">Select Active Table (Reservation)</label>
                  <select 
                    className="input mt-1" 
                    value={tableId || ''} 
                    onChange={(e) => setTableId(e.target.value)}
                  >
                    <option value="" disabled>Choose your table...</option>
                    {reservations.map(r => (
                      <option key={r.id} value={r.tableId}>Table {r.tableNumber} - {r.startTime}</option>
                    ))}
                  </select>
                  {reservations.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">No active confirmed reservations found. You must have a confirmed reservation to order.</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span className="text-[color:var(--primary)]">${getTotal().toFixed(2)}</span>
                </div>
                
                <button 
                  disabled={cart.length === 0 || !tableId || isSubmitting}
                  onClick={handlePlaceOrder}
                  className="btn-accent w-full py-4 text-lg justify-center shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default CustomerMenuPage;
