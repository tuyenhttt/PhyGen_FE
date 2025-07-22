import { useState, useEffect } from 'react';
import { updateMatrixDetail } from '@/services/matrixService';
import { IoSave, IoClose, IoPencil } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

const headers = [
  { label: 'TT', rowspan: 3 },
  { label: 'Phần', rowspan: 3 },
  { label: 'Câu hỏi', rowspan: 3 },
  {
    label: 'Mức độ đánh giá',
    colspan: 12,
    subHeaders: [
      {
        label: 'Trắc nghiệm nhiều đáp án',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
      {
        label: 'Trắc nghiệm Đúng/Sai',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
      {
        label: 'Câu hỏi trả lời ngắn',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
      {
        label: 'Tự luận',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
    ],
  },
  { label: 'Tổng', rowspan: 3 },
  { label: 'Điểm', rowspan: 3 },
];

const typeMap = {
  'Trắc nghiệm nhiều đáp án': 'MultipleChoice',
  'Trắc nghiệm Đúng/Sai': 'TrueFalse',
  'Câu hỏi trả lời ngắn': 'ShortAnswer',
  'Tự luận': 'Essay',
};

const detailScheme = [];
headers[3].subHeaders.forEach(sub => {
  const typeName = typeMap[sub.label];
  sub.subSubHeaders.forEach(levelName => {
    detailScheme.push({ typeName, levelName });
  });
});

const AssessmentMatrix = ({
  matrix = {},
  matrixSections = [],
  onBack,
  canEdit = true,
}) => {
  const [sections, setSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = matrixSections.map(sec => {
      const orig = Array.isArray(sec.details) ? sec.details : [];
      const details = detailScheme.map(({ typeName, levelName }) => {
        const found = orig.find(
          d => d.typeName === typeName && d.levelName === levelName
        );
        return {
          id: found?.id,
          typeName,
          levelName,
          quantity: found?.quantity || 0,
        };
      });
      return { ...sec, details };
    });
    setSections(init);
    setIsEditing(false);
  }, [matrixSections]);

  const toggleEdit = () => setIsEditing(e => !e);

  const handleCellChange = (secIdx, detailIdx, val) => {
    setSections(prev =>
      prev.map((s, i) => {
        if (i !== secIdx) return s;
        const newDetails = s.details.map((d, j) =>
          j === detailIdx ? { ...d, quantity: Number(val) || 0 } : d
        );
        return { ...s, details: newDetails };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalQuestionCount = sections
        .flatMap(s => s.details)
        .reduce((sum, d) => sum + d.quantity, 0);
      await updateMatrixDetail({
        id: matrix.id,
        subjectId: matrix.subjectId,
        examCategoryId: matrix.examCategoryId,
        name: matrix.name,
        description: matrix.description,
        totalQuestionCount,
        grade: matrix.grade,
        year: matrix.year,
        imgUrl: matrix.imgUrl,
        sections: sections.map(s => ({
          id: s.id,
          details: s.details.map(d => ({
            id: d.id,
            typeName: d.typeName,
            levelName: d.levelName,
            quantity: d.quantity,
          })),
        })),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='overflow-auto bg-white rounded-lg shadow-md p-4'>
      <div className='flex justify-between items-center mb-4'>
        {onBack && (
          <button
            onClick={onBack}
            className='text-gray-600 hover:text-gray-800 transition'
          >
            <IoClose size={24} />
          </button>
        )}
        {canEdit &&
          (isEditing ? (
            <div className='space-x-2'>
              <button
                onClick={handleSave}
                disabled={saving}
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
              >
                <IoSave className='mr-2' />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={toggleEdit}
                disabled={saving}
                className='inline-flex items-center px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition'
              >
                <IoClose className='mr-2' />
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={toggleEdit}
              className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition'
            >
              <FaEdit className='mr-2' />
              Chỉnh sửa
            </button>
          ))}
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full border-collapse table-auto'>
          <thead className='sticky top-0 bg-white'>
            <tr className='bg-gray-200 text-center text-sm font-semibold'>
              {headers.map((h, i) =>
                h.colspan ? (
                  <th
                    key={i}
                    colSpan={h.colspan}
                    className='border border-gray-300 px-3 py-2'
                  >
                    {h.label}
                  </th>
                ) : (
                  <th
                    key={i}
                    rowSpan={h.rowspan}
                    className='border border-gray-300 px-3 py-2'
                  >
                    {h.label}
                  </th>
                )
              )}
            </tr>
            <tr className='bg-gray-100 text-center text-sm'>
              {headers[3].subHeaders.map((sub, j) => (
                <th
                  key={j}
                  colSpan={sub.colspan}
                  className='border border-gray-300 px-3 py-2'
                >
                  {sub.label}
                </th>
              ))}
            </tr>
            <tr className='bg-gray-50 text-center text-sm'>
              {headers[3].subHeaders.flatMap((sub, j) =>
                sub.subSubHeaders.map((lab, k) => (
                  <th
                    key={`${j}-${k}`}
                    className='border border-gray-300 px-3 py-2'
                  >
                    {lab}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {sections.map((sec, sIdx) => {
              const total = sec.details.reduce((sum, d) => sum + d.quantity, 0);
              return (
                <tr key={sec.id || sIdx} className='hover:bg-gray-50'>
                  <td className='border border-gray-300 px-3 py-2 text-center'>
                    {sIdx + 1}
                  </td>
                  <td className='border border-gray-300 px-3 py-2'>
                    {sec.title}
                  </td>
                  <td className='border border-gray-300 px-3 py-2'>
                    {sec.description}
                  </td>
                  {sec.details.map((d, i) => (
                    <td
                      key={i}
                      className='border border-gray-300 px-3 py-2 text-center'
                    >
                      {isEditing ? (
                        <input
                          type='number'
                          min={0}
                          value={d.quantity}
                          onChange={e =>
                            handleCellChange(sIdx, i, e.target.value)
                          }
                          className='w-16 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      ) : (
                        d.quantity
                      )}
                    </td>
                  ))}
                  <td className='border border-gray-300 px-3 py-2 text-center font-medium'>
                    {total}
                  </td>
                  <td className='border border-gray-300 px-3 py-2 text-center'>
                    {sec.score}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentMatrix;
