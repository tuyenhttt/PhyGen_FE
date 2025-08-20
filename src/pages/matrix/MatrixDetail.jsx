import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import {
  getContentItem
} from '@/services/contentitemService';
import {
  getContentFlow
} from '@/services/contentflowService';
import {
  getExamByCategoryById
} from '@/services/examService';
import AssessmentMatrixTable from '@/components/table/AssessmentMatrixTable';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { MdDownload } from 'react-icons/md';

const MatrixDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState(null);
  const [matrixDescription, setMatrixDescription] = useState('');
  const [sectionDetails, setSectionDetails] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCategories, setExamCategories] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matrixRes, sectionRes] = await Promise.all([
        getMatrixById(id),
        getMatrixSection({ matrixId: id }),
      ]);

      const matrixData = matrixRes?.data?.data || {};
      // const list = Array.isArray(matrixPage.data) ? matrixPage.data : [];
      // const matrixData = list.find(item => item.id === id) || null;
      try {
        const examCategoryRes = await getExamByCategoryById(matrixData?.examCategoryId);
        setExamCategories(examCategoryRes?.data?.data || '');
      } catch (error) {
        console.error('Lỗi khi lấy kỳ thi:', error);
      }

      const sectionList = Array.isArray(sectionRes?.data?.data?.data)
        ? sectionRes.data.data.data
        : [];
      setSections(sectionList);


      let allDetails = [];
      const contentItemMap = {};
      const contentFlowMap = {};

      for (const section of sectionList) {
        const detailRes = await getMatrixSectionDetail(section.id);
        const details = detailRes?.data?.data || [];
        for (const detail of details) {
          let contentItem = null;
          let contentFlow = null;
          if (detail?.contentItemId) {
            try {
              if (contentItemMap[detail.contentItemId]) {
                contentItem = contentItemMap[detail.contentItemId];
              } else {
                const contentItemRes = await getContentItem(detail.contentItemId);
                contentItem = contentItemRes?.data?.data || null;
                if (contentItem && contentItem.id) {
                  contentItemMap[contentItem.id] = contentItem;
                }
              }
              if (contentItem?.contentFlowId) {
                if (contentFlowMap[contentItem.contentFlowId]) {
                  contentFlow = contentFlowMap[contentItem.contentFlowId];
                } else {
                  const contentFlowRes = await getContentFlow(contentItem.contentFlowId);
                  contentFlow = contentFlowRes?.data?.data || null;
                  if (contentFlow && contentFlow.id) {
                    contentFlowMap[contentFlow.id] = contentFlow;
                  }
                }
              }
            } catch (e) {
              contentItem = null;
              contentFlow = null;
            }
          }
          allDetails.push({
            ...detail,
            contentItem,
            contentFlow,
          });
        }
      }

      setMatrix(matrixData);
      setMatrixDescription(matrixData?.description ?? '');
      setSectionDetails(allDetails);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu ma trận:', error);
      setMatrix(null);
      setSectionDetails([]);
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

  const totalQuestions = (() => {
    const totals = {
      multipleChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
      essay: 0,
    };
    sectionDetails.forEach(detail => {
      const { typeName, quantity } = detail;
      if (typeName === 'MultipleChoice') totals.multipleChoice += quantity;
      else if (typeName === 'TrueFalse') totals.trueFalse += quantity;
      else if (typeName === 'ShortAnswer') totals.shortAnswer += quantity;
      else if (typeName === 'Essay') totals.essay += quantity;
    });
    return totals;
  })();

  const sectionTitleToKey = {
    'Nhiều lựa chọn': 'MultipleChoice',
    'Đúng/Sai': 'TrueFalse',
    'Trả lời ngắn': 'ShortAnswer',
    'Tự luận': 'Essay',
  };

  const typePoints = {
    MultipleChoice: 0,
    TrueFalse: 0,
    ShortAnswer: 0,
    Essay: 0,
  };

  sections.forEach(section => {
    const key = sectionTitleToKey[section.title];
    if (key) {
      typePoints[key] = section.score ?? 0;
    }
  });

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
      <div className="text-sm text-[#1B2559] leading-5 mb-10">
        <p>
          <span className="font-bold">- Thời điểm kiểm tra: </span>
          Kiểm tra {examCategories?.name.toLowerCase() || 'Chưa có thông tin về kỳ thi này.'}
        </p>
        <p>
          <span className="font-bold">- Hình thức kiểm tra: </span>
          Kết hợp giữa trắc nghiệm và tự luận
          (<span className="font-semibold">{(typePoints.MultipleChoice + typePoints.TrueFalse + typePoints.ShortAnswer) * 10}% trắc nghiệm, {typePoints.Essay * 10}% tự luận</span>).
        </p>
        <p className="font-bold">- Cấu trúc:</p>
        <ul className="ml-6 list-disc">
          <li>
            + Phần I. Trắc nghiệm 4 lựa chọn, 1 lựa chọn đúng:{" "}
            <span className="font-semibold">{totalQuestions.multipleChoice} Câu = {typePoints.MultipleChoice} điểm</span>
          </li>
          <li>
            + Phần II. Trắc nghiệm đúng sai:{" "}
            <span className="font-semibold">{totalQuestions.trueFalse} Câu = {typePoints.TrueFalse} điểm</span>
          </li>
          <li>
            + Phần III. Trả lời ngắn:{" "}
            <span className="font-semibold">{totalQuestions.shortAnswer} câu = {typePoints.ShortAnswer} điểm</span>
          </li>
          <li>
            + Phần IV. Tự luận:{" "}
            <span className="font-semibold">{totalQuestions.essay} Câu = {typePoints.Essay} điểm</span>
          </li>
        </ul>
      </div>

      {/* Không tìm thấy */}
      {!matrix ? (
        <div className='flex justify-center items-center h-[300px]'>
          <p className='text-lg text-red-500'>Không tìm thấy ma trận.</p>
        </div>
      ) : (
        <AssessmentMatrixTable
          matrixSectionDetails={sectionDetails}
          matrixSections={sections}
          onSaved={fetchData} />
      )}
    </div>
  );
};

export default MatrixDetail;
