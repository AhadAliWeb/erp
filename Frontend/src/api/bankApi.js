import api from './axiosInstance';

export const getBanks = () => api.get('/api/bank');
export const getBankById = (id) => api.get(`/api/bank/${id}`);
export const createBank = (data) => api.post('/api/bank', data);
export const deductFromBank = (data) => api.post('/api/bank/deduct', data);
export const deleteBank = (id) => api.delete(`/api/bank/${id}`);
export const getBankTransactions = (id, params) =>
  api.get(`/api/bank/${id}/transactions`, { params });