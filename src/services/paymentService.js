import axiosClient from '@/services/axiosClient';

const API = '/api/payments';

const createPayment = async ({ userId, amount, returnUrl, cancelUrl }) => {
  return await axiosClient.post(`${API}/create-payment`, {
    userId,
    amount,
    returnUrl,
    cancelUrl,
  });
};

const getPaymentStatus = async paymentLinkId => {
  return await axiosClient.get(`${API}/status/${paymentLinkId}`);
};

const getWebhook = async paymentLinkId => {
  return await axiosClient.get(`${API}/webhook?PaymentLinkId=${paymentLinkId}`);
};

const searchPayments = async ({
  userId,
  fromDate,
  toDate,
  status,
  pageIndex = 1,
  pageSize = 10,
}) => {
  return await axiosClient.get(`${API}/search`, {
    params: {
      UserId: userId,
      FromDate: fromDate,
      ToDate: toDate,
      Status: status,
      PageIndex: pageIndex,
      PageSize: pageSize,
    },
  });
};

const getStatisticsPayment = async (
  pageIndex = 1,
  pageSize = 10,
  filters = {}
) => {
  const params = { pageIndex, pageSize };

  if (filters.fullName) params.fullName = filters.fullName;
  if (filters.status) params.status = filters.status;
  if (
    filters.minAmount !== undefined &&
    filters.minAmount !== null &&
    filters.minAmount !== ''
  )
    params.minAmount = Number(filters.minAmount);

  return axiosClient.get('api/admins/statistics', { params });
};

const searchTransaction = async (
  pageIndex = 1,
  pageSize = 10,
  filters = {}
) => {
  const params = { pageIndex, pageSize };
  if (filters.userId) params.UserId = filters.userId;
  if (filters.fromDate) params.FromDate = filters.fromDate;
  if (filters.toDate) params.ToDate = filters.toDate;
  if (filters.type) params.Type = filters.type;
  return axiosClient.get('/api/payments/searchTransaction', { params });
};

export {
  createPayment,
  getPaymentStatus,
  getWebhook,
  searchPayments,
  getStatisticsPayment,
  searchTransaction,
};
