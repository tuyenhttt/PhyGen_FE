import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getCurriculumFromContentFlow } from '@/services/contentflowService';
import { getContentFlowFromContentItem } from '@/services/contentitemService';

const CurriculumDetail = () => {
  const { curriculumId, grade } = useParams();
  const [openContentFlows, setOpenContentFlows] = useState({});
  const [openContentItems, setOpenContentItems] = useState({});
  const [contentFlows, setContentFlows] = useState([]);
  const [pageTitle, setPageTitle] = useState('Đang tải...');
  const [contentItemsByFlowId, setContentItemsByFlowId] = useState({});

  useEffect(() => {
    const fetchContentFlows = async () => {
      if (curriculumId) {
        try {
          const response = await getCurriculumFromContentFlow(curriculumId);

          if (response) {
            setPageTitle(`Khung chương trình Vật lý ${grade}`);
            setContentFlows(response.data.data || []);
          } else {
            setPageTitle('Không tìm thấy khung chương trình');
            setContentFlows([]);
          }
        } catch (error) {
          console.error(
            'Lỗi khi lấy dữ liệu mạch nội dung (ContentFlows):',
            error
          );
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
    if (!contentItemsByFlowId[contentFlowId]) {
      try {
        const response = await getContentFlowFromContentItem(contentFlowId);

        if (response) {
          setContentItemsByFlowId(prev => ({
            ...prev,
            [contentFlowId]: response.data.data || [],
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

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        {pageTitle}
      </h2>

      <div className='space-y-6 max-w-4xl mx-auto'>
        {contentFlows.length > 0 ? (
          contentFlows.map(contentflow => (
            <div
              key={contentflow.id}
              className='bg-white rounded-xl shadow-md overflow-hidden border border-gray-200'
            >
              <div
                className='flex justify-between items-center p-5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition'
                onClick={() => toggleContentFlow(contentflow.id)}
              >
                <h3 className='text-lg font-semibold text-indigo-800 flex items-center gap-2'>
                  {contentflow.name}
                </h3>
                <span className='text-indigo-700'>
                  {openContentFlows[contentflow.id] ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </span>
              </div>
              {openContentFlows[contentflow.id] && (
                <div className='px-5 pb-5 pt-2 border-t border-indigo-100'>
                  <ul className='space-y-3'>
                    {contentItemsByFlowId[contentflow.id] ? (
                      contentItemsByFlowId[contentflow.id].length > 0 ? (
                        contentItemsByFlowId[contentflow.id].map(lesson => (
                          <li
                            key={lesson.id}
                            className='bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden'
                          >
                            <div
                              className='flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition'
                              onClick={() =>
                                toggleContentItem(contentflow.id, lesson.id)
                              }
                            >
                              <h4 className='text-base text-emerald-600 font-medium flex items-center gap-2'>
                                {lesson.name}
                              </h4>
                              <span className='text-gray-600'>
                                {openContentItems[
                                  `${contentflow.id}-${lesson.id}`
                                ] ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </span>
                            </div>

                            {openContentItems[
                              `${contentflow.id}-${lesson.id}`
                            ] && (
                              <div className='px-4 py-3 bg-gray-50 text-gray-700 text-sm border-t border-gray-100 leading-relaxed'>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: lesson.learningOutcome.replace(
                                      /\n/g,
                                      '<br />'
                                    ),
                                  }}
                                />
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className='text-gray-600 text-sm'>
                          Chưa có nội dung nào trong mạch nội dung này.
                        </li>
                      )
                    ) : (
                      <p className='p-6 text-gray-600'>Đang tải nội dung...</p>
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
    </div>
  );
};

export default CurriculumDetail;
