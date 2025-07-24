import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import AssessmentMatrixTable from '@/components/table/AssessmentMatrixTable';
import { IoArrowBack } from 'react-icons/io5';

const ViewMatrix = () => {
  const { id } = useParams();
  const [matrix, setMatrix] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [matrixRes, sectionRes] = await Promise.all([
        getMatrixById(id),
        getMatrixSection({ matrixId: id }),
      ]);

      const matrixPage = matrixRes?.data?.data || {};

      const list = Array.isArray(matrixPage.data) ? matrixPage.data : [];

      const matrixData = list.find(item => item.id === id) || null;
      const sectionList = Array.isArray(sectionRes?.data?.data?.data)
        ? sectionRes.data.data.data
        : [];
      const sectionWithDetails = await Promise.all(
        sectionList.map(async section => {
          const detailRes = await getMatrixSectionDetail(section.id);
          const details = detailRes?.data?.data || [];
          return { ...section, details };
        })
      );

      setMatrix(matrixData);
      setSections(sectionWithDetails);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ma trận:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading)
    return <p className='text-center mt-10'>Đang tải dữ liệu chi tiết...</p>;

  if (!matrix)
    return (
      <p className='text-center mt-10 text-red-500'>Không tìm thấy ma trận.</p>
    );

  return (
    <div className='min-h-screen px-4 sm:px-8 py-4 max-w-5xl mx-auto'>
      <div className='flex items-center justify-between mb-6 p-4'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center text-gray-60 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer'
        >
          <IoArrowBack size={26} className='mr-2' />
        </button>

        <h1 className='flex-1 text-center text-2xl font-bold text-gray-800'>
          Chi tiết Ma trận: <span>{matrix.name}</span>
        </h1>
      </div>

      <AssessmentMatrixTable matrixSections={sections} onSaved={fetchData} />
    </div>
  );
};

export default ViewMatrix;
