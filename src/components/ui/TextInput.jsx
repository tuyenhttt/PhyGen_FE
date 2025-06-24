import { useState } from 'react';
import { FaEyeSlash } from 'react-icons/fa';
import { IoEyeSharp } from 'react-icons/io5';

const TextInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete = '',
  placeholder = '',
  disabled = false,
  showPasswordToggle = false,
  error = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showPasswordToggle && type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type;

  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm leading-6 font-medium text-gray-900 mb-1'
      >
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          name={id}
          type={inputType}
          required={required}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full rounded-md px-3 py-2 pr-10 text-base text-gray-900 placeholder:text-gray-400 sm:text-sm leading-6
            outline-none border transition-all duration-150
            ${
              disabled
                ? 'bg-gray-100 text-black cursor-not-allowed'
                : 'bg-white text-black'
            }
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            }
          `}
        />

        {showPasswordToggle && type === 'password' && (
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none'
            tabIndex={-1}
          >
            {showPassword ? <IoEyeSharp size={18} /> : <FaEyeSlash size={18} />}
          </button>
        )}
      </div>

      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default TextInput;
