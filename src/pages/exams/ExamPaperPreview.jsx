import { useEffect, useState, useRef } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from './QuestionSelectionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

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
      return sectionType;
  }
};

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
  const [ministryOfEducationAndTraining, setMinistryOfEducationAndTraining] = useState('');
  const [school, setSchool] = useState('');
  const [durationTime, setDurationTime] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const examContentRef = useRef(null);

  const sortedSections = [...sectionsCreated].sort(
    (a, b) => a?.data?.displayOrder - b?.data?.displayOrder
  );

  if (!examData) {
    return (
      <div className='text-center text-gray-500'>
        Không có dữ liệu đề thi để hiển thị.
      </div>
    );
  }

  const groupedSections = sortedSections.reduce((acc, section) => {
    const groupKey = section?.data?.title;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: section?.data?.title,
        displayOrder: section?.data?.displayOrder,
        details: [],
      };
    }
    acc[groupKey].details.push(section);
    return acc;
  }, {});
  const orderedGroupedSections = Object.values(groupedSections).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleOpenQuestionModal = (
    sectionId,
    sectionType,
    levelName,
    quantityLimit
  ) => {
    setCurrentSectionToSelect({
      id: sectionId,
      type: handleSectionType(sectionType),
      level: levelName,
    });
    setCurrentQuantityLimit(quantityLimit);
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setCurrentSectionToSelect(null);
    setCurrentQuantityLimit(0);
  };

  const handleSaveSelectedQuestions = (sectionId, questions) => {
    onQuestionsSelected(sectionId, questions);
    handleCloseQuestionModal();
  };

  const handleDownloadWord = async () => {
    setIsConfirmModalOpen(false);
    try {
      const children = [];

      const headerTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `SỞ GIÁO DỤC VÀ ĐÀO TẠO ${ministryOfEducationAndTraining}`, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `TRƯỜNG THPT ${school}`, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '🙢★🙠', alignment: AlignmentType.CENTER })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `${examData?.title.toUpperCase()}`, bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `MÔN: VẬT LÍ - KHỐI: ${examData?.grade || '__'}`, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Thời gian làm bài: ${durationTime || '45 phút'}`, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Mã đề: ${examData?.id ? examData?.id.substring(0, 6).toUpperCase() : '______'}`, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      children.push(headerTable);

      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

      // Thông tin học sinh/lớp
      children.push(new Paragraph({
        children: [
          new TextRun('Họ và tên thí sinh: ....................................................................................'),
        ],
      }));
      children.push(new Paragraph({
        children: [
          new TextRun('Lớp: .............'),
        ],
        spacing: { after: 200 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'I. TRẮC NGHIỆM KHÁCH QUAN', bold: true, size: 28 }),
        ],
        spacing: { after: 100 }
      }));

      const groupedSections = [...sectionsCreated].sort(
        (a, b) => a?.data?.displayOrder - b?.data?.displayOrder
      ).reduce((acc, section) => {
        const groupKey = handleSectionType(section?.data?.sectionType);
        if (!acc[groupKey]) {
          acc[groupKey] = {
            title: groupKey,
            displayOrder: section?.data?.displayOrder,
            details: [],
          };
        }
        acc[groupKey].details.push(section);
        return acc;
      }, {});

      const orderedGroupedSections = Object.values(groupedSections).sort(
        (a, b) => a.displayOrder - b.displayOrder
      );

      let multipleChoiceQuestionCount = 0;
      let trueFalseQuestionCount = 0;
      let shortAnswerQuestionCount = 0;

      for (const group of orderedGroupedSections) {
        let questionCounter = 1;
        let partTitle = '';
        switch (group.title) {
          case 'Trắc nghiệm nhiều đáp án':
            partTitle = 'Phần 1. Trắc nghiệm nhiều lựa chọn';
            break;
          case 'Trắc nghiệm Đúng/Sai':
            partTitle = 'Phần 2. Trắc nghiệm Đúng/Sai';
            break;
          case 'Câu hỏi trả lời ngắn':
            partTitle = 'Phần 3. Trắc nghiệm trả lời ngắn';
            break;
          case 'Tự luận':
            partTitle = 'Phần II: TỰ LUẬN';
            break;
          default:
            partTitle = group.title;
        }

        children.push(new Paragraph({
          children: [
            new TextRun({ text: partTitle, bold: true, size: 26 }),
          ],
          spacing: { before: 200, after: 100 }
        }));

        for (const s of group.details) {
          const questions = selectedQuestionsBySection[s?.data?.id] || [];

          if (s?.data?.sectionType === 'MultipleChoice') {
            multipleChoiceQuestionCount += questions.length;
          } else if (s?.data?.sectionType === 'TrueFalse') {
            trueFalseQuestionCount += questions.length;
          } else if (s?.data?.sectionType === 'ShortAnswer') {
            shortAnswerQuestionCount += questions.length;
          }

          for (const q of questions) {

            // Thêm câu hỏi
            children.push(new Paragraph({
              children: [
                new TextRun({ text: `Câu ${questionCounter}. `, bold: true }),
                new TextRun(q?.content),
              ],
              spacing: { after: 50 }
            }));

            // Thêm các đáp án
            if (s?.data?.sectionType === 'MultipleChoice', 'TrueFalse') {
              const answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              const allAnswers = [];

              // Thu thập tất cả các đáp án hợp lệ
              for (let i = 1; i <= 6; i++) {
                const answerKey = `answer${i}`;
                if (q[answerKey]) {
                  allAnswers.push({
                    letter: answerLetters[i - 1],
                    text: q[answerKey],
                  });
                }
              }

              const numAnswers = allAnswers.length;
              let answersPerLine = 2;

              const hasLongAnswer = allAnswers.some(
                (ans) => ans.text.length > 50 || ans.text.includes('\n')
              );

              if (hasLongAnswer) {
                answersPerLine = 1;
              } else if (numAnswers >= 5) {
                answersPerLine = 6;
              } else if (numAnswers >= 2) {
                answersPerLine = 4;
              } else {
                answersPerLine = 1;
              }

              let currentLineChildren = [];
              allAnswers.forEach((ans, index) => {
                currentLineChildren.push(
                  new TextRun({ text: `${ans.letter}. `, bold: true }),
                  new TextRun({ text: `${ans.text}   ` })
                );

                if ((index + 1) % answersPerLine === 0 || index === numAnswers - 1) {
                  if (currentLineChildren.length > 0) {
                    children.push(new Paragraph({
                      children: currentLineChildren,
                      spacing: { after: 100 },
                    }));
                    currentLineChildren = [];
                  }
                }
              });
            }
            questionCounter++;
          }
        }
      }

      // Bảng đáp án cho Trắc nghiệm nhiều đáp án (Phần 1
      if (multipleChoiceQuestionCount > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN', bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 }
        }));

        const mcAnswerRows = [];
        const mcHeaderCells = [new TableCell({ children: [new Paragraph({ text: 'Câu', bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];
        const mcAnswerCells = [new TableCell({ children: [new Paragraph({ text: 'Đáp án', bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];

        for (let i = 1; i <= multipleChoiceQuestionCount; i++) {
          mcHeaderCells.push(new TableCell({ children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));
          mcAnswerCells.push(new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })); // Ô trống để điền đáp án
        }

        mcAnswerRows.push(new TableRow({ children: mcHeaderCells }));
        mcAnswerRows.push(new TableRow({ children: mcAnswerCells }));

        children.push(new Table({
          rows: mcAnswerRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
          },
        }));
      }

      // Bảng đáp án cho Trắc nghiệm Đúng/Sai (Phần 2)
      if (trueFalseQuestionCount > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI', bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 }
        }));

        const tfAnswerRows = [];
        const tfHeaderCells = [new TableCell({ children: [new Paragraph({ text: 'Câu', bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];

        for (let i = 1; i <= trueFalseQuestionCount; i++) {
          tfHeaderCells.push(new TableCell({ children: [new Paragraph({ text: `Câu ${i}`, bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));
        }
        tfAnswerRows.push(new TableRow({ children: tfHeaderCells }));

        const tfAnswerOptions = ['A)', 'B)', 'C)', 'D)','E)','F)'];

        for (let i = 0; i < tfAnswerOptions.length; i++) {
          const rowCells = [new TableCell({ children: [new Paragraph({ text: 'Đáp án', alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];
          if (i > 0) {
            rowCells[0] = new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER });
          }

          for (let j = 0; j < trueFalseQuestionCount; j++) {
            rowCells.push(new TableCell({ children: [new Paragraph({ text: tfAnswerOptions[i], alignment: AlignmentType.LEFT })], verticalAlign: VerticalAlign.CENTER }));
          }
          tfAnswerRows.push(new TableRow({ children: rowCells }));
        }

        children.push(new Table({
          rows: tfAnswerRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
          },
        }));
      }


      // Bảng đáp án cho Câu hỏi trả lời ngắn (Phần 3)
      if (shortAnswerQuestionCount > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN', bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 }
        }));

        const saAnswerRows = [];
        const saHeaderCells = [new TableCell({ children: [new Paragraph({ text: 'Câu', bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];
        const saAnswerCells = [new TableCell({ children: [new Paragraph({ text: 'Đáp án', bold: true, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })];

        for (let i = 1; i <= shortAnswerQuestionCount; i++) {
          saHeaderCells.push(new TableCell({ children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }));
          saAnswerCells.push(new TableCell({ children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER })); // Ô trống để điền đáp án
        }

        saAnswerRows.push(new TableRow({ children: saHeaderCells }));
        saAnswerRows.push(new TableRow({ children: saAnswerCells }));

        children.push(new Table({
          rows: saAnswerRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
            insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
          },
        }));
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${examData?.title.toUpperCase()}.docx`);

      toast.success('Đề thi Word đã được tải xuống!');
    } catch (error) {
      console.error('Lỗi khi tải xuống đề thi Word:', error);
      toast.error('Không thể tải xuống đề thi Word. Vui lòng thử lại.');
    }
  };

  const handleDownloadPdf = async () => {
    setIsConfirmModalOpen(false); 
    toast.info('Đang phát triển chức năng!')
  };
  const handleDownloadExam = () => {
    setIsConfirmModalOpen(true);
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md space-y-6' ref={examContentRef}>
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
              placeholder='Nhập tên Sở GDĐT'
              onChange={(e) => setMinistryOfEducationAndTraining(e.target.value)}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 uppercase'>
              TRƯỜNG THPT
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Nhập tên Trường THPT'
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          <div className='text-center'>
            <p>🙢★🙠</p>
          </div>
        </div>

        {/* Khung bên phải */}
        <div className='col-span-1 pl-4 space-y-2'>
          <p className='text-md font-bold text-gray-800 uppercase'>
            {examData?.title || 'Tiêu đề đề thi'}
          </p>
          <p className='text-md text-gray-700'>
            MÔN: VẬT LÍ - KHỐI: {examData?.grade || '__'}
          </p>
          <div className='flex'>
            <label className='flex items-center text-md font-medium text-gray-700'>
              Thời gian làm bài:
            </label>
            <input
              type='text'
              className='w-30 ml-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Ví dụ: 45 phút'
              onChange={(e) => setDurationTime(e.target.value)}
            />
          </div>
          <p className='text-md text-gray-700'>
            Mã đề:{' '}
            {examData?.id
              ? examData?.id.substring(0, 6).toUpperCase()
              : '______'}
          </p>
        </div>
      </div>

      <hr className='my-4' />

      <h3 className='text-xl font-bold text-indigo-700 text-center mb-4'>
        Cấu trúc đề thi
      </h3>

      {orderedGroupedSections.map(group => (
        <div
          key={group.title}
          className='border border-gray-200 p-4 rounded-md mt-4'
        >
          <h4 className='text-lg font-semibold text-gray-800 mb-3'>
            {group.title}
          </h4>
          {group.details.map(s => {
            const correspondingMatrixDetail = matrixSectionDetail.find(
              detail =>
                detail?.typeName === s?.data?.sectionType &&
                detail?.levelName === s?.levelName
            );

            const quantity = correspondingMatrixDetail
              ? correspondingMatrixDetail?.quantity
              : 'N/A';
            const currentSelectedCount =
              selectedQuestionsBySection[s?.data?.id]?.length || 0;

            return (
              <div
                key={s?.data?.id}
                className='ml-4 border-l-2 border-indigo-300 pl-4 py-2 my-2 bg-gray-50 rounded-md'
              >
                <p className='font-medium text-gray-700 mb-1'>
                  Mức độ: {s?.levelName}
                </p>
                <p className='text-gray-600 mb-2'>
                  Số lượng câu hỏi: {quantity}
                </p>
                <div className='flex items-center justify-between p-2 bg-white border border-dashed border-gray-200 rounded-md'>
                  <span className='text-gray-700'>
                    Đã chọn: {currentSelectedCount} / {quantity} câu hỏi.
                  </span>
                  <PrimaryButton
                    className='bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3'
                    onClick={() =>
                      handleOpenQuestionModal(
                        s?.data?.id,
                        s?.data?.sectionType,
                        s?.levelName,
                        quantity
                      )
                    }
                  >
                    Chọn câu hỏi
                  </PrimaryButton>
                </div>
                <ul className='mt-2'>
                  {selectedQuestionsBySection[s?.data?.id]?.map(
                    (q, index, array) => (
                      <li
                        key={q?.id}
                        className={`text-gray-700 text-sm flex items-start ${index < array.length - 1
                          ? 'border-b border-gray-200 pb-2 mb-2'
                          : ''
                          }`}
                      >
                        <span className='font-semibold mr-2 flex-shrink-0'>
                          {q?.no}.
                        </span>
                        <span style={{ whiteSpace: 'normal' }}>
                          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
                            <MathJax dynamic>{q?.content}</MathJax>
                            </MathJaxContext>
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      ))}

      <div className='flex justify-between mt-6'>
        <PrimaryButton
          className='bg-gray-500 hover:bg-gray-600 text-white'
          onClick={onBack}
        >
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className='bg-green-500 hover:bg-green-600 text-white'
          onClick={handleDownloadExam}
        >
          Tải xuống
        </PrimaryButton>
      </div>
      {isQuestionModalOpen && currentSectionToSelect && (
        <QuestionSelectionModal
          sectionId={currentSectionToSelect?.id}
          sectionType={currentSectionToSelect?.type}
          levelName={currentSectionToSelect?.level}
          quantityLimit={currentQuantityLimit}
          initialSelectedQuestions={
            selectedQuestionsBySection[currentSectionToSelect.id] || []
          }
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}

      <ConfirmModal
        visible={isConfirmModalOpen}
        title='Chọn định dạng tải xuống'
        onClose={() => setIsConfirmModalOpen(false)}
        width='max-w-xs'
      >
        <div className='flex flex-col space-y-4'>
          <PrimaryButton
            className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded'
            onClick={handleDownloadWord}
          >
            Tải xuống Word
          </PrimaryButton>
          <PrimaryButton
            className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded'
            onClick={handleDownloadPdf}
          >
            Tải xuống PDF
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ExamPaperPreview;
