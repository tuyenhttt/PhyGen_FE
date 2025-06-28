import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getSubjectBookById } from '@/services/subjectbooksService';
import {
  createChapter,
  deleteChapter,
  getChapterBySubjectBooks,
  updateChapter,
} from '@/services/chapterService';
import {
  createTopic,
  deleteTopic,
  getTopicByChapterId,
  updateTopic,
} from '@/services/topicService';
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';

const DetailBook = () => {
  const { id: subjectBookId } = useParams();
  const navigate = useNavigate();

  const [bookInfo, setBookInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [openChapterId, setOpenChapterId] = useState(null);
  const [dropdownOpenChapterId, setDropdownOpenChapterId] = useState(null);
  const [dropdownOpenTopicId, setDropdownOpenTopicId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [chapterModal, setChapterModal] = useState({
    open: false,
    mode: 'add',
    chapter: null,
  });
  const [chapterNameInput, setChapterNameInput] = useState('');
  const [topicModal, setTopicModal] = useState({
    open: false,
    mode: 'add',
    chapter: null,
    topic: null,
  });
  const [topicNameInput, setTopicNameInput] = useState('');

  const chapterDropdownRef = useRef(null);
  const topicDropdownRef = useRef(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const res = await getSubjectBookById(subjectBookId);
        const book = res.data?.data;
        if (!book) {
          setLoadError(true);
        } else {
          setBookInfo(book);
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin sách:', err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetail();
  }, [subjectBookId]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpenChapterId(null);
      }

      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpenTopicId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchChapters = async () => {
    try {
      const res = await getChapterBySubjectBooks(subjectBookId, 1, 100);
      const chapterList = res.data?.data?.data || [];

      const chaptersWithTopics = await Promise.all(
        chapterList.map(async chapter => {
          const topicRes = await getTopicByChapterId(chapter.id, 1, 100);
          const topics = topicRes.data?.data?.data || [];
          return { ...chapter, topics };
        })
      );

      setChapters(chaptersWithTopics);
    } catch (err) {
      console.error('Lỗi khi lấy chương hoặc chủ đề:', err);
    }
  };

  useEffect(() => {
    if (!loadError) fetchChapters();
  }, [subjectBookId, loadError]);

  const toggleChapter = id => {
    setOpenChapterId(prev => (prev === id ? null : id));
    setDropdownOpenChapterId(null);
    setDropdownOpenTopicId(null);
  };

  const handleDropdownToggleChapter = (e, id) => {
    e.stopPropagation();
    setDropdownOpenChapterId(prev => (prev === id ? null : id));
  };

  const handleDropdownToggleTopic = (e, id) => {
    e.stopPropagation();
    setDropdownOpenTopicId(prev => (prev === id ? null : id));
  };

  const handleViewTopic = topic => {
    navigate(`/admin/topics/${topic.id}/questions`, {
      state: {
        topicName: topic.name,
        orderNo: topic.orderNo,
      },
    });
  };

  const handleAddChapter = () => {
    setChapterModal({ open: true, mode: 'add', chapter: null });
    setChapterNameInput('');
  };

  const handleEditChapter = chapter => {
    setChapterModal({ open: true, mode: 'edit', chapter });
    setChapterNameInput(chapter.name || '');
  };

  const handleDeleteChapter = chapter => {
    setChapterModal({ open: true, mode: 'delete', chapter });
  };

  const handleAddTopic = chapter => {
    setTopicModal({
      open: true,
      mode: 'add',
      chapter,
      topic: null,
    });
    setTopicNameInput('');
  };

  const handleEditTopic = topic => {
    const chapter = chapters.find(c => c.id === topic.chapterId);
    setTopicModal({
      open: true,
      mode: 'edit',
      chapter,
      topic,
    });
    setTopicNameInput(topic.name || '');
  };

  const handleDeleteTopic = topic => {
    setTopicModal({
      open: true,
      mode: 'delete',
      topic,
      chapter: null,
    });
  };

  const handleConfirmChapterModal = async () => {
    const { mode, chapter } = chapterModal;
    const name = chapterNameInput.trim();

    if (mode === 'delete') {
      try {
        await deleteChapter(chapter.id);
        toast.success('Xóa chương thành công');
      } catch {
        toast.error('Lỗi khi xóa chương');
      }
    } else if (!name) {
      return;
    } else if (mode === 'add') {
      try {
        const orderNo = chapters.length + 1;
        await createChapter(subjectBookId, name, orderNo);
        toast.success('Thêm chương thành công');
      } catch {
        toast.error('Lỗi khi thêm chương');
      }
    } else if (mode === 'edit') {
      try {
        await updateChapter({
          id: chapter.id,
          subjectBookId: chapter.subjectBookId,
          name,
          orderNo: chapter.orderNo,
        });
        toast.success('Cập nhật chương thành công');
      } catch {
        toast.error('Lỗi khi cập nhật chương');
      }
    }

    setChapterModal({ open: false, mode: 'add', chapter: null });
    await fetchChapters();
  };

  const handleConfirmTopicModal = async () => {
    const name = topicNameInput.trim();
    const { mode, chapter, topic } = topicModal;

    try {
      if (mode === 'delete') {
        await deleteTopic(topic.id);
        toast.success('Xoá bài học thành công');
      } else {
        if (!name || !chapter) return;

        if (mode === 'add') {
          const orderNo = chapter.topics?.length + 1 || 1;
          await createTopic(chapter.id, name, orderNo);
          toast.success('Thêm bài học thành công');
        } else if (mode === 'edit') {
          await updateTopic({
            id: topic.id,
            chapterId: chapter.id,
            name,
            orderNo: topic.orderNo,
          });
          toast.success('Cập nhật bài học thành công');
        }
      }

      setTopicModal({ open: false, mode: 'add', chapter: null, topic: null });
      setTopicNameInput('');
      await fetchChapters();
    } catch (error) {
      toast.error(
        mode === 'delete'
          ? 'Lỗi khi xoá bài học'
          : mode === 'edit'
          ? 'Lỗi khi cập nhật bài học'
          : 'Lỗi khi thêm bài học'
      );
    }
  };

  const closeChapterModal = () => {
    setChapterModal({ open: false, mode: 'add', chapter: null });
    setChapterNameInput('');
  };

  if (isLoading) {
    return <div className='p-6 text-gray-600'>Đang tải nội dung sách...</div>;
  }

  if (loadError || !bookInfo) {
    return (
      <div className='p-10 text-center text-gray-600 font-sm'>
        Không có nội dung sách để hiển thị.
      </div>
    );
  }

  return (
    <div className='p-6 min-h-screen bg-gray-100 relative'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-6'>
          {bookInfo.name} - Lớp {bookInfo.grade}
        </h2>
        <button
          onClick={handleAddChapter}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm chương
        </button>
      </div>
      <div className='space-y-6 max-w-4xl mx-auto'>
        {chapters.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            Không có chương nào trong sách này.
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className='bg-indigo-100 rounded-xl shadow relative'
            >
              <div
                className='flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-indigo-200 transition rounded-t-xl'
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className='flex items-center text-indigo-800 font-semibold text-base gap-2'>
                  {`Chương ${chapter.orderNo || index + 1}: ${chapter.name}`}
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    className='text-gray-600 hover:text-indigo-700'
                    onClick={e => handleDropdownToggleChapter(e, chapter.id)}
                  >
                    <FaEllipsisV />
                  </button>
                  {openChapterId === chapter.id ? (
                    <FaChevronUp className='text-indigo-600' />
                  ) : (
                    <FaChevronDown className='text-indigo-600' />
                  )}
                </div>
              </div>

              {dropdownOpenChapterId === chapter.id && (
                <div
                  ref={chapterDropdownRef}
                  className='absolute right-4 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg text-sm w-48 z-50'
                >
                  <button
                    onClick={() => handleAddTopic(chapter)}
                    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-green-600'
                  >
                    <FaPlus /> Thêm bài học
                  </button>
                  <button
                    onClick={() => handleEditChapter(chapter)}
                    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-blue-600'
                  >
                    <FaEdit /> Sửa chương
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(chapter)}
                    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-red-600'
                  >
                    <FaTrash /> Xóa chương
                  </button>
                </div>
              )}

              {openChapterId === chapter.id && (
                <div className='p-4 space-y-2'>
                  {chapter.topics.length === 0 ? (
                    <p className='italic text-gray-500'>
                      Không có nội dung trong chương này.
                    </p>
                  ) : (
                    chapter.topics.map(topic => (
                      <div
                        key={topic.id}
                        className='relative flex justify-between items-center bg-white rounded-lg px-4 py-3 shadow-sm'
                      >
                        <div className='text-emerald-600 font-medium'>
                          {`Bài ${topic.orderNo || '-'}: ${topic.name}`}
                        </div>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={e =>
                              handleDropdownToggleTopic(e, topic.id)
                            }
                            className='text-gray-600 hover:text-gray-900'
                          >
                            <FaEllipsisV />
                          </button>
                          {dropdownOpenTopicId === topic.id && (
                            <div
                              ref={topicDropdownRef}
                              className='absolute right-4 top-12 bg-white border border-gray-200 shadow-lg rounded-lg text-sm w-44 z-50'
                            >
                              <button
                                onClick={() => handleViewTopic(topic)}
                                className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-gray-700'
                              >
                                <FaEye /> Xem chi tiết
                              </button>
                              <button
                                onClick={() => handleEditTopic(topic)}
                                className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-blue-600'
                              >
                                <FaEdit /> Sửa bài
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic)}
                                className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-red-600'
                              >
                                <FaTrash /> Xóa bài
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        visible={chapterModal.open}
        title={
          chapterModal.mode === 'edit'
            ? 'Sửa chương'
            : chapterModal.mode === 'delete'
            ? 'Xóa chương'
            : 'Thêm chương mới'
        }
        onClose={closeChapterModal}
      >
        {chapterModal.mode === 'delete' ? (
          <p className='mb-6 text-gray-700'>
            Bạn có chắc chắn muốn xóa chương{' '}
            <strong>{chapterModal.chapter?.name}</strong> không?
          </p>
        ) : (
          <input
            type='text'
            value={chapterNameInput}
            onChange={e => setChapterNameInput(e.target.value)}
            placeholder='Nhập tên chương'
            className='w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        )}

        <div className='flex justify-end gap-2'>
          <button
            onClick={() =>
              setChapterModal({ open: false, mode: 'add', chapter: null })
            }
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmChapterModal}
            className={`px-4 py-2 rounded-md text-white ${
              chapterModal.mode === 'delete'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {chapterModal.mode === 'edit'
              ? 'Lưu'
              : chapterModal.mode === 'delete'
              ? 'Xóa'
              : 'Thêm'}
          </button>
        </div>
      </ConfirmModal>

      <ConfirmModal
        visible={topicModal.open}
        title={
          topicModal.mode === 'edit'
            ? 'Sửa bài học'
            : topicModal.mode === 'delete'
            ? 'Xoá bài học'
            : 'Thêm bài học mới'
        }
        onClose={() =>
          setTopicModal({
            open: false,
            mode: 'add',
            topic: null,
            chapter: null,
          })
        }
      >
        {topicModal.mode === 'delete' ? (
          <p className='mb-6 text-gray-700'>
            Bạn có chắc chắn muốn xoá bài học{' '}
            <strong>{topicModal.topic?.name}</strong> không?
          </p>
        ) : (
          <input
            type='text'
            value={topicNameInput}
            onChange={e => setTopicNameInput(e.target.value)}
            placeholder='Nhập tên bài học'
            className='w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        )}

        <div className='flex justify-end gap-2'>
          <button
            onClick={() =>
              setTopicModal({
                open: false,
                mode: 'add',
                topic: null,
                chapter: null,
              })
            }
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmTopicModal}
            className={`px-4 py-2 rounded-md text-white ${
              topicModal.mode === 'delete'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {topicModal.mode === 'edit'
              ? 'Lưu'
              : topicModal.mode === 'delete'
              ? 'Xóa'
              : 'Thêm'}
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default DetailBook;
