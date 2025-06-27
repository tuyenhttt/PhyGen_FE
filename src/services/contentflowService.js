import axiosClient from '@/services/axiosClient';

const API = '/api/contentflows';

const getContentFlow = async (contentFlowId) => {
    return await axiosClient.get(`${API}/${contentFlowId}`);
};

const putContentFlow = async ({ contentFlowId, curriculumId, subjectId, name, description, orderNo }) => {
    return await axiosClient.put(`${API}/${contentFlowId}`, {
        id: contentFlowId,
        curriculumId,
        subjectId,
        name,
        description,
        orderNo
    });
};

const deleteContentFlow = async contentFlowId => {
    const requestBody = {
        id: contentFlowId
    };
    return await axiosClient.delete(`${API}/${contentFlowId}`, {
        data: requestBody
    });
};

const getCurriculumFromContentFlow = async (curriculumId) => {
    return await axiosClient.get(`${API}/curriculum/${curriculumId}`)
}

const postContentFlow = async ({
    curriculumId,
    subjectId,
    name,
    description,
    orderNo
}) => {
    return await axiosClient.post(`${API}`, {
        curriculumId,
        subjectId,
        name,
        description,
        orderNo
    });
};

export {
    getContentFlow,
    putContentFlow,
    deleteContentFlow,
    getCurriculumFromContentFlow,
    postContentFlow
}