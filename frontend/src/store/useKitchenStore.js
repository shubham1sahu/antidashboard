import { create } from 'zustand';

// ─── Mock data — exact match to reference image ───────────────────────────────
// These seed the store so the UI is always visible even without a live backend.
// Real API data will replace these on a successful fetch.
const now = Date.now();
const MOCK_TICKETS = [
  {
    ticketId: 1001, orderId: 101, tableNumber: '5',
    kitchenStatus: 'RECEIVED',
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: 'No onion',
    specialInstructions: null,
    items: [
      { orderItemId: 1, itemName: 'Paneer Tikka',  quantity: 2, isVegetarian: true,  customizationNotes: null },
      { orderItemId: 2, itemName: 'Dal Makhani',   quantity: 1, isVegetarian: true,  customizationNotes: 'Less spicy' },
    ],
  },
  {
    ticketId: 1002, orderId: 102, tableNumber: '8',
    kitchenStatus: 'RECEIVED',
    createdAt: new Date(now - 1 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: 'Extra raita',
    specialInstructions: null,
    items: [
      { orderItemId: 3, itemName: 'Veg Biryani', quantity: 1, isVegetarian: true, customizationNotes: null },
      { orderItemId: 4, itemName: 'Raita',       quantity: 1, isVegetarian: true, customizationNotes: null },
    ],
  },
  {
    ticketId: 1003, orderId: 103, tableNumber: '3',
    kitchenStatus: 'IN_PROGRESS',
    createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: 'Medium spicy',
    specialInstructions: null,
    items: [
      { orderItemId: 5, itemName: 'Butter Chicken', quantity: 1, isVegetarian: false, customizationNotes: null },
      { orderItemId: 6, itemName: 'Naan',           quantity: 2, isVegetarian: true,  customizationNotes: null },
    ],
  },
  {
    ticketId: 1004, orderId: 104, tableNumber: '7',
    kitchenStatus: 'IN_PROGRESS',
    createdAt: new Date(now - 8 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: 'Less oil',
    specialInstructions: null,
    items: [
      { orderItemId: 7, itemName: 'Veg Pulao',          quantity: 1, isVegetarian: true, customizationNotes: null },
      { orderItemId: 8, itemName: 'Paneer Butter Masala', quantity: 1, isVegetarian: true, customizationNotes: null },
    ],
  },
  {
    ticketId: 1005, orderId: 105, tableNumber: '2',
    kitchenStatus: 'READY',
    createdAt: new Date(now - 18 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: 'No mayonnaise',
    specialInstructions: null,
    items: [
      { orderItemId: 9,  itemName: 'Cheese Burger', quantity: 1, isVegetarian: false, customizationNotes: null },
      { orderItemId: 10, itemName: 'French Fries',  quantity: 1, isVegetarian: true,  customizationNotes: null },
    ],
  },
  {
    ticketId: 1006, orderId: 106, tableNumber: '6',
    kitchenStatus: 'READY',
    createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
    completedAt: null, assignedTo: null,
    notes: null,
    specialInstructions: null,
    items: [
      { orderItemId: 11, itemName: 'Chicken Biryani', quantity: 1, isVegetarian: false, customizationNotes: null },
      { orderItemId: 12, itemName: 'Mirchi Salan',    quantity: 1, isVegetarian: true,  customizationNotes: null },
      { orderItemId: 13, itemName: 'Onion Raita',     quantity: 1, isVegetarian: true,  customizationNotes: null },
    ],
  },
  {
    ticketId: 1007, orderId: 107, tableNumber: '1',
    kitchenStatus: 'SERVED',
    createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
    completedAt: new Date(now - 5 * 60 * 1000).toISOString(),
    assignedTo: null, notes: null, specialInstructions: null,
    items: [
      { orderItemId: 14, itemName: 'Masala Dosa',   quantity: 1, isVegetarian: true, customizationNotes: null },
      { orderItemId: 15, itemName: 'Filter Coffee', quantity: 2, isVegetarian: true, customizationNotes: null },
    ],
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useKitchenStore = create((set, get) => ({
  tickets:   MOCK_TICKETS,   // ← starts with mock data, not empty
  isLoading: false,
  error:     null,

  /**
   * Replace tickets with API data.
   * If the incoming array is empty, keep the current data so mock data
   * is never cleared by an empty (or failed) response.
   */
  setTickets: (incoming) => {
    // If incoming is null/undefined, do nothing (keep mock data).
    // If it's an empty array, set it (clears mock data if backend is empty).
    if (incoming === null || incoming === undefined) return;
    set({ tickets: incoming, error: null });
  },

  /** Upsert: update if exists, prepend if new */
  updateTicket: (updated) =>
    set((state) => {
      const exists = state.tickets.some((t) => t.ticketId === updated.ticketId);
      return {
        tickets: exists
          ? state.tickets.map((t) => t.ticketId === updated.ticketId ? updated : t)
          : [updated, ...state.tickets],
      };
    }),

  addTicket: (ticket) =>
    set((state) => ({ tickets: [ticket, ...state.tickets] })),

  removeTicket: (ticketId) =>
    set((state) => ({ tickets: state.tickets.filter((t) => t.ticketId !== ticketId) })),

  /** Optimistic status change — instant UI update without waiting for API */
  optimisticUpdateStatus: (ticketId, newStatus) =>
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.ticketId === ticketId ? { ...t, kitchenStatus: newStatus } : t
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error }),

  /** Derived selector — tickets for a specific kanban column */
  getTicketsByStatus: (status) =>
    get().tickets.filter((t) => t.kitchenStatus === status),
}));
