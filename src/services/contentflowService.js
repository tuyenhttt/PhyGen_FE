import axiosClient from '@/services/axiosClient';

const API = '/api/contentflows';

const getContentFlow = async (contentFlowId) => {
    return await axiosClient.get(`${API}/${contentFlowId}`);
};

const putContentFlow = async ({ contentFlowId, curriculumId, subjectId, name, description, orderNo, grade }) => {
    return await axiosClient.put(`${API}`, {
        id: contentFlowId,
        curriculumId,
        subjectId,
        name,
        description,
        orderNo,
        grade
    });
};

const deleteContentFlow = async contentFlowId => {
    return await axiosClient.delete(`${API}`, {
        data: { id: contentFlowId },
    });
};

const getCurriculumFromContentFlow = async (curriculumId, subjectId) => {
    return await axiosClient.get(`${API}`, {
       params: { curriculumId, subjectId },
    })
}

const postContentFlow = async ({
    curriculumId,
    subjectId,
    name,
    description,
    orderNo,
    grade
}) => {
    return await axiosClient.post(`${API}`, {
        curriculumId,
        subjectId,
        name,
        description,
        orderNo,
        grade
    });
};

export {
    getContentFlow,
    putContentFlow,
    deleteContentFlow,
    getCurriculumFromContentFlow,
    postContentFlow
}