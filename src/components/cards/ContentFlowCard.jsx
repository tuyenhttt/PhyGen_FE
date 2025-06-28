import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import ContentItemCard from './ContentItemCard';

const ContentFlowCard = ({
  contentflow,
  openContentFlows,
  setOpenContentFlows,
  contentItemsByFlowId,
  setContentItemsByFlowId,
  fetchContentItemsForFlow,
  onAddContentItemModalOpen,
  onEditContentFlowModalOpen,
  onRequestDeleteContentFlow,
  openContentItems,
  setOpenContentItems,
  onEditContentItemModalOpen,
  onRequestDeleteContentItem,
}) => {
  const [openFlowMenuId, setOpenFlowMenuId] = useState(null);
  const flowMenuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flowMenuRef.current && !flowMenuRef.current.contains(event.target)) {
        setOpenFlowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const toggleContentFlow = (contentflowId) => {
    setOpenContentFlows(prev => {
      const isOpen = !prev[contentflowId];
      if (isOpen) {
        fetchContentItemsForFlow(contentflowId);
      }
      return {
        ...prev,
        [contentflowId]: isOpen,
      };
    });
  };

  const toggleFlowMenu = (e, contentFlowId) => {
    e.stopPropagation();
    setOpenFlowMenuId(openFlowMenuId === contentFlowId ? null : contentFlowId);
  };

  const handleDeleteContentFlow = async (contentFlowId) => {
    setOpenFlowMenuId(null);
    onRequestDeleteContentFlow(contentFlowId);
  };

  return (
    <div className='bg-white rounded-xl shadow-md border border-gray-200'>
      <div
        className='flex justify-between items-center p-5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition'
        onClick={() => toggleContentFlow(contentflow.id)}
      >
        <h3 className='text-lg  text-indigo-800 flex items-center gap-2'>
          <span className='font-semibold'>{contentflow.name}</span> <span className='font-normal italic'>{contentflow.description}</span>
        </h3>
        <div className="flex items-center gap-3 relative" ref={flowMenuRef}>
          <button
            onClick={(e) => toggleFlowMenu(e, contentflow.id)}
            className='text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-200'
            title="Tùy chọn"
          >
            <FaEllipsisV size={18} />
          </button>

          {openFlowMenuId === contentflow.id && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 top-full">
              <button
                onClick={(e) => { e.stopPropagation(); onAddContentItemModalOpen(contentflow.id); }}
                className='flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left'
              >
                <FaPlus size={14} /> Thêm nội dung
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEditContentFlowModalOpen(contentflow); }}
                className='flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left'
              >
                <FaEdit size={16} /> Sửa mạch nội dung
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteContentFlow(contentflow); }}
                className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left'
              >
                <FaTrash size={16} /> Xóa mạch nội dung
              </button>
            </div>
          )}

          <span className='text-indigo-700 cursor-pointer' onClick={(e) => { e.stopPropagation(); toggleContentFlow(contentflow.id); }}>
            {openContentFlows[contentflow.id] ? (
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}
          </span>
        </div>
      </div>

      {openContentFlows[contentflow.id] && (
        <div className='px-5 pb-5 pt-2 border-t border-indigo-100'>
          <ul className='space-y-3'>
            {contentItemsByFlowId[contentflow.id] ? (
              contentItemsByFlowId[contentflow.id].length > 0 ? (
                contentItemsByFlowId[contentflow.id].map(contentitem => (
                  <ContentItemCard
                    key={contentitem.id}
                    contentitem={contentitem}
                    contentFlowId={contentflow.id}
                    openContentItems={openContentItems}
                    setOpenContentItems={setOpenContentItems}
                    setContentItemsByFlowId={setContentItemsByFlowId}
                    onEditContentItemModalOpen={onEditContentItemModalOpen}
                    onRequestDeleteContentItem={onRequestDeleteContentItem}
                  />
                ))
              ) : (
                <li className="text-gray-600 text-sm p-4 text-center">
                  Chưa có nội dung nào trong mạch nội dung này.
                </li>
              )
            ) : (
              <li className="text-gray-600 text-sm p-4 text-center">Đang tải nội dung...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContentFlowCard;