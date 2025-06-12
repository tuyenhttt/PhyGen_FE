import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import logo from '@/assets/images/logo.jpeg';

const Footer = () => {
  return (
    <footer className='bg-[#10355c] text-white'>
      <div className='max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-12'>
        {/* Logo & Info */}
        <div>
          <img src={logo} alt='PhyGen' className='h-20 mb-7 rounded-md' />
          <p className='text-gray-300 text-md mb-4 leading-relaxed'>
            PhyGen là trang web tổng hợp đề thi môn Vật Lý THPT, cho phép bạn
            tạo đề thi cùng với AI.
          </p>
          <ul className='text-gray-400 text-md space-y-1'>
            <li> Địa chỉ: Quy Nhơn - Bình Định</li>
            <li> Số điện thoại: 0355 478 845</li>
            <li> Email: chill@gmail.com</li>
          </ul>
          <div className='flex gap-4 mt-4 text-xl'>
            <FaFacebookF className='hover:text-indigo-400 cursor-pointer text-2xl' />
            <FaTwitter className='hover:text-indigo-400 cursor-pointer text-2xl' />
            <FaInstagram className='hover:text-indigo-400 cursor-pointer text-2xl' />
            <FaLinkedinIn className='hover:text-indigo-400 cursor-pointer text-2xl' />
            <FaYoutube className='hover:text-indigo-400 cursor-pointer text-2xl' />
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className='text-2xl font-semibold mt-8 mb-5'>Về chúng tôi</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300'>
            <ul className='space-y-2 text-md'>
              <li>
                <a href='' className='hover:text-indigo-400'>
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href='' className='hover:text-indigo-400'>
                  Liên hệ
                </a>
              </li>
              <li>
                <a href='' className='hover:text-indigo-400'>
                  Trung tâm trợ giúp
                </a>
              </li>
            </ul>
            <ul className='space-y-2 text-md'>
              <li>
                <a href='' className='hover:text-indigo-400'>
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href='' className='hover:text-indigo-400'>
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className='border-t border-gray-700'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm'>
          <p>&copy; 2025 PhyGen. All rights reserved.</p>
          <p className='mt-2 sm:mt-0'>Development by Chill Group</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
