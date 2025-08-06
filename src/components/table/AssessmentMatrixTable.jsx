const headers = [
  { label: 'TT', rowspan: 3 },
  { label: 'Chủ đề/Chương', rowspan: 3 },
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

const AssessmentMatrixTable = ({ matrixSections = [] }) => {
  const totals = {
    multipleChoice: Array(3).fill(0),
    trueFalse: Array(3).fill(0),
    shortAnswer: Array(3).fill(0),
    essay: Array(3).fill(0),
  };

  const totalQuestions = matrixSections.reduce((acc, section) => {
    section.details.forEach(detail => {
      const { levelName, typeName, quantity } = detail;
      if (typeName === 'MultipleChoice') {
        if (levelName === 'NhậnBiết') acc.multipleChoice[0] += quantity;
        else if (levelName === 'ThôngHiểu') acc.multipleChoice[1] += quantity;
        else if (levelName === 'VậnDụng') acc.multipleChoice[2] += quantity;
      } else if (typeName === 'TrueFalse') {
        if (levelName === 'NhậnBiết') acc.trueFalse[0] += quantity;
        else if (levelName === 'ThôngHiểu') acc.trueFalse[1] += quantity;
        else if (levelName === 'VậnDụng') acc.trueFalse[2] += quantity;
      } else if (typeName === 'ShortAnswer') {
        if (levelName === 'NhậnBiết') acc.shortAnswer[0] += quantity;
        else if (levelName === 'ThôngHiểu') acc.shortAnswer[1] += quantity;
        else if (levelName === 'VậnDụng') acc.shortAnswer[2] += quantity;
      } else if (typeName === 'Essay') {
        if (levelName === 'NhậnBiết') acc.essay[0] += quantity;
        else if (levelName === 'ThôngHiểu') acc.essay[1] += quantity;
        else if (levelName === 'VậnDụng') acc.essay[2] += quantity;
      }
    });
    return acc;
  }, totals);

  const totalQuestionSum = Object.values(totalQuestions)
    .flatMap(arr => arr)
    .reduce((a, b) => a + b, 0);

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
          {matrixSections.map((section, sectionIndex) => {
            const groupedDetails = section.details.reduce((acc, detail) => {
              const { title, levelName, typeName, quantity } = detail;
              if (!acc[title]) {
                acc[title] = {
                  title,
                  levels: Array(12).fill(0),
                };
              }

              let levelIndex = -1;
              if (typeName === 'MultipleChoice') {
                if (levelName === 'NhậnBiết') levelIndex = 0;
                else if (levelName === 'ThôngHiểu') levelIndex = 1;
                else if (levelName === 'VậnDụng') levelIndex = 2;
              } else if (typeName === 'TrueFalse') {
                if (levelName === 'NhậnBiết') levelIndex = 3;
                else if (levelName === 'ThôngHiểu') levelIndex = 4;
                else if (levelName === 'VậnDụng') levelIndex = 5;
              } else if (typeName === 'ShortAnswer') {
                if (levelName === 'NhậnBiết') levelIndex = 6;
                else if (levelName === 'ThôngHiểu') levelIndex = 7;
                else if (levelName === 'VậnDụng') levelIndex = 8;
              } else if (typeName === 'Essay') {
                if (levelName === 'NhậnBiết') levelIndex = 9;
                else if (levelName === 'ThôngHiểu') levelIndex = 10;
                else if (levelName === 'VậnDụng') levelIndex = 11;
              }

              if (levelIndex !== -1) {
                acc[title].levels[levelIndex] += quantity;
              }

              return acc;
            }, {});

            const groupedDetailEntries = Object.values(groupedDetails);
            const rowSpan = groupedDetailEntries.length || 1;

            return groupedDetailEntries.map((groupedDetail, detailIndex) => {
              const total = groupedDetail.levels.reduce((a, b) => a + b, 0);

              return (
                <tr key={`${section.id}-${groupedDetail.title}`}>
                  {detailIndex === 0 && (
                    <>
                      <td
                        rowSpan={rowSpan}
                        className='border px-2 py-1 text-center'
                      >
                        {sectionIndex + 1}
                      </td>
                      <td rowSpan={rowSpan} className='border px-2 py-1'>
                        {section.title}
                      </td>
                    </>
                  )}
                  <td className='border px-2 py-1'>{groupedDetail.title}</td>
                  {groupedDetail.levels.map((val, i) => (
                    <td key={i} className='border px-2 py-1 text-center'>
                      {val}
                    </td>
                  ))}
                  <td className='border px-2 py-1 text-center'>{total}</td>
                </tr>
              );
            });
          })}
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
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentMatrixTable;
