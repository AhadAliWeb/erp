import api from './axiosInstance';

export const getAdminDashboard = () => api.get('/api/dashboard/admin');
export const getManagerDashboard = () => api.get('/api/dashboard/manager');
export const getTenantDashboard = () => api.get('/api/dashboard/tenant');