const TextInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete = '',
  placeholder = '',
  disabled = false
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm leading-6 font-medium text-gray-900'
      >
        {label}
      </label>
      <div className='mt-2'>
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full rounded-md px-3 py-1 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm leading-8
            ${disabled
              ? 'bg-gray-100 text-black cursor-not-allowed'
              : 'bg-white text-black '
            }
            `}
        />
      </div>
    </div>
  );
};

export default TextInput;
