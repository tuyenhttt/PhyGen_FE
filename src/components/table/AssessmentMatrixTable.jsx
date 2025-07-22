// const headers = [
//   { label: 'TT', rowSpan: 3 },
//   { label: 'Phần', rowSpan: 3 },
//   { label: 'Mô tả', rowSpan: 3 },
//   {
//     label: 'Loại câu hỏi',
//     colSpan: 12,
//     subHeaders: [
//       {
//         label: 'Trắc nghiệm nhiều đáp án',
//         colSpan: 3,
//         subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
//       },
//       {
//         label: 'Trắc nghiệm Đúng/Sai',
//         colSpan: 3,
//         subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
//       },
//       {
//         label: 'Câu hỏi trả lời ngắn',
//         colSpan: 3,
//         subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
//       },
//       {
//         label: 'Tự luận',
//         colSpan: 3,
//         subSubHeaders: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
//       },
//     ],
//   },
//   { label: 'Tổng số câu', rowSpan: 3 },
//   { label: 'Điểm', rowSpan: 3 },
// ];

// const AssessmentMatrixTable = ({ matrixSections = [] }) => {
//   return (
//     <div className='overflow-auto text-sm'>
//       <table className='min-w-[1200px] border-collapse table-auto w-full'>
//         <thead>
//           {/* Row 1 */}
//           <tr className='bg-gray-200 text-center text-sm font-semibold'>
//             {headers.map((h, i) =>
//               h.colSpan ? (
//                 <th key={i} colSpan={h.colSpan} className='border px-2 py-1'>
//                   {h.label}
//                 </th>
//               ) : (
//                 <th key={i} rowSpan={h.rowSpan} className='border px-2 py-1'>
//                   {h.label}
//                 </th>
//               )
//             )}
//           </tr>

//           {/* Row 2 */}
//           <tr className='bg-gray-100 text-center text-sm'>
//             {headers.flatMap((h, i) =>
//               h.subHeaders
//                 ? h.subHeaders.map((sub, j) => (
//                     <th
//                       key={`sub-${i}-${j}`}
//                       colSpan={sub.colSpan}
//                       className='border px-2 py-1'
//                     >
//                       {sub.label}
//                     </th>
//                   ))
//                 : []
//             )}
//           </tr>

//           {/* Row 3 */}
//           <tr className='bg-gray-50 text-center text-sm'>
//             {headers.flatMap((h, i) =>
//               h.subHeaders
//                 ? h.subHeaders.flatMap((sub, j) =>
//                     sub.subSubHeaders.map((label, k) => (
//                       <th
//                         key={`subsub-${i}-${j}-${k}`}
//                         className='border px-2 py-1'
//                       >
//                         {label}
//                       </th>
//                     ))
//                   )
//                 : []
//             )}
//           </tr>
//         </thead>

//         <tbody>
//           {matrixSections.map((section, index) => {
//             const levels = Array(12).fill(0);
//             section.details?.forEach(detail => {
//               const { levelName, typeName, quantity } = detail;
//               let levelIndex = -1;

//               if (typeName === 'MultipleChoice') {
//                 if (levelName === 'NhậnBiết') levelIndex = 0;
//                 else if (levelName === 'ThôngHiểu') levelIndex = 1;
//                 else if (levelName === 'VậnDụng') levelIndex = 2;
//               } else if (typeName === 'TrueFalse') {
//                 if (levelName === 'NhậnBiết') levelIndex = 3;
//                 else if (levelName === 'ThôngHiểu') levelIndex = 4;
//                 else if (levelName === 'VậnDụng') levelIndex = 5;
//               } else if (typeName === 'ShortAnswer') {
//                 if (levelName === 'NhậnBiết') levelIndex = 6;
//                 else if (levelName === 'ThôngHiểu') levelIndex = 7;
//                 else if (levelName === 'VậnDụng') levelIndex = 8;
//               } else if (typeName === 'Essay') {
//                 if (levelName === 'NhậnBiết') levelIndex = 9;
//                 else if (levelName === 'ThôngHiểu') levelIndex = 10;
//                 else if (levelName === 'VậnDụng') levelIndex = 11;
//               }

//               if (levelIndex !== -1) {
//                 levels[levelIndex] += quantity;
//               }
//             });
//             const total = levels.reduce((sum, val) => sum + val, 0);
//             return (
//               <tr key={section.id || index}>
//                 <td className='border px-2 py-1 text-center'>{index + 1}</td>
//                 <td className='border px-2 py-1'>{section.title}</td>
//                 <td className='border px-2 py-1'>{section.description}</td>
//                 {levels.map((val, i) => (
//                   <td key={i} className='border px-2 py-1 text-center'>
//                     {val}
//                   </td>
//                 ))}
//                 <td className='border px-2 py-1 text-center'>{total}</td>
//                 <td className='border px-2 py-1 text-center'>
//                   {section.score}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AssessmentMatrixTable;

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

const AssessmentMatrixTable = ({ matrixSections = [] }) => {
  return (
    <div className='overflow-auto text-sm'>
      <table className='min-w-[1200px] border-collapse table-auto w-full'>
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
          {matrixSections.map((section, index) => {
            const levels = Array(12).fill(0);

            section.details?.forEach(detail => {
              const { levelName, typeName, quantity } = detail;
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
                levels[levelIndex] += quantity;
              }
            });

            const total = levels.reduce((a, b) => a + b, 0);

            return (
              <tr key={section.id || index}>
                <td className='border px-2 py-1 text-center'>{index + 1}</td>
                <td className='border px-2 py-1'>{section.title}</td>
                <td className='border px-2 py-1'>{section.description}</td>
                {levels.map((val, i) => (
                  <td key={i} className='border px-2 py-1 text-center'>
                    {val}
                  </td>
                ))}
                <td className='border px-2 py-1 text-center'>{total}</td>
                <td className='border px-2 py-1 text-center'>
                  {section.score}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentMatrixTable;
