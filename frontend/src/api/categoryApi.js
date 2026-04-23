import apiClient from './client';

export const categoryApi = {
  getAllCategories: () => {
    return apiClient.get('/categories');
  },
  
  createCategory: (category) => {
    return apiClient.post('/categories', category);
  },
  
  deleteCategory: (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};
