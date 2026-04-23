import { create } from 'zustand';
import { menuApi } from '../api/menuApi';

const useMenuStore = create((set, get) => ({
  menuItems: [],
  isLoading: false,
  error: null,

  fetchMenuItems: async (availableOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await menuApi.getAllMenuItems(availableOnly);
      set({ menuItems: response.data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch menu items', isLoading: false });
    }
  },

  addMenuItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await menuApi.createMenuItem(itemData);
      set((state) => ({ 
        menuItems: [...state.menuItems, response.data], 
        isLoading: false 
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to add menu item', isLoading: false });
    }
  },

  updateMenuItem: async (id, itemData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await menuApi.updateMenuItem(id, itemData);
      set((state) => ({
        menuItems: state.menuItems.map((item) => (item.id === id ? response.data : item)),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to update menu item', isLoading: false });
    }
  },

  deleteMenuItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await menuApi.deleteMenuItem(id);
      set((state) => ({
        menuItems: state.menuItems.filter((item) => item.id !== id),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to delete menu item', isLoading: false });
    }
  },

  toggleAvailability: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await menuApi.toggleAvailability(id);
      set((state) => ({
        menuItems: state.menuItems.map((item) => (item.id === id ? response.data : item)),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to toggle availability', isLoading: false });
    }
  }
}));

export default useMenuStore;
