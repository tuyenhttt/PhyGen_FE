import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const curriculumData = [
  {
    chapter: 'Chương 1: Động học chất điểm',
    lessons: [
      {
        id: 1,
        title: 'Bài 1: Chuyển động thẳng đều',
        content:
          'Nghiên cứu về quãng đường, vận tốc, phương trình chuyển động.',
      },
      {
        id: 2,
        title: 'Bài 2: Chuyển động thẳng biến đổi đều',
        content:
          'Gia tốc, vận tốc, quãng đường trong chuyển động thẳng biến đổi đều.',
      },
      {
        id: 3,
        title: 'Bài 3: Rơi tự do',
        content: 'Sự rơi của các vật dưới tác dụng của trọng lực.',
      },
    ],
  },
  {
    chapter: 'Chương 2: Động lực học chất điểm',
    lessons: [
      {
        id: 4,
        title: 'Bài 4: Lực và định luật Newton',
        content: 'Định luật I, II, III Newton và các loại lực cơ bản.',
      },
      {
        id: 5,
        title: 'Bài 5: Lực ma sát, lực đàn hồi, lực hấp dẫn',
        content: 'Đặc điểm và công thức tính các loại lực.',
      },
    ],
  },
  // Thêm các chương khác...
];

const CurriculumGrade10 = () => {
  const [openChapters, setOpenChapters] = useState({});
  const [openLessons, setOpenLessons] = useState({});

  const toggleChapter = chapterIndex => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  const toggleLesson = (chapterIndex, lessonId) => {
    setOpenLessons(prev => ({
      ...prev,
      [`${chapterIndex}-${lessonId}`]: !prev[`${chapterIndex}-${lessonId}`],
    }));
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Khung chương trình Vật lý Lớp 10
      </h2>

      <div className='space-y-6 max-w-4xl mx-auto'>
        {curriculumData.map((chapter, chapterIndex) => (
          <div
            key={chapterIndex}
            className='bg-white rounded-xl shadow-md overflow-hidden border border-gray-200'
          >
            {/* Header của Chương */}
            <div
              className='flex justify-between items-center p-5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition'
              onClick={() => toggleChapter(chapterIndex)}
            >
              <h3 className='text-lg font-semibold text-indigo-800 flex items-center gap-2'>
                {chapter.chapter}
              </h3>
              <span className='text-indigo-700'>
                {openChapters[chapterIndex] ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </span>
            </div>

            {/* Nội dung Chương (chỉ hiển thị khi mở) */}
            {openChapters[chapterIndex] && (
              <div className='px-5 pb-5 pt-2 border-t border-indigo-100'>
                <ul className='space-y-3'>
                  {chapter.lessons.map(lesson => (
                    <li
                      key={lesson.id}
                      className='bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden'
                    >
                      {/* Header của Bài */}
                      <div
                        className='flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition'
                        onClick={() => toggleLesson(chapterIndex, lesson.id)}
                      >
                        <h4 className='text-base text-emerald-600 font-medium flex items-center gap-2'>
                          {lesson.title}
                        </h4>
                        <span className='text-gray-600'>
                          {openLessons[`${chapterIndex}-${lesson.id}`] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </span>
                      </div>

                      {/* Nội dung Bài (chỉ hiển thị khi mở) */}
                      {openLessons[`${chapterIndex}-${lesson.id}`] && (
                        <div className='px-4 py-3 bg-gray-50 text-gray-700 text-sm border-t border-gray-100 leading-relaxed'>
                          {lesson.content}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumGrade10;
