const DEFAULT_ITEMS = [
  { label: 'Tất cả', val: '' },
  { label: '10', val: '10' },
  { label: '11', val: '11' },
  { label: '12', val: '12' },
];

export default function GradeTabs({
  value,
  onChange,
  items = DEFAULT_ITEMS,
  className = '',
}) {
  return (
    <div
      role='tablist'
      aria-label='Chọn lớp'
      className={`inline-flex rounded-2xl bg-gray-50 p-1 ${className}`}
    >
      {items.map(it => {
        const active = value === it.val;
        return (
          <button
            key={it.val || 'all'}
            role='tab'
            aria-selected={active}
            onClick={() => onChange?.(it.val)}
            className={
              'px-3 py-1.5 rounded-xl w-[70px] text-[14px] transition ' +
              (active
                ? 'bg-blue-600 shadow-sm text-white '
                : 'text-gray-700 hover:bg-gray-300')
            }
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
