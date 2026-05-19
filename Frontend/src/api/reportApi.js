import api from './axiosInstance';

const downloadBlob = (data, filename) => {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadTenantReport = async () => {
  const res = await api.get('/api/report/tenants', { responseType: 'arraybuffer' });
  downloadBlob(res.data, 'tenant-details.xlsx');
};

export const downloadBankTransactionsReport = async (bankId, fromDate, toDate) => {
  const res = await api.get(`/api/report/bank-transactions/${bankId}`, {
    params: { fromDate, toDate },
    responseType: 'arraybuffer',
  });
  downloadBlob(res.data, 'bank-transactions.xlsx');
};

export const downloadTenantBillsReport = async (tenantId) => {
  const res = await api.get(`/api/report/tenant-bills/${tenantId}`, { responseType: 'arraybuffer' });
  downloadBlob(res.data, `tenant-bills-${tenantId}.xlsx`);
};

export const downloadOutstandingReport = async () => {
  const res = await api.get('/api/report/outstanding', { responseType: 'arraybuffer' });
  downloadBlob(res.data, 'outstanding-report.xlsx');  
};

export const downloadReceivablesReport = async () => {
  const res = await api.get('/api/report/receivables', { responseType: 'arraybuffer' });
  downloadBlob(res.data, 'receivables-report.xlsx');
};

export const downloadUserAmountsReport = async () => {
  const res = await api.get('/api/report/user-amounts', { responseType: 'arraybuffer' });
  downloadBlob(res.data, 'user-amounts.xlsx');
};