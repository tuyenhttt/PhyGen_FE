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
  const [matrixDescription, setMatrixDescription] = useState(null);
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

      setMatrixDescription(matrixData.description);
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

  const handleGoBack = () => {
    navigate(-1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const formatMatrixDescription = raw => {
    if (!raw) return 'Đang tải...';

    const escape = s =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const boldLabel = txt => {
      const m = txt.match(/^([^:]+:)(.*)$/);
      if (!m) return escape(txt);
      let label = `<strong>${escape(m[1])}</strong>`;
      let body = escape(m[2].trim());
      if (/^Cấp độ tư duy:/i.test(txt)) body = `<em>${body}</em>`;
      return `${label} ${body}`;
    };

    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const items = lines.map(l => {
      if (l.startsWith('- ')) {
        const text = l.replace(/^-+\s*/, '');
        return `<li class="list-none pl-1">
                <span class="mr-1">-</span>${boldLabel(text)}
              </li>`;
      }
      if (l.startsWith('+ ')) {
        const text = l.replace(/^\++\s*/, '');
        return `<li class="list-none pl-6">
                <span class="mr-1">+</span>${boldLabel(text)}
              </li>`;
      }
      return `<div>${escape(l)}</div>`;
    });

    return `<ul class="list-none space-y-1">${items.join('')}</ul>`;
  };

  return (
    <div className='min-h-screen px-4 sm:px-8 py-12 max-w-7xl mx-auto mt-10'>
      <div className='flex justify-between items-center mb-6 relative'>
        <button
          onClick={handleGoBack}
          className='flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition absolute left-0 top-1/2 -translate-y-1/2'
        >
          <IoArrowBack size={26} />
        </button>
        <h1 className='text-2xl md:text-3xl font-bold text-center text-[#1B2559] w-full'>
          {matrix?.name ?? 'Đang tải...'}
        </h1>
      </div>

      <p
        className='text-sm text-[#1B2559] leading-4 mb-10'
        dangerouslySetInnerHTML={{
          __html: formatMatrixDescription(matrixDescription),
        }}
      />

      {loading && (
        <div className='flex justify-center items-center h-[400px]'>
          <p className='text-lg text-gray-700 animate-pulse'>
            Đang tải dữ liệu chi tiết...
          </p>
        </div>
      )}

      {!loading && !matrix && (
        <div className='flex justify-center items-center h-[400px]'>
          <p className='text-lg text-red-500'>Không tìm thấy ma trận.</p>
        </div>
      )}

      {!loading && matrix && (
        <AssessmentMatrixTable matrixSections={sections} onSaved={fetchData} />
      )}
    </div>
  );
};

export default MatrixDetail;
