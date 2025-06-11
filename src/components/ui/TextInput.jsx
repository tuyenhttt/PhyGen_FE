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
        className='block text-sm leading-6 font-medium text-gray-900'
      >
        {label}
      </label>
      <div className='mt-2'>
        <div className='mt-2 relative'>
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
            className={`block w-full rounded-md px-3 py-1 pr-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm leading-8
      ${
        disabled
          ? 'bg-gray-100 text-black cursor-not-allowed'
          : 'bg-white text-black '
      }
    `}
          />

          {showPasswordToggle && type === 'password' && (
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
              tabIndex={-1}
            >
              {showPassword ? (
                <IoEyeSharp size={18} />
              ) : (
                <FaEyeSlash size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextInput;
