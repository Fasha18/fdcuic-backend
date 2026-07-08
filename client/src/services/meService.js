import api from '../api/axios';

const getProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};

const updateProfile = async (data) => {
  const response = await api.patch('/me', data);
  return response.data;
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.patch('/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const updatePassword = async (data) => {
  const response = await api.patch('/me/mot-de-passe', data);
  return response.data;
};

const updatePreferences = async (notifications_email) => {
  const response = await api.patch('/me/preferences', { notifications_email });
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePassword,
  updatePreferences,
};
