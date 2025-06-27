import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEllipsisV } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  getCurriculumFromContentFlow,
  postContentFlow,
  putContentFlow,
  deleteContentFlow
} from '@/services/contentflowService';
import {
  getContentFlowFromContentItem,
  postContentItem,
  putContentItem,
  deleteContentItem
} from '@/services/contentitemService';

const CurriculumDetail = () => {
  const { curriculumId, grade } = useParams();
  const [openContentFlows, setOpenContentFlows] = useState({});
  const [openContentItems, setOpenContentItems] = useState({});
  const [subjectId, setSubjectId] = useState('')
  const [contentFlows, setContentFlows] = useState([]);
  const [pageTitle, setPageTitle] = useState('Đang tải...');
  const [contentItemsByFlowId, setContentItemsByFlowId] = useState({});
  const [openFlowMenuId, setOpenFlowMenuId] = useState(null);
  const [openItemMenuId, setOpenItemMenuId] = useState(null);
  const flowMenuRef = useRef();
  const itemMenuRef = useRef();
  const [editingContentItem, setEditingContentItem] = useState(null);
  const [editingLearningOutcome, setEditingLearningOutcome] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentEditingFlow, setCurrentEditingFlow] = useState(null);
  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemLearningOutcome, setItemLearningOutcome] = useState('');
  const [currentItemFlowId, setCurrentItemFlowId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flowMenuRef.current && !flowMenuRef.current.contains(event.target)) {
        setOpenFlowMenuId(null);
      }
      if (itemMenuRef.current && !itemMenuRef.current.contains(event.target)) {
        setOpenItemMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchContentFlows = async () => {
      if (curriculumId) {
        try {
          const response = await getCurriculumFromContentFlow(curriculumId);

          if (response) {
            const flows = response.data.data;
            const firstFlow = flows[0];
            setSubjectId(firstFlow.subjectId || '');
            setContentFlows(flows || []);
            setPageTitle(`Khung chương trình Vật lý ${grade}`);
          } else {
            setPageTitle('Không tìm thấy chương trình');
            setContentFlows([]);
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu chương trình học:", error);
          setPageTitle('Lỗi khi tải dữ liệu');
          setContentFlows([]);
        }
      } else {
        setPageTitle('Không có ID chương trình');
        setContentFlows([]);
      }
    };

    fetchContentFlows();
  }, [curriculumId]);

  const fetchContentItemsForFlow = async contentFlowId => {
    if (!contentItemsByFlowId[contentFlowId] || contentItemsByFlowId[contentFlowId].length === 0) {
      try {
        const response = await getContentFlowFromContentItem(contentFlowId);

        if (response) {
          const items = response.data.data;         
          setContentItemsByFlowId(prev => ({
            ...prev,
            [contentFlowId]: items || [],
          }));
        } else {
          setContentItemsByFlowId(prev => ({
            ...prev,
            [contentFlowId]: [],
          }));
        }
      } catch (error) {
        console.error(
          `Lỗi khi lấy dữ liệu nội dung (ContentItems) cho ContentFlow ID ${contentFlowId}:`,
          error
        );
        setContentItemsByFlowId(prev => ({
          ...prev,
          [contentFlowId]: [],
        }));
      }
    }
  };

  const toggleContentFlow = contentflowId => {
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

  const toggleContentItem = (contentflowId, contentitemId) => {
    setOpenContentItems(prev => ({
      ...prev,
      [`${contentflowId}-${contentitemId}`]:
        !prev[`${contentflowId}-${contentitemId}`],
    }));
  };

  // --- Hàm xử lý cho Content Flow ---
  const handleAddContentFlowClick = () => {
    setModalType('addFlow');
    setFlowName('');
    setFlowDescription('');
    setShowModal(true);
  };

  const handleEditContentFlowClick = (contentFlow) => {
    setOpenFlowMenuId(null);
    setModalType('editFlow');
    setCurrentEditingFlow(contentFlow);
    setFlowName(contentFlow.name);
    setFlowDescription(contentFlow.description || '');
    setShowModal(true);
  };

  const handleSaveContentFlow = async () => {
    try {
      if (modalType === 'addFlow') {
        const contentFlowOrder = contentFlows?.length + 1;
        const response = await postContentFlow({
          curriculumId: curriculumId,
          subjectId: subjectId,
          name: flowName,
          description: flowDescription,
          orderNo: contentFlowOrder,
        });
        if (response && response.data) {
          setContentFlows(prev => [...prev, response.data.data]);
          toast.success("Thêm mạch nội dung thành công!");
        } else {
          toast.error("Có lỗi xảy ra khi thêm mạch nội dung.");
        }
      } else if (modalType === 'editFlow' && currentEditingFlow) {     
        const response = await putContentFlow({
          contentFlowId: currentEditingFlow.id,
          curriculumId:currentEditingFlow.curriculumId,
          subjectId: currentEditingFlow.subjectId,
          name: flowName,
          description: flowDescription,
          orderNo: currentEditingFlow.orderNo
        });
        if (response && response.data) {
          setContentFlows(prev => prev.map(flow =>
            flow.id === currentEditingFlow.id ? { ...flow, name: flowName, description: flowDescription } : flow
          ));
          toast.success("Sửa mạch nội dung thành công!");
        } else {
          toast.error("Có lỗi xảy ra khi sửa mạch nội dung.");
        }
      }
      setShowModal(false);
      resetModalStates();
    } catch (error) {
      console.error(`Lỗi khi ${modalType === 'addFlow' ? 'thêm' : 'sửa'} mạch nội dung:`, error);
      toast.error(`Có lỗi xảy ra khi ${modalType === 'addFlow' ? 'thêm' : 'sửa'} mạch nội dung.`);
    }
  };

  const handleDeleteContentFlow = async (contentFlowId) => {
    setOpenFlowMenuId(null);
    if (window.confirm("Bạn có chắc chắn muốn xóa mạch nội dung này?")) {
      console.log("Xóa Content Flow ID:", contentFlowId);
      try {
        await deleteContentFlow(contentFlowId);
        setContentFlows(prevFlows => prevFlows.filter(flow => flow.id !== contentFlowId));
        toast.success("Xóa mạch nội dung thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa mạch nội dung:", error);
        toast.error("Có lỗi xảy ra khi xóa mạch nội dung.");
      }
    }
  };

  const toggleFlowMenu = (e, contentFlowId) => {
    e.stopPropagation();
    setOpenFlowMenuId(openFlowMenuId === contentFlowId ? null : contentFlowId);
    setOpenItemMenuId(null);
  };

  // --- Hàm xử lý cho Content Item ---
  const handleAddContentItemClick = (contentFlowId) => {
    setModalType('addItem');
    setCurrentItemFlowId(contentFlowId);
    setItemName('');
    setItemLearningOutcome('');
    setShowModal(true);
    setOpenFlowMenuId(null);
  };

  const handleEditContentItemClick = (contentItem) => {
    setOpenItemMenuId(null);
    setModalType('editItem');
    setCurrentEditingItem(contentItem);
    setItemName(contentItem.name);
    setItemLearningOutcome(contentItem.learningOutcome || '');
    setShowModal(true);
  };

  const handleSaveContentItem = async () => {
    try {
      if (modalType === 'addItem' && currentItemFlowId) {
        const orderNo = (contentItemsByFlowId[currentItemFlowId]?.length || 0) + 1;
        const response = await postContentItem({
          contentFlowId: currentItemFlowId,
          name: itemName,
          learningOutcome: itemLearningOutcome,
          orderNo: orderNo,
        });
        if (response && response.data) {
          setContentItemsByFlowId(prev => ({
            ...prev,
            [currentItemFlowId]: [...(prev[currentItemFlowId] || []), response.data.data]
          }));
          toast.success("Thêm nội dung học tập thành công!");
        } else {
          toast.error("Có lỗi xảy ra khi thêm nội dung học tập.");
        }
      } else if (modalType === 'editItem' && currentEditingItem) {
        const response = await putContentItem({
          contentItemId: currentEditingItem.id,
          name: itemName,
          learningOutcome: itemLearningOutcome,
          orderNo: currentEditingItem.orderNo,
          contentFlowId: currentEditingItem.contentFlowId,
        });
        if (response && response.data) {
          setContentItemsByFlowId(prev => ({
            ...prev,
            [currentEditingItem.contentFlowId]: prev[currentEditingItem.contentFlowId].map(item =>
              item.id === currentEditingItem.id ? { ...item, name: itemName, learningOutcome: itemLearningOutcome } : item
            )
          }));
          toast.success("Sửa nội dung học tập thành công!");
        } else {
          toast.error("Có lỗi xảy ra khi sửa nội dung học tập.");
        }
      }
      setShowModal(false);
      resetModalStates();
    } catch (error) {
      console.error(`Lỗi khi ${modalType === 'addItem' ? 'thêm' : 'sửa'} nội dung học tập:`, error);
      toast.error(`Có lỗi xảy ra khi ${modalType === 'addItem' ? 'thêm' : 'sửa'} nội dung học tập.`);
    }
  };

  const handleDeleteContentItem = async (contentItemId, contentFlowId) => {
    setOpenItemMenuId(null);
    if (window.confirm("Bạn có chắc chắn muốn xóa nội dung này?")) {
      console.log("Xóa Content Item ID:", contentItemId);
      try {
        await deleteContentItem(contentItemId);
        setContentItemsByFlowId(prev => ({
          ...prev,
          [contentFlowId]: prev[contentFlowId].filter(item => item.id !== contentItemId)
        }));
        toast.success("Xóa nội dung thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa nội dung:", error);
        toast.error("Có lỗi xảy ra khi xóa nội dung.");
      }
    }
  };

  const toggleItemMenu = (e, contentItemId) => {
    e.stopPropagation();
    setOpenItemMenuId(openItemMenuId === contentItemId ? null : contentItemId);
    setOpenFlowMenuId(null);
  };


  const handleCancelEditLearningOutcome = () => {
    setEditingContentItem(null);
    setEditingLearningOutcome('');
  };

  const handleSaveLearningOutcomeInline = async (contentItemId, contentFlowId) => {
    if (!editingContentItem || editingContentItem.id !== contentItemId) return;

    console.log("Lưu Learning Outcome cho Content Item ID:", contentItemId);
    try {
      const updatedItem = {
        ...editingContentItem,
        learningOutcome: editingLearningOutcome,
      };
      const response = await putContentItem({
        contentItemId: updatedItem.id,
        name: updatedItem.name,
        learningOutcome: updatedItem.learningOutcome,
        orderNo: updatedItem.orderNo,
        contentFlowId: updatedItem.contentFlowId,
      });

      if (response && response.data) {
        setContentItemsByFlowId(prev => ({
          ...prev,
          [contentFlowId]: prev[contentFlowId].map(item =>
            item.id === contentItemId ? { ...item, learningOutcome: editingLearningOutcome } : item
          )
        }));
        setEditingContentItem(null);
        setEditingLearningOutcome('');
        toast.success("Cập nhật nội dung học tập thành công!");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật nội dung học tập.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu Learning Outcome:", error);
      toast.error("Có lỗi xảy ra khi lưu nội dung học tập.");
    }
  };

  // Reset modal states
  const resetModalStates = () => {
    setModalType('');
    setCurrentEditingFlow(null);
    setCurrentEditingItem(null);
    setFlowName('');
    setFlowDescription('');
    setItemName('');
    setItemLearningOutcome('');
    setCurrentItemFlowId(null);
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
          {pageTitle}
        </h2>
        <button
          onClick={handleAddContentFlowClick}
          className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm mạch nội dung
        </button>
      </div>

      <div className='space-y-6 max-w-4xl mx-auto'>
        {contentFlows.length > 0 ? (
          contentFlows.map(contentflow => (
            <div
              key={contentflow.id}
              className='bg-white rounded-xl shadow-md border border-gray-200'
            >
              <div
                className='flex justify-between items-center p-5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition'
                onClick={() => toggleContentFlow(contentflow.id)}
              >
                <h3 className='text-lg  text-indigo-800 flex items-center gap-2'>
                  <span className='font-semibold'>{contentflow.name}:</span> <span className='font-normal italic'>{contentflow.description}</span>
                </h3>
                <div className="flex items-center gap-3 relative" ref={flowMenuRef}>
                  <button
                    onClick={(e) => toggleFlowMenu(e, contentflow.id)}
                    className='text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-200'
                    title="Tùy chọn"
                  >
                    <FaEllipsisV size={18} />
                  </button>

                  {/* Menu dropdown cho Content Flow */}
                  {openFlowMenuId === contentflow.id && (           
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 top-full">
                      <button
                        onClick={(e) => {e.stopPropagation(); handleAddContentItemClick(contentflow.id); }}
                        className='flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left'
                      >
                        <FaPlus size={14} /> Thêm nội dung
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditContentFlowClick(contentflow); }}
                        className='flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left'
                      >
                        <FaEdit size={16} /> Sửa mạch nội dung
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteContentFlow(contentflow.id); }}
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
                          <li
                            key={contentitem.id}
                            className='bg-white rounded-lg border border-gray-100 shadow-sm'
                          >
                            <div
                              className='flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition'
                              onClick={() =>
                                toggleContentItem(contentflow.id, contentitem.id)
                              }
                            >
                              <h4 className='text-base text-emerald-600 font-medium flex items-center gap-2'>
                                {contentitem.name}
                              </h4>
                              <div className="flex items-center gap-3 relative" ref={itemMenuRef}>
                                {/* Icon 3 chấm cho Content Item (màu xanh dương) */}
                                <button
                                  onClick={(e) => toggleItemMenu(e, contentitem.id)}
                                  className='text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-200'
                                  title="Tùy chọn"
                                >
                                  <FaEllipsisV size={16} />
                                </button>

                                {/* Menu dropdown cho Content Item */}
                                {openItemMenuId === contentitem.id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 top-full">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleEditContentItemClick(contentitem); }}
                                      className='flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left'
                                    >
                                      <FaEdit size={14} /> Sửa nội dung
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteContentItem(contentitem.id, contentflow.id); }}
                                      className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left'
                                    >
                                      <FaTrash size={14} /> Xóa nội dung
                                    </button>
                                  </div>
                                )}

                                <span className='text-gray-600 cursor-pointer' onClick={(e) => { e.stopPropagation(); toggleContentItem(contentflow.id, contentitem.id); }}>
                                  {openContentItems[`${contentflow.id}-${contentitem.id}`] ? (
                                    <FaChevronUp />
                                  ) : (
                                    <FaChevronDown />
                                  )}
                                </span>
                              </div>
                            </div>

                            {openContentItems[`${contentflow.id}-${contentitem.id}`] && (
                              <div className='px-4 py-3 bg-gray-50 text-gray-700 text-sm border-t border-gray-100 leading-relaxed'>
                                {editingContentItem && editingContentItem.id === contentitem.id ? (
                                  <div>
                                    <textarea
                                      className="w-full p-2 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows="5"
                                      value={editingLearningOutcome}
                                      onChange={(e) => setEditingLearningOutcome(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-2 mt-2">
                                      <button
                                        onClick={() => handleSaveLearningOutcomeInline(contentitem.id, contentflow.id)}
                                        className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 transition duration-200'
                                      >
                                        <FaSave size={14} /> Lưu
                                      </button>
                                      <button
                                        onClick={handleCancelEditLearningOutcome}
                                        className='bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 transition duration-200'
                                      >
                                        <FaTimes size={14} /> Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    dangerouslySetInnerHTML={{ __html: contentitem.learningOutcome ? contentitem.learningOutcome.replace(/\n/g, '<br />') : 'Chưa có nội dung học tập.' }}
                                  />
                                )}
                              </div>
                            )}
                          </li>
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
          ))
        ) : (
          <p className='text-center text-gray-500'>
            {pageTitle === 'Đang tải...'
              ? 'Đang tải dữ liệu chương trình học...'
              : 'Không có dữ liệu chương trình học để hiển thị.'}
          </p>
        )}
      </div>
      {/* ConfirmModal */}
      <ConfirmModal
        visible={showModal}
        title={
          modalType === 'addFlow' ? 'Thêm mạch nội dung mới' :
            modalType === 'editFlow' ? 'Sửa mạch nội dung' :
              modalType === 'addItem' ? 'Thêm nội dung học tập mới' :
                modalType === 'editItem' ? 'Sửa nội dung học tập' : ''
        }
        onClose={() => { setShowModal(false); resetModalStates(); }}
      >
        {(modalType === 'addFlow' || modalType === 'editFlow') && (
          <div className="space-y-4">
            <div>
              <label htmlFor="flowName" className="block text-sm font-medium text-gray-700 mb-1">Tên mạch chương trình:</label>
              <input
                type="text"
                id="flowName"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Nhập tên mạch chương trình"
              />
            </div>
            <div>
              <label htmlFor="flowDescription" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú:</label>
              <textarea
                id="flowDescription"
                className="w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowModal(false); resetModalStates(); }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveContentFlow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {modalType === 'addFlow' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          </div>
        )}

        {(modalType === 'addItem' || modalType === 'editItem') && (
          <div className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Tên nội dung:</label>
              <input
                type="text"
                id="itemName"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Nhập tên nội dung học tập"
              />
            </div>
            <div>
              <label htmlFor="itemLearningOutcome" className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu cần đạt:</label>
              <textarea
                id="itemLearningOutcome"
                className="w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500"
                rows="5"
                value={itemLearningOutcome}
                onChange={(e) => setItemLearningOutcome(e.target.value)}
                placeholder="Mục tiêu/kết quả học tập"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowModal(false); resetModalStates(); }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveContentItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {modalType === 'addItem' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default CurriculumDetail;
