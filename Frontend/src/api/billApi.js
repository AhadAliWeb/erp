import api from "./axiosInstance";

export const createElectricityBill = (data) => api.post('/api/electricityutility', data);
export const createWaterBill = (data) => api.post('/api/waterutility', data);
export const createRentBill = (data) => api.post('/api/rentutility', data);

export const billPayment = (data) => api.post('/api/bill/payment', data);

export const getMyPayments = (params) => api.get('/api/bill/mine', { params });
export const getPaymentsHistory = (params) => api.get('/api/bill', { params });