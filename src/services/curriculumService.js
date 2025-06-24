import axiosClient from '@/services/axiosClient';

const API = '/api/curriculums';

const getCurriculum = async () => {
    return await axiosClient.get(`${API}`);
};

const postCurriculum = async ({
    name,
    grade,
}) => {
    return await axiosClient.post(`${API}`, {
        name,
        grade,
    });
};

const getCurriculumById = async (curriculumId) => {
    return await axiosClient.get(`${API}/${curriculumId}`)
}

const putCurriculum = async curriculumId => {
    return await axiosClient.put(`${API}/${curriculumId}`, null, {
        params: { curriculumId: curriculumId },
    });
};

const deleteCurriculum = async curriculumId => {
    return await axiosClient.delete(`${API}/${curriculumId}`, null, {
        params: { curriculumId: curriculumId },
    });
};



export {
    getCurriculum,
    postCurriculum,
    getCurriculumById,
    putCurriculum,
    deleteCurriculum
}