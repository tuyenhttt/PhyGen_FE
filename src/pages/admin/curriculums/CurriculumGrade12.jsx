import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const curriculumData = [
    {
        chapter: 'Chương 1: Động học chất điểm',
        lessons: [
            { id: 1, title: 'Bài 1: Chuyển động thẳng đều', content: 'Nghiên cứu về quãng đường, vận tốc, phương trình chuyển động.' },
            { id: 2, title: 'Bài 2: Chuyển động thẳng biến đổi đều', content: 'Gia tốc, vận tốc, quãng đường trong chuyển động thẳng biến đổi đều.' },
            { id: 3, title: 'Bài 3: Rơi tự do', content: 'Sự rơi của các vật dưới tác dụng của trọng lực.' },
        ],
    },
    {
        chapter: 'Chương 2: Động lực học chất điểm',
        lessons: [
            { id: 4, title: 'Bài 4: Lực và định luật Newton', content: 'Định luật I, II, III Newton và các loại lực cơ bản.' },
            { id: 5, title: 'Bài 5: Lực ma sát, lực đàn hồi, lực hấp dẫn', content: 'Đặc điểm và công thức tính các loại lực.' },
        ],
    },
    // Thêm các chương khác...
];

const CurriculumGrade12 = () => {
    const [openChapters, setOpenChapters] = useState({});
    const [openLessons, setOpenLessons] = useState({});

    const toggleChapter = (chapterIndex) => {
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
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-5">Khung chương trình Vật lý Lớp 12</h2>

            <div className="space-y-4">
                {curriculumData.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Header của Chương */}
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                            onClick={() => toggleChapter(chapterIndex)}
                        >
                            <h2 className="text-lg font-semibold text-gray-800">{chapter.chapter}</h2>
                            <span>
                                {openChapters[chapterIndex] ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </div>

                        {/* Nội dung Chương (chỉ hiển thị khi mở) */}
                        {openChapters[chapterIndex] && (
                            <div className="p-4 border-t border-gray-200">
                                <ul className="space-y-2">
                                    {chapter.lessons.map(lesson => (
                                        <li key={lesson.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            {/* Header của Bài */}
                                            <div
                                                className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                                                onClick={() => toggleLesson(chapterIndex, lesson.id)}
                                            >
                                                <h3 className="text-base font-medium text-gray-700">{lesson.title}</h3>
                                                <span>
                                                    {openLessons[`${chapterIndex}-${lesson.id}`] ? <FaChevronUp /> : <FaChevronDown />}
                                                </span>
                                            </div>

                                            {/* Nội dung Bài (chỉ hiển thị khi mở) */}
                                            {openLessons[`${chapterIndex}-${lesson.id}`] && (
                                                <div className="p-3 bg-gray-50 text-gray-600 text-sm border-t border-gray-100">
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
}



export default CurriculumGrade12;