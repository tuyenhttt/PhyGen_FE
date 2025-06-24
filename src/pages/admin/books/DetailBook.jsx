import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSubjectBookById } from '@/services/subjectbooksService';
import { getChapterBySubjectBooks } from '@/services/chapterService';
import { getTopicByChapterId } from '@/services/topicService';
import { FaChevronDown, FaChevronUp, FaEye, FaArrowLeft } from 'react-icons/fa';

const DetailBook = () => {
  const { id: subjectBookId } = useParams();
  const navigate = useNavigate();

  const [bookInfo, setBookInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [openChapters, setOpenChapters] = useState({});

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const res = await getSubjectBookById(subjectBookId);
        setBookInfo(res.data?.data || null);
      } catch (err) {
        console.error('Lỗi lấy thông tin sách:', err);
      }
    };

    fetchBookDetail();
  }, [subjectBookId]);

  useEffect(() => {
    const fetchChaptersAndTopics = async () => {
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

    fetchChaptersAndTopics();
  }, [subjectBookId]);

  const toggleChapter = index => {
    setOpenChapters(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleViewTopic = topic => {
    navigate(`/admin/topics/${topic.id}/questions`, {
      state: {
        topicName: topic.name,
        orderNo: topic.orderNo,
      },
    });
  };

  if (!bookInfo) return <div className='p-6 text-gray-600'>Đang tải...</div>;

  return (
    <div className='p-6 min-h-screen bg-gray-100'>
      {/* Tiêu đề */}
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-6'>
        {bookInfo.name} - Lớp {bookInfo.grade}
      </h2>

      {/* Accordion chương - bài */}
      <div className='space-y-6 max-w-4xl mx-auto'>
        {chapters.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            Không có dữ liệu trong sách này.
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className='bg-white rounded-xl shadow border border-gray-200'
            >
              {/* Chương */}
              <div
                className='flex justify-between items-center p-5 cursor-pointer bg-indigo-100 hover:bg-indigo-200 transition'
                onClick={() => toggleChapter(index)}
              >
                <h3 className='text-lg font-semibold text-indigo-800'>
                  {`Chương ${chapter.orderNo || index + 1}: ${chapter.name}`}
                </h3>
                <span className='text-indigo-600'>
                  {openChapters[index] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              {/* Danh sách bài học */}
              {openChapters[index] && (
                <div className='px-5 pb-5 pt-2 border-t border-indigo-100'>
                  {chapter.topics.length === 0 ? (
                    <p className='text-gray-500 italic'>
                      Không có bài học trong chương này.
                    </p>
                  ) : (
                    <ul className='space-y-3'>
                      {chapter.topics.map(topic => (
                        <li
                          key={topic.id}
                          className='flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg shadow-sm'
                        >
                          <span className='text-base text-emerald-600 font-medium flex items-center gap-2'>
                            {`Bài ${topic.orderNo || '-'}: ${topic.name}`}
                          </span>
                          <button
                            onClick={() => handleViewTopic(topic)}
                            className='text-gray-600 hover:text-blue-600'
                            title='Xem chi tiết bài học'
                          >
                            <FaEye className='w-5 h-5' />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DetailBook;
