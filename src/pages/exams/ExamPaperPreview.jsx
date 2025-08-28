import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from './QuestionSelectionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from "html2canvas";
import _ from 'lodash';
import {
  postQuestionSection
} from '@/services/questionService';
import {
  exportExamFileWord,
  exportExamFileWordMultiple
} from '@/services/examService'

const handleSectionType = sectionType => {
  switch (sectionType) {
    case 'MultipleChoice':
      return 'Trắc nghiệm nhiều đáp án';
    case 'TrueFalse':
      return 'Trắc nghiệm Đúng/Sai';
    case 'ShortAnswer':
      return 'Câu hỏi trả lời ngắn';
    case 'Essay':
      return 'Tự luận';
    default:
      return sectionType ?? '';
  }
};

const SAFE_ORDER = ['MultipleChoice', 'TrueFalse', 'ShortAnswer', 'Essay'];

const ExamPaperPreview = ({
  examData,
  sectionsCreated,
  matrixSectionDetail,
  selectedQuestionsBySection,
  onBack,
  onQuestionsSelected,
}) => {
  const navigate = useNavigate();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentSectionToSelect, setCurrentSectionToSelect] = useState(null);
  const [currentQuantityLimit, setCurrentQuantityLimit] = useState(0);
  const [ministryOfEducationAndTraining, setMinistryOfEducationAndTraining] =
    useState('');
  const [school, setSchool] = useState('');
  const [durationTime, setDurationTime] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const examContentRef = useRef(null);

  // sort an toàn
  const sortedSections = [...(sectionsCreated ?? [])].sort(
    (a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0)
  );

  if (!examData) {
    return (
      <div className='text-center text-gray-500'>
        Không có dữ liệu đề thi để hiển thị.
      </div>
    );
  }

  // Cảnh báo khi không có ma trận toàn cục
  const isMatrixMissing =
    !Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0;

  useEffect(() => {
    if (isMatrixMissing) {
      toast.warn(
        'Không tìm thấy chi tiết ma trận. Vui lòng cấu hình Ma trận đề trước khi chọn câu hỏi.'
      );
    }
  }, [isMatrixMissing]);

  const groupBySectionType = data => {
    if (!Array.isArray(data)) return {};
    return data.reduce((accumulator, currentItem) => {
      const sectionType = currentItem?.data?.sectionType;
      if (!sectionType) return accumulator;
      (accumulator[sectionType] ??= []).push(currentItem);
      return accumulator;
    }, {});
  };

  const groupedData = groupBySectionType(sortedSections);

  // Đảm bảo mỗi key trong order luôn có mảng (kể cả rỗng)
  const sortedGroupedData = SAFE_ORDER.map(key => ({
    [key]: groupedData[key] ?? [],
  }));

  const computeCanGenerate = () => {
    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0)
      return false;

    for (const sectionType of SAFE_ORDER) {
      const sections = groupedData?.[sectionType] ?? [];
      if (sections.length === 0) continue;

      const groupedByLevel = sections.reduce((acc, s) => {
        const lv = s?.levelName;
        if (!lv) return acc;
        (acc[lv] ??= []).push(s);
        return acc;
      }, {});

      for (const [levelName, levelSections] of Object.entries(groupedByLevel)) {
        const matrixItems = (matrixSectionDetail ?? []).filter(
          d => d?.typeName === sectionType && d?.levelName === levelName
        );
        if (matrixItems.length === 0) return false;

        const quantity = matrixItems.reduce(
          (sum, d) => sum + (d?.quantity ?? 0),
          0
        );
        const selectedCount = (levelSections ?? []).reduce((sum, s) => {
          return sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length;
        }, 0);

        if (quantity > 0 && selectedCount < quantity) return false;
      }
    }
    return true;
  };

  // Kết quả để disable nút
  const canGenerate = useMemo(
    () => computeCanGenerate(),
    [matrixSectionDetail, groupedData, selectedQuestionsBySection]
  );

  const validateMatrixAndSelections = () => {
    const issues = [];

    if (
      !Array.isArray(matrixSectionDetail) ||
      matrixSectionDetail.length === 0
    ) {
      issues.push('Chưa có chi tiết ma trận.');
      return { ok: false, issues };
    }

    for (const sectionType of SAFE_ORDER) {
      const sections = groupedData?.[sectionType] ?? [];
      if (sections.length === 0) continue;

      const groupedByLevel = sections.reduce((acc, s) => {
        const lv = s?.levelName;
        if (!lv) return acc;
        (acc[lv] ??= []).push(s);
        return acc;
      }, {});

      for (const [levelName, levelSections] of Object.entries(groupedByLevel)) {
        const matrixItems = (matrixSectionDetail ?? []).filter(
          d => d?.typeName === sectionType && d?.levelName === levelName
        );

        const hasMatrixForLevel = matrixItems.length > 0;
        const quantity = matrixItems.reduce(
          (sum, d) => sum + (d?.quantity ?? 0),
          0
        );
        const selectedCount = (levelSections ?? []).reduce((sum, s) => {
          return sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length;
        }, 0);

        if (!hasMatrixForLevel) {
          issues.push(
            `Thiếu cấu hình ma trận cho "${handleSectionType(
              sectionType
            )}" - mức "${levelName}".`
          );
        } else if (quantity > 0 && selectedCount < quantity) {
          issues.push(
            `Chưa đủ câu cho "${handleSectionType(
              sectionType
            )}" - mức "${levelName}": đã chọn ${selectedCount}/${quantity}.`
          );
        }
      }
    }

    return { ok: issues.length === 0, issues };
  };

  const groupedSectionsByTitle = sortedSections.reduce((acc, section) => {
    const groupKey = section?.data?.title ?? '';
    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: section?.data?.title ?? '',
        displayOrder: section?.data?.displayOrder ?? 0,
        details: [],
      };
    }
    acc[groupKey].details.push(section);
    return acc;
  }, {});
  const orderedGroupedSectionsByTitle = Object.values(
    groupedSectionsByTitle
  ).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const handleOpenQuestionModal = (
    sectionId,
    sectionType,
    levelName,
    quantityLimit
  ) => {
    if (!sectionId) return;
    setCurrentSectionToSelect({
      id: sectionId,
      type: handleSectionType(sectionType),
      level: levelName,
    });
    setCurrentQuantityLimit(quantityLimit ?? 0);
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setCurrentSectionToSelect(null);
    setCurrentQuantityLimit(0);
  };

  const handleSaveSelectedQuestions = (sectionId, questions) => {
    onQuestionsSelected?.(sectionId, questions);
    handleCloseQuestionModal();
  };

  const handleDownloadExam = async () => {
    const { ok, issues } = validateMatrixAndSelections();
    if (!ok) {
      issues.forEach(msg => toast.warn(msg));
      toast.error(
        'Không thể tạo/tải đề. Vui lòng hoàn thiện ma trận và chọn đủ câu theo ma trận'
      );
      return;
    }

    try {
      setLoading(true)
      for (const sectionId in selectedQuestionsBySection) {
        const questions = selectedQuestionsBySection[sectionId] || [];
        for (const q of questions) {
          await postQuestionSection({
            questionId: q.id,
            sectionId: sectionId,
          });
        }
      }
      if (examData?.randomizeQuestions === true && examData?.versionCount > 1) {
        try {
          const exportFileMultiRes = await exportExamFileWordMultiple(examData?.id, examData?.versionCount, examData?.randomizeQuestions)

          const blob = new Blob([exportFileMultiRes.data], {
            type: exportFileMultiRes.headers['content-type']
              || 'application/zip',
          });

          // lấy tên file từ Content-Disposition (nếu server trả header này)
          let filename = (examData?.title || 'de-thi') + '.zip';
          const dispo = exportFileMultiRes.headers['content-disposition'];
          if (dispo) {
            const mStar = dispo.match(/filename\*\=UTF-8''([^;]+)/i);
            const m = dispo.match(/filename\=\"?([^\";]+)\"?/i);
            filename = mStar ? decodeURIComponent(mStar[1]) : (m ? m[1] : filename);
          }
          // lưu file
          saveAs(blob, filename);
          toast.success('Lưu và tải đề thi thành công!');
          navigate('/exam');
        } catch (err) {

        }
      } else {
        try {
          const exportFileRes = await exportExamFileWord(examData.id);

          const blob = new Blob([exportFileRes.data], {
            type: exportFileRes.headers['content-type']
              || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          // lấy tên file từ Content-Disposition (nếu server trả header này)
          let filename = examData.title || 'de-thi.docx';
          const dispo = exportFileRes.headers['content-disposition'];
          if (dispo) {
            const mStar = dispo.match(/filename\*\=UTF-8''([^;]+)/i);
            const m = dispo.match(/filename\=\"?([^\";]+)\"?/i);
            filename = mStar ? decodeURIComponent(mStar[1]) : (m ? m[1] : filename);
          }

          // lưu file
          saveAs(blob, filename);
          toast.success('Lưu và tải đề thi thành công!');
          navigate('/exam')
        } catch (err) {
          toast.error('Lưu và tải đề thi thất bại!');
        }
      }
    } catch (err) {
      toast.error('Lỗi khi lưu dữ liệu câu hỏi vào đề thi!');
      return;
    } finally {
      setLoading(false)
    }
  };

  return (
    <div
      className='bg-white p-6 rounded-lg shadow-md space-y-6'
      ref={examContentRef}
    >
      {/* Banner cảnh báo ma trận nếu thiếu */}
      {isMatrixMissing && (
        <div className='rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3'>
          <p className='text-sm'>
            <strong>Chưa có chi tiết ma trận.</strong> Một số phần sẽ bị vô hiệu
            hoá thao tác chọn câu hỏi. Vui lòng vào <em>Ma trận</em> để cấu hình
            số lượng câu theo loại & mức độ hoặc chọn 1 ma trận khác.
          </p>
        </div>
      )}

      {/* Khung thông tin đề thi */}
      <div className='border border-gray-300 p-4 rounded-md grid grid-cols-2 gap-4'>
        {/* Khung bên trái */}
        <div className='col-span-1 border-r border-gray-200 pr-4 space-y-2'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              SỞ GIÁO DỤC VÀ ĐÀO TẠO
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 uppercase'
              disabled
              onChange={e => setMinistryOfEducationAndTraining(e.target.value)}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 uppercase'>
              TRƯỜNG THPT
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              disabled
              onChange={e => setSchool(e.target.value)}
            />
          </div>
          <div className='text-center'>
            <p>🙢★🙠</p>
          </div>
        </div>

        {/* Khung bên phải */}
        <div className='col-span-1 pl-4 space-y-2'>
          <p className='text-md font-bold text-gray-800 uppercase'>
            {examData?.title ?? 'Tiêu đề đề thi'}
          </p>
          <p className='text-md text-gray-700'>
            MÔN: VẬT LÍ - KHỐI: {examData?.grade ?? '__'}
          </p>
          <div className='flex'>
            <label className='flex items-center text-md font-medium text-gray-700'>
              Thời gian làm bài:
            </label>
            <input
              type='text'
              className='w-30 ml-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              disabled
              onChange={e => setDurationTime(e.target.value)}
            />
          </div>
          <p className='text-md text-gray-700'>Mã đề:</p>
        </div>
      </div>

      <hr className='my-4' />

      <h3 className='text-xl font-bold text-indigo-700 text-center mb-4'>
        Cấu trúc đề thi
      </h3>

      {sortedGroupedData.map(groupObject => {
        const [sectionType, sections] = Object.entries(groupObject)[0];

        let sectionTitle = '';
        switch (sectionType) {
          case 'MultipleChoice':
            sectionTitle =
              'Phần 1: Trắc nghiệm khách quan - Trắc nghiệm nhiều đáp án';
            break;
          case 'TrueFalse':
            sectionTitle = 'Phần 1: Trắc nghiệm khách quan - Câu hỏi Đúng/Sai';
            break;
          case 'ShortAnswer':
            sectionTitle =
              'Phần 1: Trắc nghiệm khách quan - Câu hỏi trả lời ngắn';
            break;
          case 'Essay':
            sectionTitle = 'Phần 2: Tự luận';
            break;
          default:
            sectionTitle = sectionType;
        }

        const groupedByLevel = (sections ?? []).reduce((acc, currentItem) => {
          const levelName = currentItem?.levelName;
          if (!levelName) return acc;
          (acc[levelName] ??= []).push(currentItem);
          return acc;
        }, {});

        return (
          <div
            key={sectionType}
            className='border border-gray-200 p-4 rounded-md mt-4'
          >
            <h4 className='text-lg font-semibold text-gray-800 mb-3'>
              {sectionTitle}
            </h4>

            {Object.entries(groupedByLevel ?? {}).sort(([a], [b]) => {
              const order = { Easy: 1, Medium: 2, Hard: 3 };
              return order[a] - order[b];
            })
              .map(([levelName, levelSections]) => {
                const levelMapping = {
                  Easy: 'Nhận Biết',
                  Medium: 'Thông Hiểu',
                  Hard: 'Vận Dụng',
                };
                const newLevelName = levelMapping[levelName] || levelName;

                const correspondingMatrixDetail = (
                  matrixSectionDetail ?? []
                ).filter(
                  detail =>
                    detail?.typeName === sectionType &&
                    detail?.levelName === levelName
                );

                const hasMatrixForLevel =
                  (correspondingMatrixDetail?.length ?? 0) > 0;

                const quantity = correspondingMatrixDetail.reduce(
                  (sum, detail) => sum + (detail?.quantity ?? 0),
                  0
                );

                const currentSelectedCount = (levelSections ?? []).reduce(
                  (sum, s) => {
                    return (
                      sum +
                      (selectedQuestionsBySection?.[s?.data?.id] ?? []).length
                    );
                  },
                  0
                );

                const firstSectionId = levelSections?.[0]?.data?.id;

                return (
                  <div
                    key={levelName}
                    className='ml-4 border-l-2 border-indigo-300 pl-4 py-2 my-2 bg-gray-50 rounded-md'
                  >
                    <p className='font-medium text-gray-700 mb-1'>
                      Mức độ: {newLevelName}
                    </p>
                    <p className='text-gray-600 mb-2'>
                      Số lượng câu hỏi: {quantity}
                    </p>

                    {/* Cảnh báo theo từng mức độ khi không có cấu hình */}
                    {!hasMatrixForLevel && (
                      <div className='mb-2 rounded border border-amber-300 bg-amber-50 text-amber-800 px-2 py-1 text-sm'>
                        Chưa có cấu hình ma trận cho{' '}
                        <strong>{handleSectionType(sectionType)}</strong> – mức
                        độ <strong>{newLevelName}</strong>. Vui lòng vào Ma trận
                        để thêm số lượng câu hỏi.
                      </div>
                    )}

                    <div className='flex items-center justify-between p-2 bg-white border border-dashed border-gray-200 rounded-md'>
                      <span className='text-gray-700'>
                        Đã chọn: {currentSelectedCount} / {quantity} câu hỏi.
                      </span>
                      <PrimaryButton
                        className='bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 disabled:opacity-60 disabled:cursor-not-allowed'
                        onClick={() =>
                          handleOpenQuestionModal(
                            firstSectionId,
                            sectionType,
                            levelName,
                            quantity
                          )
                        }
                        disabled={
                          !firstSectionId ||
                          !hasMatrixForLevel ||
                          quantity === 0
                        }
                        title={
                          !firstSectionId
                            ? 'Không có section phù hợp'
                            : !hasMatrixForLevel || quantity === 0
                            ? 'Chưa có cấu hình ma trận cho mức độ này'
                            : ''
                        }
                      >
                        Chọn câu hỏi
                      </PrimaryButton>
                    </div>

                    <ul className='mt-2'>
                      {(levelSections ?? []).map(s =>
                        (selectedQuestionsBySection?.[s?.data?.id] ?? []).map(
                          (q, index, array) => (
                            <li
                              key={q?.id ?? `${s?.data?.id}-${index}`}
                              className={`text-gray-700 text-sm flex items-start ${
                                index < array.length - 1
                                  ? 'border-b border-gray-200 pb-2 mb-2'
                                  : ''
                              }`}
                            >
                              <span className='font-semibold mr-2 flex-shrink-0'>
                                {index + 1}.
                              </span>
                              <span style={{ whiteSpace: 'normal' }}>
                                <MathJaxContext
                                  config={{ tex: { inlineMath: [['$', '$']] } }}
                                >
                                  <MathJax dynamic>{q?.content ?? ''}</MathJax>
                                </MathJaxContext>
                              </span>
                            </li>
                          )
                        )
                      )}
                    </ul>
                  </div>
                );
              }
            )}
          </div>
        );
      })}

      <div className='flex justify-between mt-6'>
        <PrimaryButton
          className='bg-gray-500 hover:bg-gray-600 text-white'
          onClick={onBack}
        >
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className='bg-green-500 hover:bg-green-600 text-white disabled:opacity-60 disabled:cursor-not-allowed'
          onClick={handleDownloadExam}
          disabled={!canGenerate || loading}
          title={
            !canGenerate
              ? 'Chưa thể tạo đề: thiếu ma trận hoặc chưa chọn đủ câu theo ma trận'
              : ''
          }
        >
          {loading ? 'Đang xử lý...' : 'Lưu và tải xuống Word'}
        </PrimaryButton>
      </div>

      {isQuestionModalOpen && currentSectionToSelect && (
        <QuestionSelectionModal
          sectionId={currentSectionToSelect?.id}
          sectionType={currentSectionToSelect?.type}
          levelName={currentSectionToSelect?.level}
          grade={examData?.grade}
          quantityLimit={currentQuantityLimit}
          initialSelectedQuestions={
            selectedQuestionsBySection?.[currentSectionToSelect.id] ?? []
          }
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}
    </div>
  );
};

export default ExamPaperPreview;
