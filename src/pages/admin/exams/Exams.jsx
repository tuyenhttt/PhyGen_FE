import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { deleteExam, getAllExams } from '@/services/examService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import SearchInput from '@/components/ui/SearchInput';

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });
  const [filter, setFilter] = useState({
    level: '',
    type: '',
    grade: '',
    fromDate: '',
    toDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const response = await getAllExams({
        pageIndex: currentPage,
        pageSize: 10,
        Grade: filter.grade ? [filter.grade] : [],
        Year: filter.year ? [filter.year] : [],
        Search: searchTerm,
      });
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
  }, [currentPage, searchTerm, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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
    navigate(`/admin/exams-category/exams/${row.id}/exam-detail`);
  };

  const handleDeleteExam = exam => {
    setDeleteModal({ open: true, exam });
  };

  const confirmDeleteExam = async () => {
    try {
      await deleteExam(deleteModal.exam.id);
      toast.success('Xoá đề thi thành công');
      setDeleteModal({ open: false, exam: null });
      fetchExams();
    } catch (error) {
      console.error('Lỗi khi xoá đề thi:', error);
      toast.error('Lỗi khi xoá đề thi');
    }
  };

  const filteredExams = filter.randomizeQuestions
    ? exams.filter(
        e => e.randomizeQuestions === (filter.randomizeQuestions === 'true')
      )
    : exams;

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh sách đề thi</h2>
        <div className='flex gap-3'>
          <PrimaryButton
            onClick={console.log('đang làm')}
            className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200'
          >
            <FaPlus /> Thêm đề thi thủ công
          </PrimaryButton>
          <PrimaryButton
            onClick={console.log('đang làm')}
            className=' font-semibold py-2 px-4 rounded-lg flex items-center gap-2 '
          >
            <FaPlus /> Thêm đề thi tự động
          </PrimaryButton>
        </div>
      </div>
      <ReusableTable
        title='Danh sách đề thi'
        columns={columns}
        data={filteredExams}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          delete: handleDeleteExam,
        }}
        actionIcons={{
          view: 'view',
          delete: 'delete',
        }}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm kiếm đề thi...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className='border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
            >
              <IoFilter />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterModal && (
              <div className='absolute top-full right-0 mt-2 z-50 w-64 bg-white border shadow-md rounded-md p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <MdOutlineClear />
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
                  {/* Lớp */}
                  <div>
                    <label className='font-medium'>Khối lớp</label>
                    <select
                      value={filter.grade}
                      onChange={e =>
                        setFilter({ ...filter, grade: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='10'>Lớp 10</option>
                      <option value='11'>Lớp 11</option>
                      <option value='12'>Lớp 12</option>
                    </select>
                  </div>

                  {/* Xáo trộn */}
                  <div>
                    <label className='font-medium'>Xáo trộn câu hỏi</label>
                    <select
                      value={filter.randomizeQuestions}
                      onChange={e =>
                        setFilter({
                          ...filter,
                          randomizeQuestions: e.target.value,
                        })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='true'>Có</option>
                      <option value='false'>Không</option>
                    </select>
                  </div>

                  {/* Năm */}
                  <div>
                    <label className='font-medium'>Năm</label>
                    <select
                      value={filter.year}
                      onChange={e =>
                        setFilter({ ...filter, year: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='2020'>2020</option>
                      <option value='2021'>2021</option>
                      <option value='2022'>2022</option>
                      <option value='2023'>2023</option>
                      <option value='2024'>2024</option>
                      <option value='2025'>2025</option>
                    </select>
                  </div>
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setFilter({ level: '', type: '' });
                      setShowFilterModal(false);
                    }}
                    className='text-sm px-3 py-1.5 border rounded'
                  >
                    Bỏ lọc
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className='text-sm px-3 py-1.5 bg-blue-600 text-white rounded'
                  >
                    Lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá đề thi'
        onClose={() => setDeleteModal({ open: false, exam: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá đề thi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, exam: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteExam}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Exams;
