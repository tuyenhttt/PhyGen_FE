import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
    const navigate = useNavigate();
        const data = [
        { questionId: 'ch001', content: 'Nội dung câu hỏi', type: 'Trắc nghiệm', level: 'VD', image: 'Hình ảnh', topic:'Bài 1', topicId:'b-1', answer1:'A', answer2:'B', answer3:'C', answer4:'D', answer5:'E', answer6:'F', correctAnswer:'A', createdBy: 'Admin', createdAt: '2024-05-01' },
        { questionId: 'ch002', content: 'Nội dung câu hỏi', type: 'Tự luận', level: 'NB', image: 'Hình ảnh', topic:'Bài 2', topicId:'b-2', answer1:'', answer2:'', answer3:'', answer4:'', answer5:'', answer6:'', correctAnswer:'', createdBy: 'Admin', createdAt: '2024-05-15' },
        { questionId: 'ch003', content: 'Nội dung câu hỏi', type: 'Trắc nghiệm', level: 'VDC', image: 'Hình ảnh', topic:'Bài 3', topicId:'b-3', answer1:'A', answer2:'B', answer3:'C', answer4:'D', answer5:'E', answer6:'F', correctAnswer:'C', createdBy: 'GV A', createdAt: '2024-06-01' },
        { questionId: 'ch004', content: 'Nội dung câu hỏi', type: 'Tự luận', level: 'NB', image: 'Hình ảnh', topic:'Bài 4', topicId:'b-4', answer1:'', answer2:'', answer3:'', answer4:'', answer5:'', answer6:'', correctAnswer:'', createdBy: 'GV B', createdAt: '2024-06-10' },
    ];

    const columns = [
        { header: 'Mã câu hỏi', accessor: 'questionId' },
        { header: 'Nội dung', accessor: 'content' },
        { header: 'Loại', accessor: 'type' },
        { header: 'Cấp độ', accessor: 'level' },
        { header: 'Hình ảnh', accessor: 'image' },
        { header: 'Bài', accessor: 'topic' },
        { header: 'Mã Bài', accessor: 'topicId' },
        { header: 'Đáp án 1', accessor: 'answer1' },
        { header: 'Đáp án 2', accessor: 'answer2' },
        { header: 'Đáp án 3', accessor: 'answer3' },
        { header: 'Đáp án 4', accessor: 'answer4' },
        { header: 'Đáp án 5', accessor: 'answer5' },
        { header: 'Đáp án 6', accessor: 'answer6' },
        { header: 'Đáp án đúng', accessor: 'correctAnswer' },
        { header: 'Ngày tạo', accessor: 'createdAt' },
        { header: 'Ngày tạo', accessor: 'createdAt' },
    ];

        const handleView = row => {
        navigate(`/admin/books/grade10/${row.id}`);
    };

    const handleEdit = row => {
        alert(`Sửa: ${row.name}`);
    };

    const handleDelete = row => {
        alert(`Xoá: ${row.name}`);
    };
    

    return (
        <div className='p-4 space-y-6 '>
            <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
                Danh sách câu hỏi
            </h2>
            {/* Table */}
            <div>
                <ReusableTable
                    columns={columns}
                    data={data}
                    currentPage={1}
                    totalPages={3}
                    onPageChange={page => console.log('Go to page:', page)}
                    actions={{
                        view: handleView,
                        edit: handleEdit,
                        delete: handleDelete,
                    }}
                />
            </div>
        </div>
    );
}

export default Questions;