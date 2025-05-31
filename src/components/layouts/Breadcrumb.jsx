import { Link, useLocation } from 'react-router-dom';

const formatSegment = segment => {
  const mappings = {
    matrix: 'Ma trận & Câu hỏi',
    'upload-question': 'Tải lên câu hỏi',
    'upload-matrix': 'Tải lên ma trận',
    quiz: 'Bài kiểm tra',
    'exam-paper': 'Đề thi',
  };

  return (
    mappings[segment] ||
    segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  );
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    ...pathnames.map((segment, index) => {
      const href = '/' + pathnames.slice(0, index + 1).join('/');
      return {
        label: formatSegment(segment),
        href,
      };
    }),
  ];

  const pageTitle = breadcrumbs[breadcrumbs.length - 1].label;

  return (
    <div className='bg-white px-4 sm:px-8 lg:px-16 pb-4'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold text-[#4A23E1] mb-2'>{pageTitle}</h1>
        <nav className='text-sm text-gray-500 flex items-center space-x-1'>
          {breadcrumbs.map((item, index) => (
            <span key={item.href} className='flex items-center space-x-1 mt-1'>
              {index !== 0 && <span className='text-gray-400'>{'>'}</span>}
              {index !== breadcrumbs.length - 1 ? (
                <Link to={item.href} className='hover:text-indigo-600'>
                  {item.label}
                </Link>
              ) : (
                <span className='text-[#4A23E1] font-semibold'>
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
