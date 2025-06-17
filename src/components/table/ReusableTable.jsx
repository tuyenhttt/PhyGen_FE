import { FaEye, FaEdit, FaTrash, FaLock } from 'react-icons/fa';

const ReusableTable = ({
  title,
  columns,
  data,
  actions,
  currentPage,
  totalPages,
  onPageChange,
  showCheckbox = true,
  showActions = true,
  actionIcons = {},
  disableActions = {},
  headerRight,
}) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-md'>
      {/* {title && (
        <h2 className='text-xl font-bold text-gray-800 mb-6'>{title}</h2>
      )} */}
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
              {showCheckbox && (
                <th className='p-3'>
                  <input type='checkbox' />
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
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className='hover:bg-gray-50 transition-colors'>
                {showCheckbox && (
                  <td className='p-3'>
                    <input type='checkbox' />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className='p-3 whitespace-nowrap'>
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : row[col.accessor]}
                  </td>
                ))}
                {showActions && (
                  <td className='p-3 text-center'>
                    <div className='flex justify-center items-center gap-3'>
                      {actions?.view && (
                        <button
                          onClick={() => actions.view(row)}
                          className='text-gray-500 hover:text-blue-600 text-xl'
                        >
                          <FaEye />
                        </button>
                      )}
                      {actions?.edit && (
                        <button
                          onClick={() => actions.edit(row)}
                          className='text-gray-500 hover:text-orange-500 text-xl'
                        >
                          <FaEdit />
                        </button>
                      )}
                      {actions?.delete && (
                        <button
                          onClick={() => {
                            if (!disableActions?.delete?.(row))
                              actions.delete(row);
                          }}
                          className={`text-xl ${
                            disableActions?.delete?.(row)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                          title={
                            actionIcons.delete === 'lock'
                              ? 'Khoá tài khoản'
                              : 'Xoá'
                          }
                          disabled={disableActions?.delete?.(row)}
                        >
                          {actionIcons.delete === 'lock' ? (
                            <FaLock />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
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
