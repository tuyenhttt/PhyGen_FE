import { useState, useEffect } from 'react';
import { getCurriculumFromContentFlow } from '@/services/contentflowService';
import { getContentFlowFromContentItem } from '@/services/contentitemService';
import { getCurriculum } from '@/services/curriculumService';
import { getSubject } from '@/services/subjectService';
import GradeSection from '@/components/section/GradeSection';
import Breadcrumb from '@/components/layouts/Breadcrumb';

const Curriculum = () => {
  const [openContentFlows, setOpenContentFlows] = useState({});
  const [openContentItems, setOpenContentItems] = useState({});
  const [contentItemsByFlowId, setContentItemsByFlowId] = useState({});
  const [curriculumSections, setCurriculumSections] = useState([]);

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

  useEffect(() => {
    const fetchContentFlows = async () => {
      try {
        const curriculum = await getCurriculum();
        const curriculumData = curriculum.data.data.data;

        const subject = await getSubject();
        const physicSubjectId = subject.data.data[0].id;
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
  }, []);

  return (
    <div className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      {curriculumSections.map((section, index) => (
        <div key={index} className='flex-1 bg-gray-100'>
          <Breadcrumb />
          <div className='mb-5'>
            <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-10 ml-5'>
              {section.title}
            </h2>
          </div>
          {section.data && section.data.length > 0 ? (
            <div className='space-y-6 max-w-4xl mx-auto'>
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
                  isAdmin={false}
                  key={grade}
                  grade={grade}
                  flowsInGrade={flowsInGrade}
                  openContentFlows={openContentFlows}
                  setOpenContentFlows={setOpenContentFlows}
                  contentItemsByFlowId={contentItemsByFlowId}
                  setContentItemsByFlowId={setContentItemsByFlowId}
                  fetchContentItemsForFlow={fetchContentItemsForFlow}
                  openContentItems={openContentItems}
                  setOpenContentItems={setOpenContentItems}
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
    </div>
  );
};

export default Curriculum;
