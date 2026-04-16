import apiClient from './client';

export async function getTables() {
  const response = await apiClient.get('/tables');
  return response.data;
}

export async function getAvailableTables({ date, time, endTime, capacity }) {
  const response = await apiClient.get('/tables/available', {
    params: {
      date,
      time,
      endTime,
      capacity,
    },
  });
  return response.data;
}

export async function createTable(payload) {
  const response = await apiClient.post('/tables', payload);
  return response.data;
}

export async function updateTable(id, payload) {
  const response = await apiClient.put(`/tables/${id}`, payload);
  return response.data;
}

export async function deleteTable(id) {
  await apiClient.delete(`/tables/${id}`);
}

export async function updateStatus(id, status) {
  const response = await apiClient.put(`/tables/${id}/status`, { status });
  return response.data;
}
