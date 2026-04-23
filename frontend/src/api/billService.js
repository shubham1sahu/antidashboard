import apiClient from './client';

export const billService = {
  checkout: async (tableId) => {
    const response = await apiClient.post(`/checkout/${tableId}`);
    return response.data;
  },
  
  getBillByTableId: async (tableId) => {
    const response = await apiClient.get(`/bills/table/${tableId}`);
    return response.data;
  },

  getBillById: async (billId) => {
    const response = await apiClient.get(`/bills/${billId}`);
    return response.data;
  }
};
