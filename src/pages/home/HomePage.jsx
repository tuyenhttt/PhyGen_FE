import phone from '@/assets/images/phone.png';
import banner from '@/assets/images/Banner1.jpg';
import pic1 from '@/assets/images/pic1.avif';
import pic2 from '@/assets/images/pic2.jpg';
import class10 from '@/assets/images/class10.jpg';
import FeatureCard from '@/components/layouts/FeatureCard';
import ExamPaperCard from '@/components/layouts/ExamPaperCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ClassCard from '@/components/layouts/ClassCard';

const HomePage = () => {
  return (
    <>
      {/* Banner Section */}
      <section className='bg-[#f9fbff] py-20'>
        <div className='max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between gap-10'>
          {/* Left Text */}
          <div className='md:w-1/2 text-center md:text-left'>
            <h1 className='text-4xl md:font-bold leading-tight mb-6'>
              Phy<span className='text-blue-600'>Gen</span> - Tạo đề thi Vật Lý
              THPT <br />
              <span className='text-blue-600'>nhanh chóng, dễ dàng với AI</span>
            </h1>

            <div className='flex flex-col sm:flex-row items-center justify-center gap-20'>
              <PrimaryButton className='px-8 py-3 text-base font-semibold shadow-lg transition duration-300 ease-in-out hover:bg-indigo-500 hover:scale-105'>
                KHÁM PHÁ NGAY
              </PrimaryButton>

              <div className='flex items-center gap-4 text-indigo-700 font-medium text-sm sm:text-base'>
                <img src={phone} alt='Phone icon' className='w-10 h-10' />
                <div className='leading-tight'>
                  <p className='mb-1'>Liên hệ với chúng tôi</p>
                  <p className='font-bold text-lg tracking-wide'>
                    993-00-67777
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className='md:w-1/2 relative mt-5'>
            <img
              src={banner}
              alt='Teacher'
              className='w-full max-w-md mx-auto'
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className='py-20 bg-white px-4'>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
          {/* Image Section */}
          <div className='flex justify-center items-center gap-6'>
            <div className='relative w-40 h-40'>
              <img
                src={pic1}
                alt='Piture 1'
                className='rounded-lg shadow-lg w-full h-full object-cover'
              />
            </div>
            <div className='relative w-52 h-64'>
              <img
                src={pic2}
                alt='Picture 2'
                className='rounded-lg shadow-xl w-full h-full object-cover'
              />
            </div>
          </div>

          {/* Text Section */}
          <div>
            <span className='text-blue-600 font-semibold text-sm uppercase'>
              Hiểu rõ hơn về PhyGen
            </span>
            <h2 className='text-3xl md:text-4xl font-bold mt-2 mb-4'>
              Khám Phá Những Đề Thi Vật Lý{' '}
              <span className='text-blue-600'>Mới Nhất</span> Theo Chuẩn
            </h2>
            <p className='text-gray-600 mb-6'>
              PhyGen cung cấp hàng ngàn đề thi Vật Lý được biên soạn thông minh
              và tự động nhờ AI. Khám phá cách học hiện đại, tiết kiệm thời gian
              mà vẫn đạt hiệu quả cao.
            </p>

            <div className='grid grid-cols-2 gap-4 text-sm text-gray-700'>
              <div>
                <strong className='text-lg text-black'>
                  Theo chuẩn Bộ Giáo Dục
                </strong>
              </div>
              <div>
                <strong className='text-lg text-black'>
                  Đa dạng cấp độ khó
                </strong>
              </div>
              <div>
                <strong className='text-lg text-black'>
                  Cập nhật đề thi mới
                </strong>
              </div>
              <div>
                <strong className='text-lg text-black'>
                  Ngân hàng câu hỏi lớn
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tính năng nổi bật */}
      <section className='flex-1 p-8 mb-10'>
        <h2 className='text-3xl text-center font-bold mt-10 mb-10 text-indigo-600 tracking-wide'>
          Tính năng nổi bật
        </h2>
        <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Thẻ: Ngân hàng câu hỏi thông minh */}
          <FeatureCard
            title='Ngân hàng câu hỏi thông minh'
            description='Phân loại theo chương, mức độ, loại câu hỏi. Hỗ trợ tái sử dụng và đóng góp.'
          />

          {/* Thẻ: Tạo đề với AI */}
          <FeatureCard
            title='Kho đề thi & Tài liệu'
            description='Tải về đề mẫu, đề thi thật, và các tài liệu ôn tập theo chuẩn chương trình 2018.'
          />

          {/* Thẻ: Về chúng tôi */}
          <FeatureCard
            title='Tạo đề với AI'
            description='Sinh đề tự động theo chương trình, mục tiêu học tập. Tùy chọn số lượng và định dạng.'
          />
        </section>
      </section>

      {/* Tổng hợp đề thi */}
      <section className='bg-gray-50 py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col sm:flex-row justify-center items-center mb-12'>
            <h2 className='text-3xl font-bold text-center text-indigo-600'>
              Tổng hợp đề thi
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center'>
            <ExamPaperCard image={banner} />
            <ExamPaperCard image={banner} />
            <ExamPaperCard image={banner} />
            <ExamPaperCard image={banner} />
            <ExamPaperCard image={banner} />
            <ExamPaperCard image={banner} />
          </div>

          <div className='mt-14 flex justify-center'>
            <PrimaryButton className='px-8 py-3 text-base'>
              Xem thêm đề thi
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* Khám phá theo lớp học */}
      <section className='px-6 md:px-12 py-16 bg-[#F9FAFB] mb-20'>
        <div className='flex flex-col md:flex-row justify-between items-start gap-10'>
          {/* Bên trái: tiêu đề + mô tả */}
          <div className='md:w-1/3 flex flex-col items-center text-center md:items-start md:text-left justify-center'>
            <h2 className='text-3xl font-bold text-indigo-700 mb-4'>
              Khám phá theo lớp học
            </h2>
            <p className='text-gray-600 leading-relaxed'>
              Dễ dàng tìm kiếm đề thi theo từng lớp với hệ thống phân loại thông
              minh.
            </p>
          </div>

          {/* Bên phải: các ClassCard */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 xl:gap-8 md:w-2/3'>
            <ClassCard icon={class10} title='Lớp 10' count={8} />
            <ClassCard icon={class10} title='Lớp 11' count={12} />
            <ClassCard icon={class10} title='Lớp 12' count={12} />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
