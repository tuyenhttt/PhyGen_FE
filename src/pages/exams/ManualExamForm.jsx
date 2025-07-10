import { useEffect, useState, forwardRef, useImperativeHandle, use } from 'react';
import Cookies from 'js-cookie';
import { getExamCategory } from '@/services/examService';
import { getAllMatrices } from '@/services/matrixService';

const ManualExamForm = forwardRef(({ }, ref) => {
    const [shuffleQuestions, setShuffleQuestions] = useState(null);
    const [examCategories, setExamCategories] = useState(null);
    const [selectedExamCategoriesId, setSelectedExamCategoriesId] = useState('');
    const [loadingExamCategories, setLoadingExamCategories] = useState(true);
    const [matrices, setMatrices] = useState(null);
    const [loadingMatrices, setLoadingMatrices] = useState(false);
    const [selectedMatrixId, setSelectedMatrixId] = useState('');
    const [selectedMatrix, setSelectedMatrix] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [year, setYear] = useState('');
    const [totalQuestions, setTotalQuestions] = useState('');
    const [numberOfExamPapers, setNumberOfExamPapers] = useState('');
    const userCookieId = Cookies.get('custom-user') ? JSON.parse(Cookies.get('custom-user')).id : '';

    useEffect(() => {
        const fetchExamCategories = async () => {
            setLoadingExamCategories(true);
            try {
                const response = await getExamCategory();
                if (response) {
                    setExamCategories(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu kỳ thi:", error);
                setExamCategories(null);
            } finally {
                setLoadingExamCategories(false);
            }
        };

        fetchExamCategories();
    }, []);

    useEffect(() => {
        const fetchMatrices = async () => {
            if (selectedExamCategoriesId || selectedGrade || year) {
                setLoadingMatrices(true);
                try {
                    const response = await getAllMatrices({ ExamCategoryId: selectedExamCategoriesId, Grade: selectedGrade, Year: year });
                    if (response && response.data) {
                        setMatrices(response.data);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải ma trận:", error);
                    setMatrices(null);
                } finally {
                    setLoadingMatrices(false);
                }
            } else {
                setMatrices(null);
            }
        };

        fetchMatrices();
    }, [selectedExamCategoriesId, selectedGrade, year]);

    useEffect(() => {
        if (selectedMatrix) {
            setSelectedExamCategoriesId(selectedMatrix.examCategoryId || '');
            setSelectedGrade(selectedMatrix.grade ? String(selectedMatrix.grade) : '');
            setYear(selectedMatrix.year ? String(selectedMatrix.year) : '');
            setTotalQuestions(selectedMatrix.totalQuestionCount ? String(selectedMatrix.totalQuestionCount) : '');
        } else {
            setSelectedExamCategoriesId('');
            setSelectedGrade('');
            setYear('');
            setTotalQuestions('');
        }
    }, [selectedMatrix]);

    const handleExamCategoriesChange = (event) => {
        setSelectedExamCategoriesId(event.target.value);
        setMatrices(null);
        setSelectedMatrixId('');
        setSelectedMatrix(null);
    };

    const handleGradeChange = (event) => {
        setSelectedGrade(event.target.value);
        setMatrices(null);
        setSelectedMatrixId('');
        setSelectedMatrix(null);
    }

    const handleYearChange = (event) => {
        setYear(event.target.value);
        setMatrices(null);
        setSelectedMatrixId('');
        setSelectedMatrix(null);
    }

    const handleShuffleChange = (event) => {
        setShuffleQuestions(event.target.value);
    };

    const handleMatrixChange = (event) => {
        const matrixId = event.target.value;
        setSelectedMatrixId(matrixId);
        if (matrixId) {
            const matrixFound = matrices?.data?.data.find(matrix => matrix.id === matrixId);
            setSelectedMatrix(matrixFound || null);
        } else {
            setSelectedMatrix(null);
        }
    };

    const getMatricesData = () => {
        return matrices?.data?.data || [];
    };

    const getExamCategoriesData = () => {
        return examCategories?.data || [];
    };

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return {
                examCategoryId: selectedExamCategoriesId,
                userId: userCookieId,
                title: title,
                description: description,
                grade: parseInt(selectedGrade) || 0,
                year: parseInt(year) || 0,
                totalQuestionCount: parseInt(totalQuestions) || 0,
                versionCount: shuffleQuestions === 'yes' ? (parseInt(numberOfExamPapers) || 1) : 1,
                randomizeQuestions: shuffleQuestions === 'yes' ? true : false,
            };
        }
    }));

    return (
        <div className='space-y-4'>
            <div>
                <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='title'
                >
                    Tiêu đề
                </label>
                <input
                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                    id='title'
                    name='title'
                    placeholder='Tiêu đề'
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div>
                <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='description'
                >
                    Mô tả
                </label>
                <textarea
                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                    id='description'
                    name='description'
                    placeholder='Mô tả đề thi'
                    rows='3'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                    <label
                        className='block text-sm font-medium text-gray-700 mb-1'
                        htmlFor='examCategories'
                    >
                        Kỳ thi
                    </label>
                    <select
                        className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        id='examCategories'
                        name='examCategories'
                        value={selectedExamCategoriesId}
                        onChange={handleExamCategoriesChange}
                    >
                        {loadingExamCategories ? (
                            <option value=''>Đang tải kỳ thi...</option>
                        ) : (
                            <>
                                <option value=''>Chọn kỳ thi</option>
                                {getExamCategoriesData().map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
                <div>
                    <label
                        className='block text-sm font-semibold text-gray-700 mb-1'
                        htmlFor='grade'
                    >
                        Khối
                    </label>
                    <select
                        className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        id='grade'
                        name='grade'
                        value={selectedGrade}
                        onChange={handleGradeChange}
                    >
                        <option value={''}>Chọn khối</option>
                        <option value={10}>Khối 10</option>
                        <option value={11}>Khối 11</option>
                        <option value={12}>Khối 12</option>
                    </select>
                </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                    <label
                        className='block text-sm font-medium text-gray-700 mb-1'
                        htmlFor='year'
                    >
                        Năm
                    </label>
                    <input
                        className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        id='year'
                        name='year'
                        placeholder='Nhập năm'
                        type='number'
                        min='1900'
                        max='2100'
                        value={year}
                        onChange={handleYearChange}
                    />
                </div>
                <div>
                    <label
                        className='block text-sm font-medium text-gray-700 mb-1'
                        htmlFor='totalQuestions'
                    >
                        Tổng số câu hỏi
                    </label>
                    <input
                        className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        id='totalQuestions'
                        name='totalQuestions'
                        placeholder='Nhập tổng số câu hỏi'
                        type='number'
                        min='1'
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label
                    className='block text-sm font-medium text-gray-700 mb-1'
                    htmlFor='matrix'
                >
                    Ma trận
                </label>
                <select
                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                    id='matrix'
                    name='matrix'
                    value={selectedMatrixId}
                    onChange={handleMatrixChange}
                    disabled={loadingMatrices || getMatricesData().length === 0}
                >
                    {loadingMatrices ? (
                        <option value=''>Đang tải ma trận...</option>
                    ) : getMatricesData().length > 0 ? (
                        <>
                            <option value=''>Chọn ma trận</option>
                            {getMatricesData().map((matrix) => (
                                <option key={matrix.id} value={matrix.id}>
                                    {matrix.name}
                                </option>
                            ))}
                        </>
                    ) : (
                        <option value=''>Không có ma trận nào cho kỳ thi này</option>
                    )}
                </select>
            </div>
            <div className='flex items-center space-x-4'>
                <span className='block text-xs font-medium text-gray-700'>
                    Xáo trộn ngẫu nhiên câu hỏi:
                </span>
                <div className='flex items-center'>
                    <input
                        type='radio'
                        id='shuffleQuestionsYes'
                        name='shuffleQuestions'
                        value='yes'
                        checked={shuffleQuestions === 'yes'}
                        onChange={handleShuffleChange}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                    />
                    <label htmlFor='shuffleQuestionsYes' className='ml-2 block text-sm text-gray-900'>
                        Có
                    </label>
                </div>
                <div className='flex items-center'>
                    <input
                        type='radio'
                        id='shuffleQuestionsNo'
                        name='shuffleQuestions'
                        value='no'
                        checked={shuffleQuestions === 'no'}
                        onChange={handleShuffleChange}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                    />
                    <label htmlFor='shuffleQuestionsNo' className='ml-2 block text-sm text-gray-900'>
                        Không
                    </label>
                </div>
            </div>

            {shuffleQuestions === 'yes' && (
                <div>
                    <label
                        className='block text-xs font-medium text-gray-700 mb-1'
                        htmlFor='numberOfExamPapers'
                    >
                        Số đề thi
                    </label>
                    <input
                        className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        id='numberOfExamPapers'
                        name='numberOfExamPapers'
                        placeholder='Nhập số đề thi muốn tạo'
                        type='number'
                        min='1'
                        value={numberOfExamPapers}
                        onChange={(e) => setNumberOfExamPapers(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
});

export default ManualExamForm;