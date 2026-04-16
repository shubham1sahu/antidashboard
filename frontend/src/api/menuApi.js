import apiClient from './client';

export const menuApi = {
  // Public
  getAllMenuItems: (availableOnly = false) => {
    return apiClient.get('/menu', { params: { availableOnly } });
  },

  getMenuItemById: (id) => {
    return apiClient.get(`/menu/${id}`);
  },

  // Admin
  createMenuItem: (menuItem) => {
    return apiClient.post('/menu/admin', menuItem);
  },

  updateMenuItem: (id, menuItem) => {
    return apiClient.put(`/menu/admin/${id}`, menuItem);
  },

  deleteMenuItem: (id) => {
    return apiClient.delete(`/menu/admin/${id}`);
  },

  toggleAvailability: (id) => {
    return apiClient.patch(`/menu/admin/${id}/availability`);
  }
};
