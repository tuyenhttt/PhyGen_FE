import { useState, useEffect } from 'react';

const headers = [
  { label: 'TT', rowspan: 3 },
  { label: 'Phần', rowspan: 3 },
  { label: 'Câu hỏi', rowspan: 3 },
  {
    label: 'Mức độ đánh giá',
    colspan: 12,
    subHeaders: [
      {
        label: 'Nhiều lựa chọn',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
      {
        label: 'Đúng/Sai',
        colspan: 3,
        subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      },
      {
        label: 'Trả lời ngắn',
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

const levelMap = [
  { typeName: 'MultipleChoice', levelName: 'NhậnBiết' },
  { typeName: 'MultipleChoice', levelName: 'ThôngHiểu' },
  { typeName: 'MultipleChoice', levelName: 'VậnDụng' },

  { typeName: 'TrueFalse', levelName: 'NhậnBiết' },
  { typeName: 'TrueFalse', levelName: 'ThôngHiểu' },
  { typeName: 'TrueFalse', levelName: 'VậnDụng' },

  { typeName: 'ShortAnswer', levelName: 'NhậnBiết' },
  { typeName: 'ShortAnswer', levelName: 'ThôngHiểu' },
  { typeName: 'ShortAnswer', levelName: 'VậnDụng' },

  { typeName: 'Essay', levelName: 'NhậnBiết' },
  { typeName: 'Essay', levelName: 'ThôngHiểu' },
  { typeName: 'Essay', levelName: 'VậnDụng' },
];

const AssessmentMatrixTableEditable = ({
  matrixSections = [],
  onQuantityChange,
  onScoreChange,
}) => {
  const [quantities, setQuantities] = useState([]);

  const [scores, setScores] = useState([]);

  useEffect(() => {
    setQuantities(
      matrixSections.map(sec => {
        const arr = Array(12).fill(0);
        (sec.details || []).forEach(det => {
          const idx = levelMap.findIndex(
            m => m.typeName === det.typeName && m.levelName === det.levelName
          );
          if (idx >= 0) arr[idx] = det.quantity;
        });
        return arr;
      })
    );
    setScores(matrixSections.map(sec => sec.score));
  }, [matrixSections]);

  const handleQtyInput = (secIdx, lvlIdx, raw) => {
    const val = Number(raw) || 0;
    setQuantities(qs => {
      const copy = qs.map(row => [...row]);
      copy[secIdx][lvlIdx] = val;
      return copy;
    });

    const { typeName, levelName } = levelMap[lvlIdx];
    onQuantityChange(matrixSections[secIdx].id, typeName, levelName, val);
  };

  const handleScoreInput = (secIdx, raw) => {
    const val = Number(raw) || 0;
    setScores(ss => {
      const copy = [...ss];
      copy[secIdx] = val;
      return copy;
    });
    onScoreChange(matrixSections[secIdx].id, val);
  };

  return (
    <div className='overflow-auto text-sm'>
      <table className=' border-collapse table-auto w-full'>
        <thead>
          {/* Row 1 */}
          <tr className='bg-gray-200 text-center text-sm font-semibold'>
            {headers.map((h, i) =>
              h.colspan ? (
                <th key={i} colSpan={h.colspan} className='border px-2 py-1'>
                  {h.label}
                </th>
              ) : (
                <th key={i} rowSpan={h.rowspan} className='border px-2 py-1'>
                  {h.label}
                </th>
              )
            )}
          </tr>
          {/* Row 2 */}
          <tr className='bg-gray-100 text-center text-sm'>
            {headers.flatMap((h, i) =>
              h.subHeaders
                ? h.subHeaders.map((sub, j) => (
                    <th
                      key={`sub-${i}-${j}`}
                      colSpan={sub.colspan}
                      className='border px-2 py-1'
                    >
                      {sub.label}
                    </th>
                  ))
                : []
            )}
          </tr>
          {/* Row 3 */}
          <tr className='bg-gray-50 text-center text-sm'>
            {headers.flatMap((h, i) =>
              h.subHeaders
                ? h.subHeaders.flatMap((sub, j) =>
                    sub.subSubHeaders.map((lab, k) => (
                      <th
                        key={`subsub-${i}-${j}-${k}`}
                        className='border px-2 py-1'
                      >
                        {lab}
                      </th>
                    ))
                  )
                : []
            )}
          </tr>
        </thead>

        <tbody>
          {matrixSections.map((sec, secIdx) => {
            const row = quantities[secIdx] || Array(12).fill(0);
            const total = row.reduce((a, b) => a + b, 0);

            return (
              <tr key={sec.id}>
                <td className='border px-2 py-1 text-center'>{secIdx + 1}</td>
                <td className='border px-2 py-1'>{sec.title}</td>
                <td className='border px-2 py-1'>{sec.description}</td>

                {row.map((val, lvlIdx) => (
                  <td key={lvlIdx} className='border px-2 py-1 text-center'>
                    <input
                      type='number'
                      value={val}
                      onChange={e =>
                        handleQtyInput(secIdx, lvlIdx, e.target.value)
                      }
                      className='w-16 text-center border rounded'
                    />
                  </td>
                ))}

                <td className='border px-2 py-1 text-center'>{total}</td>
                <td className='border px-2 py-1 text-center'>
                  <input
                    type='number'
                    value={scores[secIdx] ?? 0}
                    onChange={e => handleScoreInput(secIdx, e.target.value)}
                    className='w-16 text-center border rounded'
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default AssessmentMatrixTableEditable;
