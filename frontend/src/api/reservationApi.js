import apiClient from './client';

export async function createReservation(payload) {
  const response = await apiClient.post('/reservations', payload);
  return response.data;
}

export async function getMyReservations() {
  const response = await apiClient.get('/reservations/my');
  return response.data;
}

export async function getReservationsByDate(date) {
  const response = await apiClient.get('/reservations', { params: { date } });
  return response.data;
}

export async function confirmReservation(id) {
  const response = await apiClient.put(`/reservations/${id}/confirm`);
  return response.data;
}

export async function cancelReservation(id) {
  const response = await apiClient.put(`/reservations/${id}/cancel`);
  return response.data;
}
