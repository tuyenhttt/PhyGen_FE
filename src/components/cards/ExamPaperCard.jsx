const ExamPaperCard = ({
  category = 'Lớp 10',
  image,
  title = 'Đề thi số 1',
}) => {
  return (
    <div className='w-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:scale-105 cursor-pointer flex flex-col'>
      {/* Image */}
      <div className='relative h-72'>
        <img
          src={image}
          alt={title}
          className='w-full h-full object-cover transition-transform duration-300'
        />
        <span className='absolute top-4 left-4 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow'>
          {category}
        </span>
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col justify-between h-20'>
        <h3 className='text-lg font-semibold text-gray-800 leading-snug line-clamp-2'>
          {title}
        </h3>
        <p className='text-sm text-gray-500 mt-2'>Bấm để xem chi tiết đề thi</p>
      </div>
    </div>
  );
};

export default ExamPaperCard;
