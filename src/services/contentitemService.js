import axiosClient from '@/services/axiosClient';

const API = '/api/contentitems';

const getContentItem = async (contentItemId) => {
    return await axiosClient.get(`${API}/${contentItemId}`);
};

const getAllContentItem = async () => {
    return await axiosClient.get(`${API}`);
};

const putContentItem = async ({ contentItemId, name, learningOutcome, orderNo, contentFlowId }) => {
    return await axiosClient.put(`${API}`, {
        id: contentItemId,
        name,
        learningOutcome,
        orderNo,
        contentFlowId,
    });
};

const deleteContentItem = async contentItemId => {
    return await axiosClient.delete(`${API}`, {
         data: { id: contentItemId },
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
    getAllContentItem,
    putContentItem,
    deleteContentItem,
    getContentFlowFromContentItem,
    postContentItem
}