import axiosClient from '@/services/axiosClient';

const API = 'api/sections';

const createSection = async ({
    examId,
    matrixSectionId,
    title,
    description,
    sectionType,
    displayOrder,
}) => {
    return await axiosClient.post(`${API}`, {
        examId,
        title,
        matrixSectionId,
        description,
        sectionType,
        displayOrder,
    });
};

export { createSection };