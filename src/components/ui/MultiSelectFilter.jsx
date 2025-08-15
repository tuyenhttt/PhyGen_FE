// src/components/filters/MultiSelectFilter.jsx
import { useEffect, useRef, useState } from 'react';
import FilterButton from '@/components/ui/FilterButton';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';

export default function MultiSelectFilter({
  label,
  icon,
  options = [], // [{ label, value }]
  selectedValues = [], // ['2024', '2025'] ...
  onChange, // setState(prev => next)
  width = 'w-64', // dropdown width: 'w-64' | 'w-40'...
  buttonClassName = '',
  color = {
    light: 'text-blue-700',
    soft: 'bg-blue-100 text-blue-800',
    border: 'border-blue-800',
  },
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Đóng khi click ra ngoài toàn vùng (button + dropdown)
  useEffect(() => {
    const handler = e => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleValue = val => {
    if (!onChange) return;
    onChange((prev = []) =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  return (
    <div className='relative' ref={wrapRef}>
      <FilterButton
        label={label}
        count={selectedValues?.length || 0}
        isOpen={open}
        onClick={() => setOpen(o => !o)}
        icon={icon}
        className={buttonClassName}
        color={color}
      />
      {open && (
        <MultiSelectDropdown
          items={options}
          selectedValues={selectedValues || []}
          onToggle={toggleValue}
          className={width}
          onClickOutside={() => setOpen(false)}
        />
      )}
    </div>
  );
}
