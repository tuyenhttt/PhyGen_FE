const FilterBox = ({
  title = '',
  options = [],
  selectedOptions = [],
  onChange,
}) => {
  return (
    <div className='bg-white rounded-xl shadow p-4 w-full'>
      <h3 className='text-lg font-bold text-blue-900 mb-2'>{title}</h3>
      <div className='h-1 w-6 bg-blue-500 rounded mb-4' />

      <div className='space-y-2'>
        {options.map(option => (
          <label
            key={option.value}
            className='flex items-center space-x-2 cursor-pointer'
          >
            <input
              type='checkbox'
              value={option.value}
              checked={selectedOptions.includes(option.value)}
              onChange={() => onChange(option.value)}
              className='form-checkbox text-blue-600 rounded border-gray-300 focus:ring-blue-500'
            />
            <span className='text-gray-700'>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterBox;
