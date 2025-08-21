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
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, PageOrientation, VerticalMergeType
} from 'docx';
import { saveAs } from 'file-saver';


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

  // TẢI XUỐNG MA TRẬN
  const DownloadMatrixFile = async ({ matrix, sections, sectionDetails, examCategories }) => {
    if (!matrix) return;

    // ---------- Fonts & borders ----------
    const FS_TITLE = 32;
    const FS_H1 = 28;
    const FS = 26;
    const BORDER = {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
    };
    const safe = v => (v ?? '');
    const toInt = v => (Number.isFinite(+v) ? +v : 0);

    // ---------- Types & Levels ----------
    const TYPES = [
      { key: 'MultipleChoice', label: 'Nhiều lựa chọn' },
      { key: 'TrueFalse', label: '“Đúng – Sai”' },
      { key: 'ShortAnswer', label: 'Trả lời ngắn' },
    ];
    const ESSAY = { key: 'Essay', label: 'Tự luận' };
    const LEVELS = [
      { key: 'Easy', label: 'Nhận biết' },
      { key: 'Medium', label: 'Thông hiểu' },
      { key: 'Hard', label: 'Vận dụng' },
    ];

    // ---------- Chuẩn hoá & GỘP dữ liệu: contentFlow -> contentItem ----------
    const flowsMap = new Map();
    const itemsByFlow = new Map();

    (sectionDetails || []).forEach(d => {
      const flow = d?.contentFlow, item = d?.contentItem;
      if (!flow || !item) return;

      if (!flowsMap.has(flow.id)) {
        flowsMap.set(flow.id, { id: flow.id, name: safe(flow.name), orderNo: toInt(flow.orderNo) });
      }
      if (!itemsByFlow.has(flow.id)) itemsByFlow.set(flow.id, new Map());

      const fm = itemsByFlow.get(flow.id);
      if (!fm.has(item.id)) {
        fm.set(item.id, {
          item: { id: item.id, name: safe(item.name), orderNo: toInt(item.orderNo) },
          counts: {
            MultipleChoice: { Easy: 0, Medium: 0, Hard: 0 },
            TrueFalse: { Easy: 0, Medium: 0, Hard: 0 },
            ShortAnswer: { Easy: 0, Medium: 0, Hard: 0 },
            Essay: { Easy: 0, Medium: 0, Hard: 0 },
          },
        });
      }
      const rec = fm.get(item.id);
      const t = d?.typeName, lv = d?.levelName;
      if (rec?.counts?.[t] && rec.counts[t][lv] !== undefined) {
        rec.counts[t][lv] += toInt(d?.quantity);
      }
    });

    const flows = Array.from(flowsMap.values()).sort((a, b) => a.orderNo - b.orderNo);

    // ---------- Điểm từng phần (để tính Tổng điểm & %) ----------
    const titleToKey = {
      'Nhiều lựa chọn': 'MultipleChoice',
      'Đúng/Sai': 'TrueFalse',
      'Trả lời ngắn': 'ShortAnswer',
      'Tự luận': 'Essay',
    };
    const typePoints = { MultipleChoice: 0, TrueFalse: 0, ShortAnswer: 0, Essay: 0 };
    (sections || []).forEach(sec => {
      const k = titleToKey[safe(sec.title)];
      if (k) typePoints[k] = toInt(sec.score);
    });
    const totalPoints = Object.values(typePoints).reduce((s, v) => s + v, 0);
    const pct = x => (totalPoints ? Math.round((x / totalPoints) * 100) : 0);

    // ---------- Helpers ----------
    const W_TT = 6, W_FLOW = 16, W_ITEM = 24, W_TOTAL = 6;
    const cell = (text, { bold = false, center = false, widthPct = null, shading = null } = {}) =>
      new TableCell({
        width: widthPct != null ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
        shading: shading ? { type: 'clear', color: 'auto', fill: shading } : undefined,
        children: [
          new Paragraph({
            children: [new TextRun({ text: `${text}`, bold, size: FS })],
            alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
          }),
        ],
      });

    // ---------- Tiêu đề ----------
    const children = [];
    children.push(
      new Paragraph({
        children: [new TextRun({ text: (matrix?.name || 'MA TRẬN ĐỀ KIỂM TRA').toUpperCase(), bold: true, size: FS_TITLE })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );
    if (safe(matrix?.description)) {
      safe(matrix.description).split('\n').filter(Boolean).forEach(line => {
        children.push(new Paragraph({ children: [new TextRun({ text: line, size: FS })] }));
      });
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // ---------- Header 4 tầng (levels là con của type) ----------
    const rowHeader1 = new TableRow({
      children: [
        new TableCell({ rowSpan: 4, width: { size: W_TT, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'TT', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ rowSpan: 4, width: { size: W_FLOW, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Chủ đề/\nChương', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ rowSpan: 4, width: { size: W_ITEM, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Nội dung/đơn vị kiến thức', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 12, children: [new Paragraph({ children: [new TextRun({ text: 'Mức độ đánh giá', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ rowSpan: 4, width: { size: W_TOTAL, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
      ],
    });

    const rowHeader2 = new TableRow({
      children: [
        new TableCell({ columnSpan: 9, children: [new Paragraph({ children: [new TextRun({ text: 'TNKQ', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: ESSAY.label, bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
      ],
    });

    const rowHeader3 = new TableRow({
      children: [
        ...TYPES.map(t => new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: t.label, bold: true, size: FS })], alignment: AlignmentType.CENTER })] })),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: ESSAY.label, bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
      ],
    });

    const rowHeader4 = new TableRow({
      children: [
        ...TYPES.flatMap(() => LEVELS.map(l => cell(l.label, { bold: true, center: true }))),
        ...LEVELS.map(l => cell(l.label, { bold: true, center: true })), // Essay
      ],
    });

    // ---------- Dữ liệu: merge dọc TT & Chương, chống tách trang ----------
    const totals = {
      MultipleChoice: { Easy: 0, Medium: 0, Hard: 0 },
      TrueFalse: { Easy: 0, Medium: 0, Hard: 0 },
      ShortAnswer: { Easy: 0, Medium: 0, Hard: 0 },
      Essay: { Easy: 0, Medium: 0, Hard: 0 },
    };
    let grand = 0;
    let ttIndex = 1;

    const dataRows = [];
    for (const flow of flows) {
      const items = Array.from(itemsByFlow.get(flow.id).values()).sort((a, b) => a.item.orderNo - b.item.orderNo);

      items.forEach((rec, i) => {
        const measureCells = [];
        // TNKQ
        TYPES.forEach(t => {
          LEVELS.forEach(l => {
            const v = toInt(rec.counts[t.key][l.key]);
            totals[t.key][l.key] += v;
            measureCells.push(cell(v ? `${v}` : '', { center: true }));
          });
        });
        // TL
        LEVELS.forEach(l => {
          const v = toInt(rec.counts[ESSAY.key][l.key]);
          totals[ESSAY.key][l.key] += v;
          measureCells.push(cell(v ? `${v}` : '', { center: true }));
        });

        const rowSum =
          TYPES.reduce((s, t) => s + LEVELS.reduce((ss, l) => ss + toInt(rec.counts[t.key][l.key]), 0), 0) +
          LEVELS.reduce((ss, l) => ss + toInt(rec.counts[ESSAY.key][l.key]), 0);
        grand += rowSum;

        dataRows.push(
          new TableRow({
            cantSplit: true,
            children: [
              // TT (vertical merge)
              new TableCell({
                verticalMerge: i === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                width: { size: W_TT, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: i === 0 ? `${ttIndex}` : '', size: FS })], alignment: AlignmentType.CENTER })],
              }),
              // Chủ đề/Chương (vertical merge)
              new TableCell({
                verticalMerge: i === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                width: { size: W_FLOW, type: WidthType.PERCENTAGE },
                children: i === 0 ? [new Paragraph({ children: [new TextRun({ text: `Chủ đề: ${flow.name}`, size: FS })] })] : [new Paragraph({ children: [new TextRun({ text: '' })] })],
              }),
              // Nội dung/đơn vị
              cell(rec.item.name, { widthPct: W_ITEM }),
              ...measureCells,
              cell(`${rowSum}`, { center: true, widthPct: W_TOTAL }),
            ],
          })
        );
      });

      ttIndex++;
    }

    // ---------- Hàng TỔNG SỐ CÂU/LỆNH HỎI ----------
    const totalCountCells = [
      new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng số câu/lệnh hỏi', bold: true, size: FS })] })] }),
      ...TYPES.flatMap(t => LEVELS.map(l => cell(`${totals[t.key][l.key]}`, { bold: true, center: true, shading: 'ead5c5' }))),
      ...LEVELS.map(l => cell(`${totals[ESSAY.key][l.key]}`, { bold: true, center: true, shading: 'ead5c5' })),
      cell(`${grand}`, { bold: true, center: true, shading: 'ead5c5' }),
    ];
    const rowTotalCount = new TableRow({ children: totalCountCells });

    // ---------- Hàng TỔNG SỐ ĐIỂM (gộp 3 cột/nhóm) ----------
    const rowTotalPoints = new TableRow({
      children: [
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng số điểm', bold: true, size: FS })] })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${typePoints.MultipleChoice}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${typePoints.TrueFalse}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${typePoints.ShortAnswer}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${typePoints.Essay}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${totalPoints}`, bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
      ],
    });

    // ---------- Hàng TỶ LỆ % (gộp 3 cột/nhóm) ----------
    const rowPercent = new TableRow({
      children: [
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: 'Tỷ lệ %', bold: true, size: FS })] })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${pct(typePoints.MultipleChoice)}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${pct(typePoints.TrueFalse)}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${pct(typePoints.ShortAnswer)}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: `${pct(typePoints.Essay)}`, size: FS })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '100', bold: true, size: FS })], alignment: AlignmentType.CENTER })] }),
      ],
    });

    // ---------- Ghép bảng ma trận ----------
    const matrixTable = new Table({
      rows: [
        rowHeader1, rowHeader2, rowHeader3, rowHeader4,
        ...dataRows,
        rowTotalCount,
        rowTotalPoints,
        rowPercent,
      ],
      borders: BORDER,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    children.push(matrixTable);

    // ---------- Footer ----------
    children.push(new Paragraph({ text: '', spacing: { after: 150 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: `Khối: ${matrix?.grade ?? ''}   Năm học: ${matrix?.year ?? ''}`, size: FS })] }));
    if (examCategories?.name) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Kỳ kiểm tra: ${examCategories.name}`, size: FS })] }));
    }

    // ---------- PACK & SAVE (Landscape) ----------
    const doc = new Document({
      sections: [{
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
        children,
      }],
    });
    const blob = await Packer.toBlob(doc);
    const fname = (matrix?.name || 'MA_TRAN_DE').toUpperCase().replace(/\s+/g, '_');
    saveAs(blob, `${fname}.docx`);
  };


  return (
    <div className='min-h-screen px-4 sm:px-8 py-12 max-w-7xl mx-auto mt-10'>
      {/* Top actions */}
      <div className='mb-6 flex items-center justify-between'>
        <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>

        <CommonButton
          onClick={() =>
            DownloadMatrixFile({ matrix, sections, sectionDetails, examCategories })
          }
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
