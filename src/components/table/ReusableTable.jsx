import { FaEye, FaEdit, FaTrash, FaLock, FaLockOpen } from 'react-icons/fa';

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
}) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md'>
      {(title || headerRight) && (
        <div className='flex items-center justify-between mb-4 flex-wrap gap-2'>
          {title && <h2 className='text-xl font-semibold'>{title}</h2>}
          {headerRight}
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='w-full table-auto text-sm text-gray-700'>
          <thead>
            <tr className='bg-gray-100 text-left font-medium text-gray-600'>
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
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className='text-center text-gray-600 py-6 italic'
                >
                  Không có kết quả phù hợp.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className='hover:bg-gray-50 transition-colors'
                >
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
                                : iconType === 'edit'
                                ? FaEdit
                                : iconType === 'delete'
                                ? FaTrash
                                : null;

                            if (!Icon) return null;

                            return (
                              <button
                                key={actionKey}
                                onClick={() => !isDisabled && actionFn(row)}
                                className={`text-xl ${
                                  isDisabled
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-blue-600'
                                }`}
                                title={actionKey}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex justify-end mt-6 gap-2'>
        <button
          className='px-4 py-2 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-4 py-1 border rounded-md text-sm ${
              currentPage === i + 1
                ? 'bg-orange-500 text-white font-semibold'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
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
