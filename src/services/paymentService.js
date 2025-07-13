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
      userId,
      FromDate: fromDate,
      ToDate: toDate,
      Status: status,
      PageIndex: pageIndex,
      PageSize: pageSize,
    },
  });
};

const getStatisticsPayment = async () => {
  return await axiosClient.get('api/admins/statistics');
};

export {
  createPayment,
  getPaymentStatus,
  getWebhook,
  searchPayments,
  getStatisticsPayment,
};
