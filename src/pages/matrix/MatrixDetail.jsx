import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import AssessmentMatrixTable from '@/components/table/AssessmentMatrixTable';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { MdDownload } from 'react-icons/md';

const MatrixDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState(null);
  const [matrixDescription, setMatrixDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setMatrixDescription(matrixData?.description ?? '');
      setSections(sectionWithDetails);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ma trận:', error);
      setMatrix(null);
      setSections([]);
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
    if (!raw) return '';
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
        return `<li class="list-none pl-1"><span class="mr-1">-</span>${boldLabel(
          text
        )}</li>`;
      }
      if (l.startsWith('+ ')) {
        const text = l.replace(/^\++\s*/, '');
        return `<li class="list-none pl-6"><span class="mr-1">+</span>${boldLabel(
          text
        )}</li>`;
      }
      return `<div>${escape(l)}</div>`;
    });

    return `<ul class="list-none space-y-1">${items.join('')}</ul>`;
  };

  if (loading) {
    return (
      <div className='min-h-screen px-4 sm:px-8 py-12 max-w-7xl mx-auto mt-10'>
        <div className='mb-6 flex items-center justify-between'>
          <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>
          <div />
        </div>
        <p className='text-center text-gray-700'>Đang tải nội dung...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen px-4 sm:px-8 py-12 max-w-7xl mx-auto mt-10'>
      {/* Top actions */}
      <div className='mb-6 flex items-center justify-between'>
        <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>

        <CommonButton
          className='inline-flex items-center text-[16px] gap-2 rounded-xl py-2 px-4
                     bg-gradient-to-r from-green-600 to-green-600 text-white
                     shadow-sm hover:shadow-md hover:opacity-95 
                     active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-300'
        >
          <MdDownload size={18} />
          Tải xuống ma trận
        </CommonButton>
      </div>

      {/* Tiêu đề */}
      <h1 className='text-2xl md:text-3xl font-bold text-center text-[#1B2559] mb-6'>
        {matrix?.name || ''}
      </h1>

      {/* Mô tả ma trận */}
      {matrixDescription && (
        <p
          className='text-sm text-[#1B2559] leading-4 mb-10'
          dangerouslySetInnerHTML={{
            __html: formatMatrixDescription(matrixDescription),
          }}
        />
      )}

      {/* Không tìm thấy */}
      {!matrix ? (
        <div className='flex justify-center items-center h-[300px]'>
          <p className='text-lg text-red-500'>Không tìm thấy ma trận.</p>
        </div>
      ) : (
        <AssessmentMatrixTable matrixSections={sections} onSaved={fetchData} />
      )}
    </div>
  );
};

export default MatrixDetail;
