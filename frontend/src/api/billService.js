import apiClient from './client';

export const billService = {
  generateBill: async (orderId) => {
    const response = await apiClient.post(`/bills/${orderId}/generate`);
    return response.data;
  },
  
  getBillByOrderId: async (orderId) => {
    const response = await apiClient.get(`/bills/${orderId}`);
    return response.data;
  }
};
