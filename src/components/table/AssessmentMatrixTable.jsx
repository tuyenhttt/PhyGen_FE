const headers = [
  { label: 'TT', rowspan: 3 },
  { label: 'Chương', rowspan: 3 },
  { label: 'Nội dung/Đơn vị kiến thức', rowspan: 3 },
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
];

const AssessmentMatrixTable = ({
  matrixSectionDetails = [],
  matrixSections = [],
}) => {
  // Tính tổng số câu hỏi cho từng loại/mức độ từ 1 list detail phẳng
  const totalQuestions = (() => {
    const totals = {
      multipleChoice: [0, 0, 0],
      trueFalse: [0, 0, 0],
      shortAnswer: [0, 0, 0],
      essay: [0, 0, 0],
    };
    matrixSectionDetails.forEach(detail => {
      const { levelName, typeName, quantity } = detail;
      if (typeName === 'MultipleChoice') {
        if (levelName === 'Easy') totals.multipleChoice[0] += quantity;
        else if (levelName === 'Medium') totals.multipleChoice[1] += quantity;
        else if (levelName === 'Hard') totals.multipleChoice[2] += quantity;
      } else if (typeName === 'TrueFalse') {
        if (levelName === 'Easy') totals.trueFalse[0] += quantity;
        else if (levelName === 'Medium') totals.trueFalse[1] += quantity;
        else if (levelName === 'Hard') totals.trueFalse[2] += quantity;
      } else if (typeName === 'ShortAnswer') {
        if (levelName === 'Easy') totals.shortAnswer[0] += quantity;
        else if (levelName === 'Medium') totals.shortAnswer[1] += quantity;
        else if (levelName === 'Hard') totals.shortAnswer[2] += quantity;
      } else if (typeName === 'Essay') {
        if (levelName === 'Easy') totals.essay[0] += quantity;
        else if (levelName === 'Medium') totals.essay[1] += quantity;
        else if (levelName === 'Hard') totals.essay[2] += quantity;
      }
    });
    return totals;
  })();

  const totalQuestionSum = Object.values(totalQuestions)
    .flatMap(arr => arr)
    .reduce((a, b) => a + b, 0);

  const defaultSections = [
    { key: 'MultipleChoice', title: 'Nhiều lựa chọn' },
    { key: 'TrueFalse', title: 'Đúng/Sai' },
    { key: 'ShortAnswer', title: 'Trả lời ngắn' },
    { key: 'Essay', title: 'Tự luận' },
  ];

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

  matrixSections.forEach(section => {
    const key = sectionTitleToKey[section.title];
    if (key) {
      typePoints[key] = section.score ?? 0;
    }
  });

  const totalPointSum = Object.values(typePoints).reduce((a, b) => a + b, 0);

  return (
    <div className='overflow-auto text-sm'>
      <table className='min-w-[1200px] border-collapse table-auto w-full'>
        <thead>
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
          <tr className='bg-gray-50 text-center text-sm'>
            {headers.flatMap((h, i) =>
              h.subHeaders
                ? h.subHeaders.flatMap((sub, j) =>
                  sub.subSubHeaders.map((label, k) => (
                    <th
                      key={`subsub-${i}-${j}-${k}`}
                      className='border px-2 py-1'
                    >
                      {label}
                    </th>
                  ))
                )
                : []
            )}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(matrixSectionDetails) && matrixSectionDetails.length > 0 ? (
            (() => {
              const flowGrouped = {};
              matrixSectionDetails.forEach(detail => {
                const flowName = detail.contentFlow?.name || '';
                const itemName = detail.contentItem?.name || '';
                if (!flowGrouped[flowName]) flowGrouped[flowName] = {};
                if (!flowGrouped[flowName][itemName]) flowGrouped[flowName][itemName] = [];
                flowGrouped[flowName][itemName].push(detail);
              });

              let rowIndex = 0;
              const rows = [];
              Object.entries(flowGrouped).forEach(([flowName, itemGroup]) => {
                const itemNames = Object.keys(itemGroup);
                const flowRowSpan = itemNames.length;
                itemNames.forEach((itemName, itemIdx) => {
                  const details = itemGroup[itemName];
                  const levels = Array(12).fill(0);
                  let total = 0;
                  details.forEach(detail => {
                    let levelIndex = -1;
                    if (detail.typeName === 'MultipleChoice') {
                      if (detail.levelName === 'Easy') levelIndex = 0;
                      else if (detail.levelName === 'Medium') levelIndex = 1;
                      else if (detail.levelName === 'Hard') levelIndex = 2;
                    } else if (detail.typeName === 'TrueFalse') {
                      if (detail.levelName === 'Easy') levelIndex = 3;
                      else if (detail.levelName === 'Medium') levelIndex = 4;
                      else if (detail.levelName === 'Hard') levelIndex = 5;
                    } else if (detail.typeName === 'ShortAnswer') {
                      if (detail.levelName === 'Easy') levelIndex = 6;
                      else if (detail.levelName === 'Medium') levelIndex = 7;
                      else if (detail.levelName === 'Hard') levelIndex = 8;
                    } else if (detail.typeName === 'Essay') {
                      if (detail.levelName === 'Easy') levelIndex = 9;
                      else if (detail.levelName === 'Medium') levelIndex = 10;
                      else if (detail.levelName === 'Hard') levelIndex = 11;
                    }
                    if (levelIndex !== -1) {
                      levels[levelIndex] += detail.quantity;
                    }
                    total += detail.quantity;
                  });

                  rows.push(
                    <tr key={`${flowName}|||${itemName}`}>
                      {itemIdx === 0 && (
                        <>
                          <td
                            rowSpan={flowRowSpan}
                            className='border px-2 py-1 text-center align-middle'
                          >
                            {rowIndex + 1}
                          </td>
                          <td rowSpan={flowRowSpan} className='border px-2 py-1 align-middle'>
                            {flowName}
                          </td>
                        </>
                      )}
                      <td className='border px-2 py-1'>{itemName}</td>
                      {levels.map((val, i) => (
                        <td key={i} className='border px-2 py-1 text-center'>
                          {val}
                        </td>
                      ))}
                      <td className='border px-2 py-1 text-center'>{total}</td>
                    </tr>
                  );
                  rowIndex++;
                });
              });
              return rows;
            })()
          ) : (
            <tr>
              <td colSpan={16} className='border px-2 py-4 text-center text-gray-500'>
                Không có dữ liệu chi tiết ma trận.
              </td>
            </tr>
          )}
          {/* Total row at the end of the table */}
          <tr className='bg-gray-100 font-semibold text-center'>
            <td colSpan='3' className='border px-2 py-1 text-right'>
              Tổng số câu hỏi:
            </td>
            {Object.values(totalQuestions)
              .flatMap(arr => arr)
              .map((total, i) => (
                <td key={i} className='border px-2 py-1'>
                  {total}
                </td>
              ))}
            <td className='border px-2 py-1'>{totalQuestionSum}</td>
          </tr>
          <tr className='bg-gray-100 font-semibold text-center'>
            <td colSpan='3' className='border px-2 py-1 text-right'>
              Tổng số điểm
            </td>
            {defaultSections.map(section => (
              <td key={section.key} colSpan="3" className="border px-2 py-1">
                {typePoints[section.key] || 0}
              </td>
            ))}
            <td className='border px-2 py-1'>{totalPointSum}</td>
          </tr>

          {/* Tỷ lệ % */}
          <tr className='bg-gray-50 font-semibold text-center'>
            <td colSpan='3' className='border px-2 py-1 text-right'>
              Tỷ lệ %
            </td>
            {defaultSections.map(section => {
              const percent = totalPointSum
                ? ((typePoints[section.key] / totalPointSum) * 100).toFixed(1)
                : 0;
              return (
                <td key={section.key} colSpan="3" className="border px-2 py-1">
                  {`${percent}%`}
                </td>
              );
            })}
            <td className='border px-2 py-1'>{(typePoints.MultipleChoice + typePoints.TrueFalse + typePoints.ShortAnswer + typePoints.Essay)*10}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentMatrixTable;
