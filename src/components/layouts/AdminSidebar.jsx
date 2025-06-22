import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GoChecklist } from 'react-icons/go';
import { PiExam } from 'react-icons/pi';
import { LuBookOpenText } from 'react-icons/lu';
import { BiGroup } from 'react-icons/bi';
import { SlWallet } from 'react-icons/sl';
import { AiOutlineProduct, AiOutlineUnorderedList } from 'react-icons/ai';

const menuItems = [
  {
    label: 'Thống kê',
    icon: <AiOutlineProduct size={22} />,
    path: '/admin',
  },
  {
    label: 'Kỳ thi',
    icon: <PiExam size={22} />,
    children: [
      {
        label: 'Danh mục kỳ thi',
        path: '/admin/exams-categories',
      },
    ],
  },
  {
    label: 'Đề thi',
    icon: <GoChecklist size={22} />,
    children: [
      {
        label: 'Đề thi',
        path: '/admin/exams-category/exams',
      },
      {
        label: 'Ma trận đề thi',
        path: '/admin/exams-category/matrices',
      },
      {
        label: 'Câu hỏi',
        path: '/admin/exams-category/questions',
      },
    ],
  },
  {
    label: 'Sách',
    icon: <LuBookOpenText size={22} />,
    children: [
      { label: 'Bộ sách', path: '/admin/subject-book' },
      { label: 'Lớp 10', path: '/admin/subject-book/grade10' },
      { label: 'Lớp 11', path: '/admin/subject-book/grade11' },
      { label: 'Lớp 12', path: '/admin/subject-book/grade12' },
    ],
  },
  {
    label: 'Khung chương trình',
    icon: <AiOutlineUnorderedList size={24} />,
    children: [
      { label: 'Khung chương trình 10', path: '/admin/curriculums/grade10' },
      { label: 'Khung chương trình 11', path: '/admin/curriculums/grade11' },
      { label: 'Khung chương trình 12', path: '/admin/curriculums/grade12' },
    ],
  },
  {
    label: 'Người dùng',
    icon: <BiGroup size={28} />,
    path: '/admin/users',
  },
  {
    label: 'Giao dịch',
    icon: <SlWallet size={22} />,
    path: '/admin/invoice-list',
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = label => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavigate = path => {
    if (path && location.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = path => location.pathname === path;

  return (
    <aside className='w-64 fixed top-0 left-0 z-50 bg-[#1E293B] text-white shadow-lg h-screen flex flex-col'>
      <div className='flex justify-center items-center py-5 shrink-0'>
        <h1 className='text-2xl font-semibold tracking-wide'>PHYGEN</h1>
      </div>

      <nav className='flex-1 mt-2 px-3 pb-6 overflow-y-auto scrollbar-none'>
        <ul className='space-y-2'>
          {menuItems.map(item => (
            <li key={item.label}>
              <div
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition ${
                  item.path && isActive(item.path)
                    ? 'bg-[#334155] text-white'
                    : 'hover:bg-[#334155] text-gray-300'
                }`}
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.label);
                  } else {
                    handleNavigate(item.path);
                  }
                }}
              >
                <div className='flex items-center gap-3 overflow-hidden whitespace-nowrap'>
                  <span className='text-gray-400'>{item.icon}</span>
                  <span className='text-sm font-medium truncate'>
                    {item.label}
                  </span>
                </div>
                {item.children && (
                  <span className='text-xs'>
                    {openMenus[item.label] ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                )}
              </div>

              {item.children && openMenus[item.label] && (
                <ul className='ml-8 mt-1 space-y-1'>
                  {item.children.map(child => (
                    <li
                      key={child.label}
                      className={`text-sm cursor-pointer transition truncate px-2 py-1 rounded mb-2 ${
                        isActive(child.path)
                          ? 'bg-[#475569] text-white font-medium'
                          : 'text-gray-300 hover:text-white hover:bg-[#334155]'
                      }`}
                      onClick={() => handleNavigate(child.path)}
                    >
                      {child.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
