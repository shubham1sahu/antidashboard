import apiClient from './client';

export async function getAnalytics() {
  const response = await apiClient.get('/analytics');
  return response.data;
}
