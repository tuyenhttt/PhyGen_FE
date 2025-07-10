import React, { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';

const ExamPaperPreview = ({ examData, onBack }) => {
    if (!examData) {
        return <div className="text-center text-gray-500">Không có dữ liệu đề thi để hiển thị.</div>;
    }

    const dummyMatrixSections = [
        { id: '1', name: 'Trắc nghiệm khách quan', type: 'multiple_choice' },
        { id: '2', name: 'Tự luận', type: 'essay' },
    ];

    console.log('examData', examData);

    return (
        <div className='bg-white p-6 rounded-lg shadow-md space-y-6'>
            {/* Khung thông tin đề thi */}
            <div className="border border-gray-300 p-4 rounded-md grid grid-cols-2 gap-4">
                {/* Khung bên trái */}
                <div className="col-span-1 border-r border-gray-200 pr-4 space-y-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SỞ GIÁO DỤC VÀ ĐÀO TẠO</label>
                        <input
                            type="text"
                            className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1"
                            placeholder="Nhập tên Sở GDĐT"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">TRƯỜNG THPT</label>
                        <input
                            type="text"
                            className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1"
                            placeholder="Nhập tên Trường THPT"
                        />
                    </div>
                </div>

                {/* Khung bên phải */}
                <div className="col-span-1 pl-4 space-y-2">
                    <p className="text-md font-bold text-gray-800">
                        {examData.data.title || 'Tiêu đề đề thi'}
                    </p>
                    <p className="text-md text-gray-700">
                        Môn: Vật lí - Khối: {examData.data.grade || '__'}
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thời gian làm bài</label>
                        <input
                            type="text"
                            className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1"
                            placeholder="Ví dụ: 45 phút"
                        />
                    </div>
                    <p className="text-md text-gray-700">
                        Mã đề: {examData.id ? examData.id.substring(0, 6).toUpperCase() : '______'}
                    </p>
                </div>
            </div>

            <hr className="my-4" />

            <h3 className='text-xl font-bold text-indigo-700 text-center mb-4'>Cấu trúc đề thi</h3>

            {/* Placeholder cho các phần câu hỏi dựa trên ma trận */}
            {dummyMatrixSections.map(section => (
                <div key={section.id} className="border border-gray-200 p-4 rounded-md mt-4">
                    <h4 className='text-lg font-semibold text-gray-800 mb-2'>
                        {section.name} ({section.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'})
                    </h4>
                    <p className="text-gray-600 mb-3">
                        Số lượng câu hỏi dự kiến: (sẽ hiển thị sau từ Matrix Section Detail)
                    </p>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                        <span className="text-gray-700">Chưa có câu hỏi nào được chọn.</span>
                        <PrimaryButton className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => alert(`Mở popup chọn câu hỏi cho phần ${section.name}`)}>
                            Chọn câu hỏi
                        </PrimaryButton>
                    </div>
                    {/* Nơi hiển thị các câu hỏi đã chọn (sẽ phát triển sau) */}
                    <ul className="mt-2 space-y-1">
                        {/* <li>Câu 1: Nội dung câu hỏi...</li> */}
                    </ul>
                </div>
            ))}

            <div className="flex justify-between mt-6">
                <PrimaryButton
                    className='bg-gray-500 hover:bg-gray-600 text-white'
                    onClick={onBack}
                >
                    Quay lại
                </PrimaryButton>
                <PrimaryButton
                    className='bg-blue-500 hover:bg-blue-600 text-white'
                    onClick={() => alert('In đề thi')}
                >
                    In đề thi
                </PrimaryButton>
                <PrimaryButton
                    className='bg-green-500 hover:bg-green-600 text-white'
                    onClick={() => alert('Tải xuống đề thi')}
                >
                    Tải xuống
                </PrimaryButton>
            </div>
        </div>
    );
};

export default ExamPaperPreview;