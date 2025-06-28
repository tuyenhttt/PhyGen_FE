import axiosClient from '@/services/axiosClient';

const API = 'api/topics';

const getStatisticWeekly = async () => {
  return await axiosClient.get('/api/admins/weekly');
};

export { getStatisticWeekly };
