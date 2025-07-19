import axiosClient from '@/services/axiosClient';

const API = 'api/topics';

const getStatisticWeekly = async () => {
  return await axiosClient.get('/api/admins/weekly');
};

const getWeeklyRevenues = async () => {
  return await axiosClient.get('/api/admins/revenue/weekly-history');
};

export { getStatisticWeekly, getWeeklyRevenues };
