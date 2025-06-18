import QuestionDetailPopup from '@/components/layouts/QuestionDetailPopup';
import ReusableTable from '@/components/table/ReusableTable';
import { useState } from 'react';

const DetailBook = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const columns = [
    { header: 'No', accessor: 'no' },
    { header: 'Câu hỏi', accessor: 'question' },
    { header: 'Mức độ đánh giá', accessor: 'level' },
  ];

  const data = [
    {
      no: 1,
      question: 'Hàm số nào sau đây đồng biến trên R?',
      level: 'Nhận biết',
      options: {
        A: 'y = -x²',
        B: 'y = 2x + 1',
        C: 'y = -3x',
        D: 'y = x²',
      },
    },
    {
      no: 2,
      question: 'Đạo hàm của hàm số y = x³ là gì?',
      level: 'Thông hiểu',
      options: {
        A: '3x²',
        B: 'x²',
        C: '3x',
        D: 'x³',
      },
    },
  ];

  const handleView = row => {
    setSelectedQuestion(row);
  };

  const handleEdit = row => {
    alert(`Sửa: ${row.name}`);
  };

  const handleDelete = row => {
    alert(`Xoá: ${row.name}`);
  };

  return (
    <>
      <ReusableTable
        columns={columns}
        data={data}
        currentPage={1}
        totalPages={3}
        onPageChange={page => console.log('Go to page:', page)}
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          delete: 'delete',
        }}
      />

      {selectedQuestion && (
        <QuestionDetailPopup
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </>
  );
};

export default DetailBook;
