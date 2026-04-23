import { create } from 'zustand';
import { categoryApi } from '../api/categoryApi';

const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.getAllCategories();
      set({ categories: response.data, isLoading: false });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  addCategory: async (name, description = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.createCategory({ name, description });
      set((state) => ({ 
        categories: [...state.categories, response.data], 
        isLoading: false 
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to add category', isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryApi.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to delete category', isLoading: false });
    }
  }
}));

export default useCategoryStore;
