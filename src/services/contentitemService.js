import axiosClient from '@/services/axiosClient';

const API = '/api/contentitems';

const getContentItem = async (contentItemId) => {
    return await axiosClient.get(`${API}/${contentItemId}`);
};

const putContentItem = async contentItemId => {
    return await axiosClient.put(`${API}/${contentItemId}`, null, {
        params: { contentItemId: contentItemId },
    });
};

const deleteContentItem = async contentItemId => {
    return await axiosClient.delete(`${API}/${contentItemId}`, null, {
        params: { contentItemId: contentItemId },
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