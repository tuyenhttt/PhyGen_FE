import React from 'react';

const ExamPaperCard = ({
  category = 'Lớp 10',
  image,
  title = 'Đề thi số 1',
}) => {
  return (
    <div className='bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'>
      {/* Image */}
      <div className='relative'>
        <img
          src={image}
          alt='Exam'
          className='w-full h-48 object-cover transition-transform duration-300 hover:scale-105'
        />
        <span className='absolute top-3 left-5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md'>
          {category}
        </span>
      </div>

      {/* Content */}
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-gray-800 mb-2 line-clamp-2'>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default ExamPaperCard;
