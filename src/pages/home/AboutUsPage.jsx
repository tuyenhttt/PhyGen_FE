import { FiUsers, FiFileText, FiHelpCircle, FiGrid } from 'react-icons/fi';
import InfoCard from '@/components/cards/InfoCard';

const AboutUsPage = () => {
  const infoData = [
    {
      icon: <FiUsers size={40} className='text-blue-600' />,
      label: 'Người Đăng Ký',
      count: 0,
    },
    {
      icon: <FiFileText size={40} className='text-blue-600' />,
      label: 'Số Lượng Đề Thi',
      count: 0,
    },
    {
      icon: <FiHelpCircle size={40} className='text-blue-600' />,
      label: 'Số lượng câu hỏi',
      count: 0,
    },
    {
      icon: <FiGrid size={40} className='text-blue-600' />,
      label: 'Số Lượng Ma Trận',
      count: 0,
    },
  ];

  const coFoundersData = [
    {
      name: 'Huỳnh Thị Thanh Tuyền',
      role: 'Project Management FrontEnd Developer Tester',
      img: 'https://storage.googleapis.com/a1aa/image/090c2a7b-4393-4b43-e7f9-560fcc939fd1.jpg',
      alt: 'Man with beard wearing green shirt',
    },
    {
      name: 'Nguyễn Trương Gia Thịnh',
      role: 'BackEnd Developer',
      img: 'https://storage.googleapis.com/a1aa/image/a7dd7319-d0f3-4dc0-eaf9-10a3d4d1edb8.jpg',
      alt: 'Man with glasses wearing yellow sweater',
    },
    {
      name: 'Nguyễn Đào Minh Thuận',
      role: 'BackEnd Developer',
      img: 'https://storage.googleapis.com/a1aa/image/b7d55905-0e7d-46ad-377a-6773e0339a3a.jpg',
      alt: 'Woman with long brown hair wearing green top',
    },
    {
      name: 'Nguyễn Từ Khánh Hưng',
      role: 'FrontEnd Developer',
      img: 'https://storage.googleapis.com/a1aa/image/b7d55905-0e7d-46ad-377a-6773e0339a3a.jpg',
      alt: 'Woman with long brown hair wearing green top',
    },
    {
      name: 'Ngô Gia Hoàng',
      role: 'BackEnd Developer Tester',
      img: 'https://storage.googleapis.com/a1aa/image/57103609-bdc9-4f05-6b86-2c6ddbdfd736.jpg',
      alt: 'Woman with curly hair wearing black top',
    },
  ];

  return (
    <>
      <section className='max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20'>
        <div className='max-w-xl flex flex-col gap-4 md:gap-6'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-blue-900'>
            <span className='font-extrabold text-blue-600'>PhyGen</span>
            <br />
            <span className='font-extrabold'>
              Đồng hành cùng giáo viên Vật lý
            </span>
            <br />
            trong từng bài kiểm tra
          </h1>
          <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
            PhyGen ra đời với sứ mệnh đồng hành cùng các thầy cô giáo Vật lý
            trên hành trình soạn thảo và tổ chức các bài kiểm tra chất lượng,
            hiệu quả và tiết kiệm thời gian. Chúng tôi hiểu rằng, việc chuẩn bị
            đề kiểm tra phù hợp không chỉ giúp đánh giá chính xác kiến thức của
            học sinh mà còn góp phần nâng cao chất lượng giảng dạy và học tập
            môn Vật lý.
          </p>
          <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
            Với sự hỗ trợ của công nghệ trí tuệ nhân tạo, PhyGen giúp giáo viên
            nhanh chóng tạo ra các đề kiểm tra đa dạng về dạng câu hỏi, phù hợp
            với nhiều cấp độ khác nhau từ cơ bản đến nâng cao. Công cụ của chúng
            tôi không chỉ giảm bớt áp lực trong công việc soạn đề mà còn đảm bảo
            tính khoa học, chuẩn xác và sáng tạo trong từng đề thi.
          </p>
          <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
            Chúng tôi cam kết đồng hành cùng giáo viên Vật lý, góp phần xây dựng
            một môi trường học tập năng động, hứng thú và hiệu quả hơn cho học
            sinh. PhyGen – người bạn đồng hành tin cậy của giáo viên Vật lý
            trong từng bài kiểm tra.
          </p>
        </div>
        <div className='relative flex-shrink-0 max-w-[320px] sm:max-w-[360px] md:max-w-[400px]'>
          <img
            alt='Smiling woman holding books wearing pink sweater'
            className='rounded-lg shadow-lg'
            height='480'
            src='https://storage.googleapis.com/a1aa/image/c091df29-297e-4ed3-13a6-28c3f433e597.jpg'
            width='400'
          />
          <img
            alt='Smiling woman wearing yellow sweater with headphones'
            className='absolute top-8 right-0 rounded-lg shadow-lg border-4 border-white'
            height='240'
            src='https://storage.googleapis.com/a1aa/image/b105d8e7-e991-4a94-5b89-b4607c8acb63.jpg'
            width='160'
          />
          <img
            alt='Group of students studying together'
            className='absolute bottom-0 right-0 rounded-lg shadow-lg border-4 border-white'
            height='100'
            src='https://storage.googleapis.com/a1aa/image/5d2d6f2a-9abc-43cf-12b1-ffa45fdc22d3.jpg'
            width='160'
          />
          <div
            aria-hidden='true'
            className='absolute top-0 right-0 w-12 h-12 bg-blue-400 rounded-bl-[40px] z-10'
          />
          <div
            aria-hidden='true'
            className='absolute bottom-0 right-0 w-12 h-12 bg-yellow-400 rounded-tl-[40px] rotate-12 z-10'
          />
        </div>
      </section>

      {/* Section 2 */}
      <section className='relative bg-[#f5f9ff] py-16 px-6 sm:px-10 md:px-16 overflow-hidden'>
        <h2 className='text-center text-blue-900 font-bold text-xl sm:text-2xl md:text-3xl leading-tight max-w-xl mx-auto'>
          Nền Tảng Tạo Đề Thi Môn Vật Lý THPT
        </h2>

        <div className='mt-12 max-w-4xl mx-auto flex flex-col sm:flex-row justify-center gap-8 sm:gap-12'>
          {infoData.map(item => (
            <InfoCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              count={item.count}
            />
          ))}
        </div>
      </section>

      {/* Section 3 */}
      <section className='max-w-7xl mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-20'>
        <h3 className=' text-gray-900 font-bold text-xl sm:text-2xl md:text-3xl mb-12'>
          Đồng sáng lập
        </h3>

        <h3 className='mb-10 text-center font-bold text-lg sm:text-xl md:text-2xl text-blue-600'>
          Chill Group
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 '>
          {coFoundersData.map(({ name, role, img, alt }) => (
            <div
              key={name}
              className='bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transition hover:shadow-xl hover:-translate-y-1 duration-300'
            >
              <div className='w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-500'>
                <img
                  alt={alt}
                  className='object-cover w-full h-full'
                  src={img}
                />
              </div>
              <p className='mt-4 font-semibold text-base text-gray-900'>
                {name}
              </p>
              <p className='text-sm text-gray-500 mt-1'>{role}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;
