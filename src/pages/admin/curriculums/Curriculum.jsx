import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  getCurriculumFromContentFlow,
  postContentFlow,
  putContentFlow,
  deleteContentFlow,
} from '@/services/contentflowService';
import {
  getContentFlowFromContentItem,
  postContentItem,
  putContentItem,
  deleteContentItem,
} from '@/services/contentitemService';
import { getCurriculum } from '@/services/curriculumService';
import { getSubject } from '@/services/subjectService';
import GradeSection from '@/components/section/GradeSection';

const CurriculumDetail = () => {
  const [openContentFlows, setOpenContentFlows] = useState({});
  const [openContentItems, setOpenContentItems] = useState({});
  const [subjectId, setSubjectId] = useState('');
  const [contentFlows, setContentFlows] = useState([]);
  const [curriculumSections, setCurriculumSections] = useState([]);
  const [contentItemsByFlowId, setContentItemsByFlowId] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentEditingFlow, setCurrentEditingFlow] = useState(null);
  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [flowName, setFlowName] = useState('');
  const [grade, setGrade] = useState(null);
  const [curriculumId, setCurriculumId] = useState(null);
  const [flowDescription, setFlowDescription] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemLearningOutcome, setItemLearningOutcome] = useState('');
  const [currentItemFlowId, setCurrentItemFlowId] = useState(null);

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [flowToDelete, setFlowToDelete] = useState(null);
  const [deleteConfirmationType, setDeleteConfirmationType] = useState('');

  // New: confirm discard changes
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const fetchContentItemsForFlow = async contentFlowId => {
    if (
      !contentItemsByFlowId[contentFlowId] ||
      contentItemsByFlowId[contentFlowId].length === 0
    ) {
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

  // --- Helpers for unsaved-changes detection ---
  const hasUnsavedChanges = () => {
    if (!showModal) return false;
    if (modalType === 'addFlow') {
      return flowName.trim() !== '' || flowDescription.trim() !== '';
    }
    if (modalType === 'editFlow' && currentEditingFlow) {
      const initialDesc = currentEditingFlow.description || '';
      return (
        flowName !== currentEditingFlow.name || flowDescription !== initialDesc
      );
    }
    if (modalType === 'addItem') {
      return itemName.trim() !== '' || itemLearningOutcome.trim() !== '';
    }
    if (modalType === 'editItem' && currentEditingItem) {
      const initialOutcome = currentEditingItem.learningOutcome || '';
      return (
        itemName !== currentEditingItem.name ||
        itemLearningOutcome !== initialOutcome
      );
    }
    return false;
  };

  const handleAttemptCloseModal = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardModal(true);
      return;
    }
    setShowModal(false);
    resetModalStates();
  };

  const confirmDiscardChanges = () => {
    setShowDiscardModal(false);
    setShowModal(false);
    resetModalStates();
  };

  // --- Hàm xử lý cho Content Flow ---
  const handleAddContentFlowClick = (selectedGrade = null, currId = null) => {
    setModalType('addFlow');
    setFlowName('');
    setFlowDescription('');
    setGrade(selectedGrade);
    setCurriculumId(currId);
    setShowModal(true);
  };

  const handleEditContentFlowClick = contentFlow => {
    setModalType('editFlow');
    setCurrentEditingFlow(contentFlow);
    setFlowName(contentFlow.name);
    setGrade(contentFlow.grade);
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
          grade: grade,
        });
        if (response && response.data) {
          setContentFlows(prev => [...prev, response.data.data]);
          toast.success(`Đã thêm mạch nội dung "${flowName}".`);
        } else {
          toast.error('Không thể thêm mạch nội dung. Vui lòng thử lại.');
        }
      } else if (modalType === 'editFlow' && currentEditingFlow) {
        const response = await putContentFlow({
          contentFlowId: currentEditingFlow.id,
          curriculumId: currentEditingFlow.curriculumId,
          subjectId: currentEditingFlow.subjectId,
          name: flowName,
          description: flowDescription,
          orderNo: currentEditingFlow.orderNo,
          grade: currentEditingFlow.grade,
        });

        if (response && response.data) {
          setContentFlows(prev =>
            prev.map(flow =>
              flow.id === currentEditingFlow.id
                ? {
                    ...flow,
                    name: flowName,
                    description: flowDescription,
                    grade: grade,
                  }
                : flow
            )
          );
          toast.success(`Đã lưu thay đổi cho mạch nội dung "${flowName}".`);
        } else {
          toast.error(
            'Không thể lưu thay đổi mạch nội dung. Vui lòng thử lại.'
          );
        }
      }
      setShowModal(false);
      resetModalStates();
    } catch (error) {
      console.error(
        `Lỗi khi ${modalType === 'addFlow' ? 'thêm' : 'sửa'} mạch nội dung:`,
        error
      );
      if (modalType === 'addFlow') {
        toast.error('Thêm mạch nội dung thất bại. Vui lòng thử lại.');
      } else {
        toast.error('Lưu thay đổi mạch nội dung thất bại. Vui lòng thử lại.');
      }
    }
  };

  const requestDeleteContentFlow = flow => {
    setFlowToDelete(flow);
    setDeleteConfirmationType('flow');
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteContentFlow = async () => {
    if (flowToDelete) {
      try {
        await deleteContentFlow(flowToDelete.id);
        setContentFlows(prevFlows =>
          prevFlows.filter(flow => flow.id !== flowToDelete.id)
        );
        toast.success(`Đã xóa mạch nội dung "${flowToDelete.name}".`);
      } catch (error) {
        console.error('Lỗi khi xóa mạch nội dung:', error);
        toast.error('Xóa mạch nội dung thất bại. Vui lòng thử lại.');
      } finally {
        setShowConfirmDeleteModal(false);
        setFlowToDelete(null);
        setDeleteConfirmationType('');
      }
    }
  };

  // --- Hàm xử lý cho Content Item ---
  const handleAddContentItemClick = contentFlowId => {
    setModalType('addItem');
    setCurrentItemFlowId(contentFlowId);
    setItemName('');
    setItemLearningOutcome('');
    setShowModal(true);
  };

  const handleEditContentItemClick = contentItem => {
    setModalType('editItem');
    setCurrentEditingItem(contentItem);
    setItemName(contentItem.name);
    setItemLearningOutcome(contentItem.learningOutcome || '');
    setShowModal(true);
  };

  const handleSaveContentItem = async () => {
    try {
      if (modalType === 'addItem' && currentItemFlowId) {
        const orderNo =
          (contentItemsByFlowId[currentItemFlowId]?.length || 0) + 1;
        const response = await postContentItem({
          contentFlowId: currentItemFlowId,
          name: itemName,
          learningOutcome: itemLearningOutcome,
          orderNo: orderNo,
        });
        if (response && response.data) {
          setContentItemsByFlowId(prev => ({
            ...prev,
            [currentItemFlowId]: [
              ...(prev[currentItemFlowId] || []),
              response.data.data,
            ],
          }));
          toast.success(`Đã thêm nội dung "${itemName}".`);
        } else {
          toast.error('Không thể thêm nội dung. Vui lòng thử lại.');
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
            [currentEditingItem.contentFlowId]: prev[
              currentEditingItem.contentFlowId
            ].map(item =>
              item.id === currentEditingItem.id
                ? {
                    ...item,
                    name: itemName,
                    learningOutcome: itemLearningOutcome,
                  }
                : item
            ),
          }));
          toast.success(`Đã lưu thay đổi cho nội dung "${itemName}".`);
        } else {
          toast.error('Không thể lưu thay đổi nội dung. Vui lòng thử lại.');
        }
      }
      setShowModal(false);
      resetModalStates();
    } catch (error) {
      console.error(
        `Lỗi khi ${modalType === 'addItem' ? 'thêm' : 'sửa'} nội dung:`,
        error
      );
      if (modalType === 'addItem') {
        toast.error('Thêm nội dung thất bại. Vui lòng thử lại.');
      } else {
        toast.error('Lưu thay đổi nội dung thất bại. Vui lòng thử lại.');
      }
    }
  };

  const requestDeleteContentItem = (itemId, flowId) => {
    const name = contentItemsByFlowId[flowId]?.find(
      it => it.id === itemId
    )?.name;
    setItemToDelete({ id: itemId, contentFlowId: flowId, name });
    setDeleteConfirmationType('item');
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteContentItem = async () => {
    if (itemToDelete) {
      try {
        await deleteContentItem(itemToDelete.id);
        setContentItemsByFlowId(prev => ({
          ...prev,
          [itemToDelete.contentFlowId]: prev[itemToDelete.contentFlowId].filter(
            item => item.id !== itemToDelete.id
          ),
        }));
        toast.success(`Đã xóa nội dung "${itemToDelete.name || ''}".`);
      } catch (error) {
        console.error('Lỗi khi xóa nội dung:', error);
        toast.error('Xóa nội dung thất bại. Vui lòng thử lại.');
      } finally {
        setShowConfirmDeleteModal(false);
        setItemToDelete(null);
        setDeleteConfirmationType('');
      }
    }
  };

  // Reset modal states
  const resetModalStates = () => {
    setModalType('');
    setCurrentEditingFlow(null);
    setCurrentEditingItem(null);
    setFlowName('');
    setGrade(null);
    setFlowDescription('');
    setItemName('');
    setItemLearningOutcome('');
    setCurrentItemFlowId(null);
  };

  useEffect(() => {
    const fetchContentFlows = async () => {
      try {
        const curriculum = await getCurriculum();
        const curriculumData = curriculum.data.data.data;

        const subject = await getSubject();
        const physicSubjectId = subject.data.data[0].id;
        setSubjectId(physicSubjectId);
        const newCurriculumSections = [];

        for (const item of curriculumData) {
          const response = await getCurriculumFromContentFlow(
            item.id,
            physicSubjectId
          );

          if (response) {
            newCurriculumSections.push({
              title: `Khung chương trình Vật lý ${item.year}`,
              data: response.data.data,
              year: item.year,
            });
          } else {
            newCurriculumSections.push({
              title: `Khung chương trình Vật lý ${item.year}`,
              data: null,
              year: item.year,
            });
          }
        }
        setCurriculumSections(newCurriculumSections);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương trình học:', error);
        setCurriculumSections([]);
      }
    };

    fetchContentFlows();
  }, [handleSaveContentFlow]);

  return (
    <div>
      {curriculumSections.map((section, index) => (
        <div key={index} className='flex-1 p-6 bg-gray-100'>
          <div className='flex justify-between items-center mb-5'>
            <h2 className='text-2xl font-bold'>{section.title}</h2>
          </div>
          {section.data && section.data.length > 0 ? (
            <div key={section.title} className='space-y-6 max-w-4xl mx-auto'>
              {Object.entries(
                section.data.reduce((acc, flow) => {
                  const gradeKey = flow.grade || 'Không xác định';
                  if (!acc[gradeKey]) {
                    acc[gradeKey] = [];
                  }
                  acc[gradeKey].push(flow);
                  return acc;
                }, {})
              ).map(([grade, flowsInGrade]) => (
                <GradeSection
                  isAdmin={true}
                  key={grade}
                  grade={grade}
                  flowsInGrade={flowsInGrade}
                  openContentFlows={openContentFlows}
                  setOpenContentFlows={setOpenContentFlows}
                  contentItemsByFlowId={contentItemsByFlowId}
                  setContentItemsByFlowId={setContentItemsByFlowId}
                  fetchContentItemsForFlow={fetchContentItemsForFlow}
                  onAddContentItemModalOpen={handleAddContentItemClick}
                  onEditContentFlowModalOpen={handleEditContentFlowClick}
                  onRequestDeleteContentFlow={requestDeleteContentFlow}
                  openContentItems={openContentItems}
                  setOpenContentItems={setOpenContentItems}
                  onAddContentFlowModalOpenByGrade={handleAddContentFlowClick}
                  onEditContentItemModalOpen={handleEditContentItemClick}
                  onRequestDeleteContentItem={requestDeleteContentItem}
                />
              ))}
            </div>
          ) : (
            <p className='text-center text-gray-500'>
              Không có dữ liệu chương trình học để hiển thị.
            </p>
          )}
        </div>
      ))}

      {/* Add/Edit Modals */}
      <ConfirmModal
        visible={showModal}
        title={
          modalType === 'addFlow'
            ? 'Thêm mạch nội dung mới'
            : modalType === 'editFlow'
            ? 'Sửa mạch nội dung'
            : modalType === 'addItem'
            ? 'Thêm nội dung mới'
            : modalType === 'editItem'
            ? 'Sửa nội dung'
            : ''
        }
        onClose={handleAttemptCloseModal}
      >
        {(modalType === 'addFlow' || modalType === 'editFlow') && (
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='flowName'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Tên mạch chương trình:
              </label>
              <input
                type='text'
                id='flowName'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                value={flowName}
                onChange={e => setFlowName(e.target.value)}
                placeholder='Nhập tên mạch chương trình'
              />
            </div>
            <div>
              <label
                htmlFor='grade'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Khối:
              </label>
              <input
                type='text'
                id='grade'
                className='w-full p-2 border bg-gray-100 border-gray-300 rounded-md cursor-not-allowed focus:ring-blue-500 focus:border-blue-500'
                value={grade || ''}
                onChange={e => setGrade(e.target.value)}
                placeholder='Nhập khối'
                disabled
              />
            </div>
            <div>
              <label
                htmlFor='flowDescription'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Ghi chú:
              </label>
              <textarea
                id='flowDescription'
                className='w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500'
                rows='3'
                value={flowDescription}
                onChange={e => setFlowDescription(e.target.value)}
                placeholder='Nhập ghi chú (tùy chọn)'
              ></textarea>
            </div>
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={handleAttemptCloseModal}
                className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition'
              >
                Hủy
              </button>
              <button
                onClick={handleSaveContentFlow}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
              >
                {modalType === 'addFlow' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          </div>
        )}

        {(modalType === 'addItem' || modalType === 'editItem') && (
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='itemName'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Tên nội dung:
              </label>
              <input
                type='text'
                id='itemName'
                className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder='Nhập tên nội dung'
              />
            </div>
            <div>
              <label
                htmlFor='itemLearningOutcome'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Yêu cầu cần đạt:
              </label>
              <textarea
                id='itemLearningOutcome'
                className='w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500'
                rows='5'
                value={itemLearningOutcome}
                onChange={e => setItemLearningOutcome(e.target.value)}
                placeholder='Mục tiêu/kết quả học tập'
              ></textarea>
            </div>
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={handleAttemptCloseModal}
                className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition'
              >
                Hủy
              </button>
              <button
                onClick={handleSaveContentItem}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
              >
                {modalType === 'addItem' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Delete confirm modal */}
      <ConfirmModal
        visible={showConfirmDeleteModal}
        title={
          deleteConfirmationType === 'flow'
            ? 'Xác nhận xóa mạch nội dung'
            : 'Xác nhận xóa nội dung'
        }
        onClose={() => {
          setShowConfirmDeleteModal(false);
          setItemToDelete(null);
          setFlowToDelete(null);
          setDeleteConfirmationType('');
        }}
      >
        <p className=' text-gray-700 mb-6'>
          Bạn có chắc chắn muốn xóa{' '}
          <strong>
            {deleteConfirmationType === 'flow'
              ? `mạch nội dung "${flowToDelete?.name}"`
              : `nội dung "${
                  contentItemsByFlowId[itemToDelete?.contentFlowId]?.find(
                    item => item.id === itemToDelete?.id
                  )?.name || ''
                }"`}{' '}
          </strong>
          này không?
        </p>
        <div className='flex justify-end gap-2 mt-4'>
          <button
            onClick={() => {
              setShowConfirmDeleteModal(false);
              setItemToDelete(null);
              setFlowToDelete(null);
              setDeleteConfirmationType('');
            }}
            className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition'
          >
            Hủy
          </button>
          <button
            onClick={
              deleteConfirmationType === 'flow'
                ? confirmDeleteContentFlow
                : confirmDeleteContentItem
            }
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition'
          >
            Xóa
          </button>
        </div>
      </ConfirmModal>

      {/* Discard changes confirm modal */}
      <ConfirmModal
        visible={showDiscardModal}
        title='Bỏ các thay đổi chưa lưu?'
        onClose={() => setShowDiscardModal(false)}
      >
        <p className='text-gray-700 mb-6'>
          Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng và bỏ các thay đổi
          này?
        </p>
        <div className='flex justify-end gap-2 mt-4'>
          <button
            onClick={() => setShowDiscardModal(false)}
            className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition'
          >
            Tiếp tục chỉnh sửa
          </button>
          <button
            onClick={confirmDiscardChanges}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition'
          >
            Bỏ thay đổi
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default CurriculumDetail;
