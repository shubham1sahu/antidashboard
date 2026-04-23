import apiClient from './client';

export async function getProfile() {
  const response = await apiClient.get('/customer/profile');
  return response.data;
}

export async function updateProfile(data) {
  const response = await apiClient.patch('/customer/profile', data);
  return response.data;
}

export async function updatePreferences(data) {
  const response = await apiClient.patch('/customer/preferences', data);
  return response.data;
}

export async function updateNotifications(data) {
  const response = await apiClient.patch('/customer/notifications', data);
  return response.data;
}

export async function changePassword(data) {
  const response = await apiClient.post('/customer/change-password', data);
  return response.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/customer/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteAccount() {
  const response = await apiClient.delete('/customer/account');
  return response.data;
}
