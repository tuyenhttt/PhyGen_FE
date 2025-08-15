const TabDropdown = ({
  label,
  valueLabel,
  open,
  setOpen,
  children,
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <button
      type='button'
      onClick={() => setOpen(o => !o)}
      className='px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm shadow-sm flex items-center gap-2'
    >
      <span className='font-medium'>{label}:</span>
      <span className='text-gray-700'>{valueLabel || 'Tất cả'}</span>
      <svg width='16' height='16' viewBox='0 0 20 20' className='opacity-70'>
        <path d='M5 7l5 6 5-6' fill='currentColor' />
      </svg>
    </button>

    {open && (
      <div className='absolute z-50 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2'>
        {children}
      </div>
    )}
  </div>
);

export default TabDropdown;
