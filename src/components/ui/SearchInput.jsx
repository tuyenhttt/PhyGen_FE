import { FiSearch } from 'react-icons/fi';

const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...' }) => {
  return (
    <div className='relative w-[200px] sm:w-[240px] md:w-[280px]'>
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
      />
      <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none' />
    </div>
  );
};

export default SearchInput;
