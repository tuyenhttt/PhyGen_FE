import axiosClient from '@/services/axiosClient';

const API = 'api/sections';

const createSection = async ({
    examId,
    title,
    description,
    sectionType,
    displayOrder,
}) => {
    return await axiosClient.post(`${API}`, {
        examId,
        title,
        description,
        sectionType,
        displayOrder,
    });
};

export { createSection };