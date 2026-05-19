import api from './axiosInstance';

export const getActiveTenants = () => api.get('/api/tenant');
export const getInactiveTenants = () => api.get('/api/tenant/inactive');
export const getTenantById = (id) => api.get(`/api/tenant/${id}`);
export const createTenant = (data) => api.post('/api/tenant', data);
export const updateTenant = (id, data) => api.put(`/api/tenant/${id}`, data);
export const deactivateTenant = (id) => api.put(`/api/tenant/${id}/deactivate`);
export const reAgreementTenant = (id, data) => api.post(`/api/tenant/${id}/reagreement`, data);
export const reAgreementHistory = (id) => api.get(`/api/tenant/${id}/reagreement`);