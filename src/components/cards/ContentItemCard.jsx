import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { deleteContentItem } from '@/services/contentitemService';

const ContentItemCard = ({
    contentitem,
    contentFlowId,
    openContentItems,
    setOpenContentItems,
    setContentItemsByFlowId,
    onEditContentItemModalOpen
}) => {
    const [openItemMenuId, setOpenItemMenuId] = useState(null);
    const itemMenuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (itemMenuRef.current && !itemMenuRef.current.contains(event.target)) {
                setOpenItemMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleContentItem = (flowId, itemId) => {
        setOpenContentItems(prev => ({
            ...prev,
            [`${flowId}-${itemId}`]: !prev[`${flowId}-${itemId}`],
        }));
    };

    const toggleItemMenu = (e, itemId) => {
        e.stopPropagation();
        setOpenItemMenuId(openItemMenuId === itemId ? null : itemId);
    };

    const handleEditContentItemClick = (item) => {
        setOpenItemMenuId(null);
        onEditContentItemModalOpen(item);
    };


    const handleDeleteContentItem = async (itemId, flowId) => {
        setOpenItemMenuId(null);
        if (window.confirm("Bạn có chắc chắn muốn xóa nội dung này?")) {
            try {
                await deleteContentItem(itemId);
                setContentItemsByFlowId(prev => ({
                    ...prev,
                    [flowId]: prev[flowId].filter(item => item.id !== itemId)
                }));
                toast.success("Xóa nội dung thành công!");
            } catch (error) {
                console.error("Lỗi khi xóa nội dung:", error);
                toast.error("Có lỗi xảy ra khi xóa nội dung.");
            }
        }
    };

    return (
        <li className='bg-white rounded-lg border border-gray-100 shadow-sm'>
            <div
                className='flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition'
                onClick={() => toggleContentItem(contentFlowId, contentitem.id)}
            >
                <h4 className='text-base text-emerald-600 font-medium flex items-center gap-2'>
                    {contentitem.name}
                </h4>
                <div className="flex items-center gap-3 relative" ref={itemMenuRef}>
                    <button
                        onClick={(e) => toggleItemMenu(e, contentitem.id)}
                        className='text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-200'
                        title="Tùy chọn"
                    >
                        <FaEllipsisV size={16} />
                    </button>

                    {openItemMenuId === contentitem.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 top-full">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditContentItemClick(contentitem); }}
                                className='flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left'
                            >
                                <FaEdit size={14} /> Sửa nội dung
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteContentItem(contentitem.id, contentFlowId); }}
                                className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left'
                            >
                                <FaTrash size={14} /> Xóa nội dung
                            </button>
                        </div>
                    )}

                    <span className='text-gray-600 cursor-pointer' onClick={(e) => { e.stopPropagation(); toggleContentItem(contentFlowId, contentitem.id); }}>
                        {openContentItems[`${contentFlowId}-${contentitem.id}`] ? (
                            <FaChevronUp />
                        ) : (
                            <FaChevronDown />
                        )}
                    </span>
                </div>
            </div>

            {openContentItems[`${contentFlowId}-${contentitem.id}`] && (
                <div className='px-4 py-3 bg-gray-50 text-gray-700 text-sm border-t border-gray-100 leading-relaxed'>
                    <div
                        dangerouslySetInnerHTML={{ __html: contentitem.learningOutcome ? contentitem.learningOutcome.replace(/\n/g, '<br />') : 'Chưa có nội dung học tập.' }}
                    />
                </div>
            )}
        </li>
    );
};

export default ContentItemCard;