import axiosClient from '@/services/axiosClient';

const API = '/api/subjects';

const getSubject = async () => {
    return await axiosClient.get(`${API}`);
};

export {
    getSubject
}