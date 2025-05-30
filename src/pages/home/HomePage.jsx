import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import phone from '@/assets/images/phone.png';
import banner from '@/assets/images/Banner1.jpg';
import pic1 from '@/assets/images/pic1.avif';
import pic2 from '@/assets/images/pic2.jpg';
import FeatureCard from '@/components/ui/FeatureCard';

const HomePage = () => {
  return (
    <>
      <Header />

      {/* Banner Section */}
      <section className="bg-[#f9fbff] py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
          {/* Left Text */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:font-bold leading-tight mb-6">
              Phy<span className="text-blue-600">Gen</span> - Tạo đề thi Vật Lý THPT <br />
              <span className="text-blue-600">nhanh chóng, dễ dàng với AI</span>
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
                KHÁM PHÁ NGAY
              </button>
              <div className="flex items-center gap-2 text-blue-800 font-semibold">
                <img
                src={phone}
                />

                Liên hệ với chúng tôi<br />
                <span className="font-bold">993-00-67777</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 relative">
            <img
              src={banner}
              alt="Teacher"
              className="w-full max-w-md mx-auto"
            />
            {/* Các icon trang trí (có thể thêm bằng Tailwind hoặc SVG tĩnh nếu bạn muốn) */}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image Section */}
          <div className="flex justify-center items-center gap-6">
            <div className="relative w-40 h-40">
              <img
                src={pic1}
                alt="Piture 1"
                className="rounded-lg shadow-lg w-full h-full object-cover"
              />
            </div>
            <div className="relative w-52 h-64">
              <img
                src={pic2}
                alt="Picture 2"
                className="rounded-lg shadow-xl w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Section */}
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase">
              Hiểu rõ hơn về PhyGen
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Khám Phá Những Đề Thi Vật Lý <span className="text-blue-600">Mới Nhất</span> Theo Chuẩn
            </h2>
            <p className="text-gray-600 mb-6">
              PhyGen cung cấp hàng ngàn đề thi Vật Lý được biên soạn thông minh và tự động nhờ AI. Khám phá cách học hiện đại, tiết kiệm thời gian mà vẫn đạt hiệu quả cao.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong className="text-lg text-black">Theo chuẩn Bộ Giáo Dục</strong>
              </div>
              <div>
                <strong className="text-lg text-black">Đa dạng cấp độ khó</strong>
              </div>
              <div>
                <strong className="text-lg text-black">Cập nhật đề thi mới</strong>
              </div>
              <div>
                <strong className="text-lg text-black">Ngân hàng câu hỏi lớn</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
        {/* Nội dung chính */}
        <main className="flex-1 p-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thẻ: Ngân hàng câu hỏi thông minh */}
            <FeatureCard
              title="Ngân hàng câu hỏi thông minh"
              description="Phân loại theo chương, mức độ, loại câu hỏi. Hỗ trợ tái sử dụng và đóng góp."
            />

            {/* Thẻ: Tạo đề với AI */}
            <FeatureCard
              title="Kho đề thi & Tài liệu"
              description="Tải về đề mẫu, đề thi thật, và các tài liệu ôn tập theo chuẩn chương trình 2018."
            />

            {/* Thẻ: Về chúng tôi */}
            <FeatureCard
              title="Tạo đề với AI"
              description="Sinh đề tự động theo chương trình, mục tiêu học tập. Tùy chọn số lượng và định dạng."
            />
          </section>
        </main>

      <Footer />
    </>
  );
};

export default HomePage;
