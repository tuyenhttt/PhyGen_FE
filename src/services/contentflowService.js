import axiosClient from '@/services/axiosClient';

const API = '/api/contentflows';

const getContentFlow = async (contentFlowId) => {
    return await axiosClient.get(`${API}/${contentFlowId}`);
};

const putContentFlow = async contentFlowId => {
    return await axiosClient.put(`${API}/${contentFlowId}`, null, {
        params: { contentFlowId: contentFlowId },
    });
};

const deleteContentFlow = async contentFlowId => {
    return await axiosClient.delete(`${API}/${contentFlowId}`, null, {
        params: { contentFlowId: contentFlowId },
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
}) => {
    return await axiosClient.post(`${API}`, {
        curriculumId,
        subjectId,
        name,
        description,
    });
};

export {
    getContentFlow,
    putContentFlow,
    deleteContentFlow,
    getCurriculumFromContentFlow,
    postContentFlow
}