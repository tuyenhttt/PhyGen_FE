import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';

const CreateExamPaper = () => {
    return (
        <>
            {/* Breadcrumb */}
            <section className='bg-gray-50 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
                <Breadcrumb />
                {/* Form Section */}
                <div className='max-w-3xl mx-auto px-6 sm:px-12'>
                    <div className='text-center max-w-md mx-auto mb-8'>
                        <div className='text-blue-400 mb-3 text-4xl leading-none'>
                            <i className='fas fa-graduation-cap'></i>
                        </div>
                        <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
                            Tạo Đề Thi
                        </h2>
                    </div>
                    <form className='space-y-4'>
                        <div>
                            <label
                                className='block text-xs font-medium text-gray-700 mb-1'
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
                            />
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                                <label
                                    className='block text-xs font-medium text-gray-700 mb-1'
                                    htmlFor='exam'
                                >
                                    Kỳ thi
                                </label>
                                <select
                                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                                    id='exam'
                                    name='exam'
                                >
                                    <option>Chọn kỳ thi</option>
                                    <option>Giữa kỳ</option>
                                    <option>Cuối kỳ</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    className='block text-xs font-medium text-gray-700 mb-1'
                                    htmlFor='quantity'
                                >
                                    Số lượng đề
                                </label>
                                <input
                                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                                    id='quantity'
                                    name='quantity'
                                    placeholder='Nhập số lượng đề'
                                    type='text'
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                className='block text-xs font-medium text-gray-700 mb-1'
                                htmlFor='matrix'
                            >
                                Ma trận
                            </label>
                            <select
                                className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                                id='matrix'
                                name='matrix'
                            >
                                <option>Chọn ma trận</option>
                                <option>Ma trận 1</option>
                                <option>Ma trận 2</option>
                                <option>Ma trận 3</option>
                            </select>
                        </div>
                        <PrimaryButton
                            className='w-full bg-blue-900 text-white text-sm font-semibold py-2 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600'
                            type='submit'
                        >
                            Tạo
                        </PrimaryButton>
                    </form>
                    <div className='mt-6 flex justify-end text-blue-400 text-3xl'>
                        <i className='fas fa-globe-americas'></i>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CreateExamPaper;
