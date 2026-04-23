import apiClient from './client';

export const paymentService = {
  createOrder: async (billId) => {
    const response = await apiClient.post('/payments/create-order', { billId });
    return response.data;
  },
  
  verifyPayment: async (paymentId, paymentIntentId) => {
    const response = await apiClient.post('/payments/verify', {
      paymentId,
      paymentIntentId
    });
    return response.data;
  }
};
