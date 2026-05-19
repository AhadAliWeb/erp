import api from "./axiosInstance";

export const getElectricityBills = (params) => api.get(`/api/electricityutility/`, { params });
export const getWaterBills = (params) => api.get(`/api/waterutility/`, { params });
export const getRentBills = (params) => api.get(`/api/rentutility/`, { params });
export const getSingleRentBill = (id) => api.get(`/api/rentutility/detail/${id}`);
export const getSingleElectricityBill = (id) => api.get(`/api/electricityutility/detail/${id}`);
export const getSingleWaterBill = (id) => api.get(`/api/waterutility/detail/${id}`);
export const currentElectricityBill = (tenantId) => api.get(`/api/electricityutility/current/${tenantId}`);
export const currentWaterBill = (tenantId) => api.get(`/api/waterutility/current/${tenantId}`);
export const currentRentBill = (tenantId) => api.get(`/api/rentutility/current/${tenantId}`);

export const getElectricityBillsMine = (params) => api.get(`/api/electricityutility/mine`, { params });
export const getWaterBillsMine = (params) => api.get(`/api/waterutility/mine`, { params });
export const getRentBillsMine = (params) => api.get(`/api/rentutility/mine`, { params });