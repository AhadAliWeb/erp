import api from './axiosInstance';

export const getElectricityConfig = () => api.get('/api/utilityconfig/electricity');
export const updateElectricityConfig = (data) => api.put('/api/utilityconfig/electricity', data);
export const getWaterConfig = () => api.get('/api/utilityconfig/water');
export const updateWaterConfig = (data) => api.put('/api/utilityconfig/water', data);

export const getCompanyDetails = (tenantId) => api.get(`/api/utilityconfig/company-details/${tenantId}`);