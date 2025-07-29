import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import AssessmentMatrixTable from '@/components/table/AssessmentMatrixTable';
import { IoArrowBack } from 'react-icons/io5';

const MatrixDetail = () => {
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
    <div className='min-h-screen px-4 sm:px-8 py-12 max-w-7xl mx-auto mt-10'>
      <h1 className='text-2xl font-bold text-center text-[#1B2559] mb-6'>
        Chi tiết Ma trận: {matrix.name}
      </h1>

      <div className='flex justify-start mb-4'>
        <div onClick={() => navigate(-1)} className='text-sm px-4 py-2'>
          <IoArrowBack size={24} className='text-gray-700' />
        </div>
      </div>
      <AssessmentMatrixTable matrixSections={sections} onSaved={fetchData} />
    </div>
  );
};

export default MatrixDetail;
