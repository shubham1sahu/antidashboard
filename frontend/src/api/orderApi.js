import apiClient from './client';

export async function createOrder(payload) {
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

export async function getOrders(date) {
  const response = await apiClient.get('/orders', {
    params: { date }
  });
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

export async function deleteOrders(orderIds) {
  const response = await apiClient.delete('/orders/bulk-delete', { data: orderIds });
  return response.data;
}
