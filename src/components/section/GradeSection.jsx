import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import ContentFlowCard from '../cards/ContentFlowCard';

const GradeSection = ({
    grade,
    flowsInGrade,
    openContentFlows,
    setOpenContentFlows,
    contentItemsByFlowId,
    setContentItemsByFlowId,
    fetchContentItemsForFlow,
    onAddContentItemModalOpen,
    onEditContentFlowModalOpen,
    onDeleteContentFlowSuccess,
    openContentItems,
    setOpenContentItems,
    onAddContentFlowModalOpenByGrade,
    onEditContentItemModalOpen
}) => {
    const [isGradeOpen, setIsGradeOpen] = useState(false);

    const toggleGrade = () => {
        setIsGradeOpen(prev => !prev);
    };

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 cursor-pointer" onClick={toggleGrade}>
                <h3 className="text-xl font-bold text-gray-900">
                    Vật lý Lớp {grade}
                </h3>
                <div className='flex gap-4'>
                    <button
                        onClick={() => onAddContentFlowModalOpenByGrade(grade)}
                        className='bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 transition duration-200'
                        title={`Thêm mạch nội dung cho lớp ${grade}`}
                    >
                        <FaPlus size={14} /> Thêm mạch nội dung
                    </button>
                    <button
                        className="text-gray-600 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-200"
                        aria-expanded={isGradeOpen}
                    >
                        {isGradeOpen ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {isGradeOpen && (
                <div className="space-y-6">
                    {flowsInGrade.map(contentflow => (
                        <ContentFlowCard
                            key={contentflow.id}
                            contentflow={contentflow}
                            openContentFlows={openContentFlows}
                            setOpenContentFlows={setOpenContentFlows}
                            contentItemsByFlowId={contentItemsByFlowId}
                            setContentItemsByFlowId={setContentItemsByFlowId}
                            fetchContentItemsForFlow={fetchContentItemsForFlow}
                            onAddContentItemModalOpen={onAddContentItemModalOpen}
                            onEditContentFlowModalOpen={onEditContentFlowModalOpen}
                            onDeleteContentFlowSuccess={onDeleteContentFlowSuccess}
                            openContentItems={openContentItems}
                            setOpenContentItems={setOpenContentItems}
                            onEditContentItemModalOpen={onEditContentItemModalOpen}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GradeSection;