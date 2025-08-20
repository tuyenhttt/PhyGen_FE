import axiosClient from '@/services/axiosClient';

const API = 'api/topics';

const getStatisticWeekly = async () => {
  return await axiosClient.get('/api/admins/weekly');
};

const getWeeklyRevenues = async () => {
  return await axiosClient.get('/api/admins/revenue/weekly-history');
};

const exportStatisticsPayment = (params = {}) => {
  return axiosClient.get('/api/admins/export', {
    params,
    responseType: 'blob', // để tải file
  });
};

export { getStatisticWeekly, getWeeklyRevenues, exportStatisticsPayment };
