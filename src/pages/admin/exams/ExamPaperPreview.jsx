import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from '@/pages/user/exams/CreateExamPaper/QuestionSelectionModal';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { postQuestionSection } from '@/services/questionService';
import { exportExamFileWord } from '@/services/examService';

const handleSectionType = (sectionType) => {
  switch (sectionType) {
    case 'MultipleChoice': return 'Trắc nghiệm nhiều đáp án';
    case 'TrueFalse': return 'Trắc nghiệm Đúng/Sai';
    case 'ShortAnswer': return 'Câu hỏi trả lời ngắn';
    case 'Essay': return 'Tự luận';
    default: return sectionType ?? '';
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
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentSectionToSelect, setCurrentSectionToSelect] = useState(null);
  const [currentQuantityLimit, setCurrentQuantityLimit] = useState(0);

  const [ministry, setMinistry] = useState('');
  const [school, setSchool] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const examContentRef = useRef(null);

  if (!examData) {
    return <div className="text-center text-gray-500">Không có dữ liệu đề thi.</div>;
  }

  const sortedSections = [...(sectionsCreated ?? [])].sort(
    (a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0)
  );

  const groupedData = (arr => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, cur) => {
      const type = cur?.data?.sectionType;
      if (!type) return acc;
      (acc[type] ??= []).push(cur);
      return acc;
    }, {});
  })(sortedSections);

  const sortedGroupedData = SAFE_ORDER.map(k => ({ [k]: groupedData[k] ?? [] }));

  const computeCanGenerate = () => {
    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0) return false;

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

        const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);
        const selectedCount = (levelSections ?? []).reduce((sum, s) =>
          sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0);

        if (quantity > 0 && selectedCount < quantity) return false;
      }
    }
    return true;
  };

  const canGenerate = useMemo(() => computeCanGenerate(), [
    matrixSectionDetail, groupedData, selectedQuestionsBySection
  ]);

  const handleOpenQuestionModal = (sectionId, sectionType, levelName, quantityLimit) => {
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
  const handleSaveSelectedQuestions = (sectionId, qs) => {
    onQuestionsSelected?.(sectionId, qs);
    handleCloseQuestionModal();
  };

  const handleDownloadExam = async () => {
    const issues = [];

    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0) {
      issues.push('Chưa có chi tiết ma trận.');
    } else {
      for (const sectionType of SAFE_ORDER) {
        const sections = groupedData?.[sectionType] ?? [];
        if (sections.length === 0) continue;

        const groupedByLevel = sections.reduce((acc, s) => {
          const lv = s?.levelName; if (!lv) return acc;
          (acc[lv] ??= []).push(s);
          return acc;
        }, {});

        for (const [levelName, levelSections] of Object.entries(groupedByLevel)) {
          const matrixItems = (matrixSectionDetail ?? []).filter(
            d => d?.typeName === sectionType && d?.levelName === levelName
          );
          const hasCfg = matrixItems.length > 0;
          const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);
          const selectedCount = (levelSections ?? []).reduce(
            (sum, s) => sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0
          );
          if (!hasCfg) {
            issues.push(`Thiếu cấu hình ma trận cho "${handleSectionType(sectionType)}" - mức "${levelName}".`);
          } else if (quantity > 0 && selectedCount < quantity) {
            issues.push(`Chưa đủ câu cho "${handleSectionType(sectionType)}" - mức "${levelName}": ${selectedCount}/${quantity}.`);
          }
        }
      }
    }

    if (issues.length) {
      issues.forEach(m => toast.warn(m));
      toast.error('Không thể tạo/tải đề. Vui lòng hoàn thiện ma trận và chọn đủ câu.');
      return;
    }

    try {
      for (const sectionId in selectedQuestionsBySection) {
        const qs = selectedQuestionsBySection[sectionId] || [];
        for (const q of qs) {
          await postQuestionSection({ questionId: q.id, sectionId });
        }
      }
      try {
        setLoading(true);
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
        toast.success('Lưu và tải đề thi thành công!')
        navigate('/exam')
      } catch (err) {
        toast.error('Lưu và tải đề thi thất bại!')
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Lỗi khi lưu câu hỏi vào đề!');
      return;
    }
  };

  // ==== UI (Admin) ====
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6" ref={examContentRef}>
      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-3">Thông tin tiêu đề</div>
          <div className="text-sm text-gray-700 space-y-2">
            <div><span className="font-medium">Tiêu đề:</span> {examData?.title ?? '—'}</div>
            <div><span className="font-medium">Khối:</span> {examData?.grade ?? '—'}</div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-3">Header hiển thị</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="SỞ GD&ĐT ..."
              onChange={e => setMinistry(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="TRƯỜNG THPT ..."
              onChange={e => setSchool(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 md:col-span-2"
              placeholder="Thời gian làm bài (vd: 45 phút)"
              onChange={e => setDuration(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Cấu trúc đề thi theo ma trận</div>
        <div className="p-4 space-y-5">
          {sortedGroupedData.map(groupObj => {
            const [sectionType, sections] = Object.entries(groupObj)[0];

            const titleMap = {
              MultipleChoice: 'Phần 1: Trắc nghiệm khách quan - Nhiều lựa chọn',
              TrueFalse: 'Phần 1: Trắc nghiệm khách quan - Đúng/Sai',
              ShortAnswer: 'Phần 1: Trắc nghiệm khách quan - Trả lời ngắn',
              Essay: 'Phần 2: Tự luận',
            };
            const sectionTitle = titleMap[sectionType] || sectionType;

            const groupedByLevel = (sections ?? []).reduce((acc, cur) => {
              const lv = cur?.levelName;
              if (!lv) return acc;
              (acc[lv] ??= []).push(cur);
              return acc;
            }, {});

            return (
              <div key={sectionType} className="rounded-lg border p-4">
                <div className="font-semibold mb-3">{sectionTitle}</div>

                {Object.entries(groupedByLevel ?? {})
                  .sort(([a], [b]) => {
                    const order = { Easy: 1, Medium: 2, Hard: 3 };
                    return (order[a] ?? 99) - (order[b] ?? 99);
                  })
                  .map(([levelName, levelSections]) => {
                    const levelMapping = { Easy: 'Nhận Biết', Medium: 'Thông Hiểu', Hard: 'Vận Dụng' };
                    const newLevelName = levelMapping[levelName] || levelName;

                    const matrixItems = (matrixSectionDetail ?? []).filter(
                      d => d?.typeName === sectionType && d?.levelName === levelName
                    );
                    const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);

                    const selectedCount = (levelSections ?? []).reduce(
                      (sum, s) => sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0
                    );

                    const firstSectionId = levelSections?.[0]?.data?.id;

                    return (
                      <div key={levelName} className="border rounded-md p-3 mb-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium">Mức độ: {newLevelName}</div>
                            <div className="text-gray-600">Số lượng câu hỏi theo ma trận: {quantity}</div>
                            <div className="text-gray-600">
                              Đã chọn: {selectedCount} / {quantity} câu
                            </div>
                          </div>
                          <PrimaryButton
                            onClick={() =>
                              handleOpenQuestionModal(firstSectionId, sectionType, levelName, quantity)
                            }
                            disabled={!firstSectionId || quantity === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Chọn câu hỏi
                          </PrimaryButton>
                        </div>

                        {/* List selected */}
                        <ul className="mt-3">
                          {(levelSections ?? []).map(s =>
                            (selectedQuestionsBySection?.[s?.data?.id] ?? []).map((q, idx, arr) => (
                              <li
                                key={q?.id ?? `${s?.data?.id}-${idx}`}
                                className={`text-sm text-gray-800 ${idx < arr.length - 1 ? 'border-b py-2' : 'pt-2'
                                  }`}
                              >
                                <span className="font-semibold mr-2">{idx + 1}.</span>
                                <span style={{ whiteSpace: 'normal' }}>
                                  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
                                    <MathJax dynamic>{q?.content ?? ''}</MathJax>
                                  </MathJaxContext>
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <PrimaryButton className="bg-gray-600 hover:bg-gray-700 text-white" onClick={onBack}>
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
          onClick={handleDownloadExam}
          disabled={!canGenerate || loading}
          title={!canGenerate ? 'Thiếu cấu hình hoặc chưa chọn đủ câu theo ma trận' : ''}
        >
          {loading ? 'Đang xử lý' : 'Lưu và tải xuống Word'}
        </PrimaryButton>
      </div>

      {isQuestionModalOpen && currentSectionToSelect && (
        <QuestionSelectionModal
          sectionId={currentSectionToSelect?.id}
          sectionType={currentSectionToSelect?.type}
          levelName={currentSectionToSelect?.level}
          grade={examData?.grade}
          quantityLimit={currentQuantityLimit}
          initialSelectedQuestions={selectedQuestionsBySection?.[currentSectionToSelect.id] ?? []}
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}
    </div>
  );
};

export default ExamPaperPreview;
