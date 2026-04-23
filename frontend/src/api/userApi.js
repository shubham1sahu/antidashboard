import apiClient from './client';

export async function getUsers() {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function updateUserRole(id, role) {
  const response = await apiClient.patch(`/users/${id}/role`, { role });
  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}

export async function createStaffAccount(data) {
  const response = await apiClient.post('/users/create-staff', data);
  return response.data;
}

export async function checkEmailExists(email) {
  const response = await apiClient.get('/users/exists', { params: { email } });
  return response.data;
}
