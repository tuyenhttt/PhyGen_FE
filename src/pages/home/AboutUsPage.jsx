import { FiUsers, FiFileText, FiHelpCircle, FiGrid } from 'react-icons/fi';
import InfoCard from '@/components/cards/InfoCard';
import { useEffect, useState } from 'react';
import { getAllExams, getAllQuestions } from '@/services/examService';
import { getAllMatrices } from '@/services/matrixService';
import Hoang from '@assets/images/Hoang.jpg';
import { getAllUserProfile } from '@/services/userService';

const AboutUsPage = () => {
  const [userCount, setUserCount] = useState(0);
  const [examCount, setExamCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [matrixCount, setMatrixCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, examRes, questionRes, matrixRes] = await Promise.all([
          getAllUserProfile(),
          // getAllExams(),
          // getAllQuestions(),
          // getAllMatrices(),
        ]);

        setUserCount(userRes?.data?.count || 0);
        setExamCount(examRes?.data?.count || 0);
        setQuestionCount(questionRes?.data?.count || 0);
        setMatrixCount(matrixRes?.data?.count || 0);
      } catch (err) {
        console.error('Lỗi khi fetch dữ liệu:', err);
      }
    };

    fetchData();
  }, []);

  const infoData = [
    {
      icon: <FiUsers size={40} className='text-blue-600' />,
      label: 'Người Đăng Ký',
      count: userCount,
    },
    {
      icon: <FiFileText size={40} className='text-blue-600' />,
      label: 'Số Lượng Đề Thi',
      count: examCount,
    },
    {
      icon: <FiHelpCircle size={40} className='text-blue-600' />,
      label: 'Số lượng câu hỏi',
      count: questionCount,
    },
    {
      icon: <FiGrid size={40} className='text-blue-600' />,
      label: 'Số Lượng Ma Trận',
      count: matrixCount,
    },
  ];

  const coFoundersData = [
    {
      name: 'Huỳnh Thị Thanh Tuyền',
      role: 'Project Management FrontEnd Developer Tester',
      img: Hoang,
      alt: 'TuyenHTT',
    },
    {
      name: 'Nguyễn Trương Gia Thịnh',
      role: 'BackEnd Developer',
      img: Hoang,
      alt: 'ThinhNTG',
    },
    {
      name: 'Nguyễn Đào Minh Thuận',
      role: 'BackEnd Developer',
      img: Hoang,
      alt: 'ThuanNDM',
    },
    {
      name: 'Ngô Gia Hoàng',
      role: 'BackEnd Developer Tester',
      img: Hoang,
      alt: 'HoangNG',
    },
    {
      name: 'Nguyễn Từ Khánh Hưng',
      role: 'FrontEnd Developer',
      img: Hoang,
      alt: 'HungNTK',
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
      <section className='relative bg-gray-100 py-16 px-6 sm:px-10 md:px-16 overflow-hidden'>
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
