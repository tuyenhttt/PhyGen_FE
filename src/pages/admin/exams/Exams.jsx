import ReusableTable from '@/components/table/ReusableTable';
import { getAllExams } from '@/services/examService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const response = await getAllExams();
      const raw = response.data;
      const list = Array.isArray(raw.data?.data) ? raw.data.data : [];

      const formatted = list.map((item, index) => ({
        ...item,
        no: (currentPage - 1) * 10 + index + 1,
      }));

      setExams(formatted);
      setTotalPages(Math.ceil(raw.data.count / 10));
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [currentPage]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Tên đề thi',
      accessor: 'title',
      render: value => (
        <div className='max-w-[200px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[250px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Năm', accessor: 'year' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    { header: 'Số phiên bản', accessor: 'versionCount' },
    {
      header: 'Xáo trộn?',
      accessor: 'randomizeQuestions',
      render: value => (value ? 'Có' : 'Không'),
    },
  ];

  const handleView = row => {
    navigate(`/admin/exams/${row.id}`);
  };

  const handleEdit = row => {
    alert(`Sửa: ${row.title}`);
  };

  const handleDelete = row => {
    alert(`Xoá: ${row.title}`);
  };

  return (
    <div className='p-4 space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Danh sách đề thi
      </h2>
      <ReusableTable
        columns={columns}
        data={exams}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
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
    </div>
  );
};

export default Exams;
