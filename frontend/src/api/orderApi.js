import apiClient from './client';

export async function createOrder(payload) {
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

export async function getOrders() {
  const response = await apiClient.get('/orders');
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await apiClient.patch(`/orders/${orderId}/status`, null, {
    params: { status }
  });
  return response.data;
}

export async function deleteOrder(orderId) {
  const response = await apiClient.delete(`/orders/${orderId}`);
  return response.data;
}
