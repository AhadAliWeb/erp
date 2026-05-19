import api from './axiosInstance';

export const loginUser = (credentials) => api.post('/api/auth/login', credentials);
export const getUsers = (params) => api.get('/api/auth/users', { params });
export const registerUser = (data) => api.post('/api/auth/register', data);
export const getProfile = () => api.get('/api/auth/profile');