import { create } from 'zustand';

const useOrderStore = create((set, get) => ({
  cart: [],
  tableId: null,
  
  setTableId: (id) => set({ tableId: id }),
  
  addToCart: (item) => {
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    });
  },
  
  removeFromCart: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((i) => i.id != itemId),
    }));
  },
  
  updateQuantity: (itemId, delta) => {
    set((state) => ({
      cart: state.cart.map((i) => {
        if (i.id == itemId) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      }),
    }));
  },
  
  clearCart: () => set({ cart: [] }),
  
  getTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));

export default useOrderStore;
