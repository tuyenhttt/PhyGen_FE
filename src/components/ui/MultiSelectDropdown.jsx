import { useEffect, useRef } from 'react';

const MultiSelectDropdown = ({
  items = [],
  selectedValues = [],
  onToggle = () => {},
  className = '',
  maxHeight = 'max-h-64',
  emptyText = 'Không có dữ liệu',
  onClickOutside,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!onClickOutside) return;
    const handle = e => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClickOutside();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClickOutside]);

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-2 ${className} bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20`}
    >
      <div className={`${maxHeight} overflow-auto pr-1`}>
        {items.length === 0 ? (
          <div className='text-sm text-gray-500 p-2'>{emptyText}</div>
        ) : (
          items.map(opt => (
            <label
              key={opt.value}
              className='flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 cursor-pointer'
            >
              <input
                type='checkbox'
                className='rounded border-gray-300'
                checked={selectedValues.includes(opt.value)}
                onChange={() => onToggle(opt.value)}
              />
              <span className='text-sm text-gray-700'>{opt.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
