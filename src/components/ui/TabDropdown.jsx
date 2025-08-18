import { useEffect, useRef } from 'react';

const TabDropdown = ({
  label,
  valueLabel,
  open,
  setOpen,
  children,
  className = '',
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = e => {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = e => {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm shadow-sm flex items-center gap-2'
        aria-haspopup='menu'
        aria-expanded={open}
      >
        <span className='font-medium'>{label}:</span>
        <span className='text-gray-700'>{valueLabel || 'Tất cả'}</span>
        <svg width='16' height='16' viewBox='0 0 20 20' className='opacity-70'>
          <path d='M5 7l5 6 5-6' fill='currentColor' />
        </svg>
      </button>

      {open && (
        <div
          role='menu'
          tabIndex={-1}
          className='absolute z-50 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2'
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default TabDropdown;
