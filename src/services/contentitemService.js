import axiosClient from '@/services/axiosClient';

const API = '/api/contentitems';

const getContentItem = async (contentItemId) => {
    return await axiosClient.get(`${API}/${contentItemId}`);
};

const putContentItem = async ({ contentItemId, name, learningOutcome, orderNo, contentFlowId }) => {
    return await axiosClient.put(`${API}/${contentItemId}`, {
        id: contentItemId,
        name,
        learningOutcome,
        orderNo,
        contentFlowId,
    });
};

const deleteContentItem = async contentItemId => {
    const requestBody = {
        id: contentItemId
    };
    return await axiosClient.delete(`${API}/${contentItemId}`, {
        data: requestBody
    });
};

const getContentFlowFromContentItem = async (contentFlowId) => {
    return await axiosClient.get(`${API}/contentflow/${contentFlowId}`)
}

const postContentItem = async ({
    contentFlowId,
    name,
    learningOutcome,
    orderNo,
}) => {
    return await axiosClient.post(`${API}`, {
        contentFlowId,
        name,
        learningOutcome,
        orderNo,
    });
};

export {
    getContentItem,
    putContentItem,
    deleteContentItem,
    getContentFlowFromContentItem,
    postContentItem
}