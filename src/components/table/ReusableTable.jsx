import { useEffect, useRef } from 'react';
import { FaEye, FaEdit, FaTrash, FaLock, FaLockOpen } from 'react-icons/fa';
import { FaArrowAltCircleUp } from 'react-icons/fa';

const ReusableTable = ({
  title,
  columns,
  data,
  actions = {},
  currentPage,
  totalPages,
  onPageChange,
  showActions = Object.keys(actions).length > 0,
  actionIcons = {},
  disableActions = {},
  headerRight,
  headerLeft,
  selectable = false,
  selectedKeys = [],
  onToggleRow,
  onToggleAll,
  getRowId = row => row.id,
}) => {
  const generatePaginationItems = (
    currentPage,
    totalPages,
    visiblePagesLimit = 5
  ) => {
    let pages = [];
    if (totalPages <= visiblePagesLimit) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPages = [1];
      const endPages = [totalPages];
      let middlePages = [];
      if (currentPage <= 3) middlePages = [2, 3, 4];
      else if (currentPage >= totalPages - 2)
        middlePages = [totalPages - 3, totalPages - 2, totalPages - 1];
      else middlePages = [currentPage - 1, currentPage, currentPage + 1];

      pages = [...startPages];
      if (middlePages[0] > startPages[startPages.length - 1] + 1)
        pages.push('...');
      pages = [...pages, ...middlePages];
      if (middlePages[middlePages.length - 1] < endPages[0] - 1)
        pages.push('...');
      pages = [...pages, ...endPages];
    }
    return pages;
  };

  const pageRowIds = selectable ? data.map(row => getRowId(row)) : [];
  const allSelected =
    selectable &&
    pageRowIds.length > 0 &&
    pageRowIds.every(id => selectedKeys.includes(id));
  const someSelected =
    selectable &&
    pageRowIds.some(id => selectedKeys.includes(id)) &&
    !allSelected;

  const headerCbRef = useRef(null);
  useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = someSelected;
  }, [someSelected, allSelected]);

  return (
    <div className='bg-white p-6 rounded-xl shadow-md'>
      {(title || headerRight || headerLeft) && (
        <div className='flex items-center justify-between mb-4 flex-wrap gap-2'>
          {headerLeft ? (
            <div>{headerLeft}</div>
          ) : (
            title && <h2 className='text-xl font-semibold'>{title}</h2>
          )}
          {headerRight}
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='w-full table-auto text-sm text-gray-700'>
          <thead>
            <tr className='bg-gray-100 text-left font-medium text-gray-600'>
              {/* NEW: cột checkbox ở đầu bảng */}
              {selectable && (
                <th className='p-3 w-10 text-center'>
                  <input
                    ref={headerCbRef}
                    type='checkbox'
                    checked={allSelected}
                    onChange={e => onToggleAll?.(e.target.checked, pageRowIds)}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={idx} className='p-3 whitespace-nowrap'>
                  {col.header}
                </th>
              ))}
              {showActions && <th className='p-3 text-center'>Thao tác</th>}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActions ? 1 : 0) +
                    (selectable ? 1 : 0)
                  }
                  className='text-center text-gray-600 py-6 italic'
                >
                  Không có kết quả phù hợp.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rid = selectable ? getRowId(row) : undefined;
                const rowChecked = selectable
                  ? selectedKeys.includes(rid)
                  : false;
                return (
                  <tr
                    key={rowIndex}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    {/* NEW: checkbox từng dòng */}
                    {selectable && (
                      <td className='p-3 w-10 text-center'>
                        <input
                          type='checkbox'
                          checked={rowChecked}
                          onChange={e => onToggleRow?.(rid, e.target.checked)}
                        />
                      </td>
                    )}

                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className='p-3 whitespace-nowrap'>
                        {col.render
                          ? col.render(row[col.accessor], row, rowIndex)
                          : row[col.accessor]}
                      </td>
                    ))}

                    {showActions && (
                      <td className='p-3 text-center'>
                        <div className='flex justify-center items-center gap-3'>
                          {Object.entries(actions).map(
                            ([actionKey, actionFn]) => {
                              const isDisabled =
                                disableActions?.[actionKey]?.(row);
                              const iconType =
                                typeof actionIcons?.[actionKey] === 'function'
                                  ? actionIcons[actionKey](row)
                                  : actionIcons?.[actionKey];

                              const Icon =
                                iconType === 'lock'
                                  ? FaLock
                                  : iconType === 'unlock'
                                  ? FaLockOpen
                                  : iconType === 'view'
                                  ? FaEye
                                  : iconType === 'approve'
                                  ? FaArrowAltCircleUp
                                  : iconType === 'edit'
                                  ? FaEdit
                                  : iconType === 'delete'
                                  ? FaTrash
                                  : null;

                              if (!Icon) return null;

                              const titleText = isDisabled
                                ? actionKey === 'edit'
                                  ? 'Bạn không có quyền chỉnh sửa câu hỏi này'
                                  : 'Bạn không thể thực hiện thao tác này'
                                : actionKey === 'edit'
                                ? 'Chỉnh sửa'
                                : actionKey === 'approve'
                                ? 'Duyệt câu hỏi'
                                : actionKey === 'view'
                                ? 'Xem chi tiết'
                                : actionKey === 'delete'
                                ? 'Xóa'
                                : actionKey;

                              return (
                                <button
                                  key={actionKey}
                                  onClick={() => !isDisabled && actionFn(row)}
                                  className={`text-xl ${
                                    isDisabled
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-500 hover:text-blue-600'
                                  }`}
                                  title={titleText}
                                  aria-label={titleText}
                                  disabled={isDisabled}
                                >
                                  <Icon />
                                </button>
                              );
                            }
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex justify-end mt-6 gap-2 flex-wrap'>
        <button
          className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>

        {generatePaginationItems(currentPage, totalPages).map((item, idx) =>
          item === '...' ? (
            <span key={idx} className='px-2 text-gray-500'>
              ...
            </span>
          ) : (
            <button
              key={idx}
              className={`px-4 py-1 border rounded-md text-sm ${
                currentPage === item
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}

        <button
          className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default ReusableTable;
