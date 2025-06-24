import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';
import TextInput from '@/components/ui/TextInput';
import { getAllUserProfile } from '@/services/userService';
import { sendNotification } from '@/services/notificationService';

const SendNotification = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUserProfile();
        const filtered =
          res.data?.data?.filter(user => user.role === 'User') || [];
        setUsers(filtered);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    let valid = true;

    if (!title.trim()) {
      setTitleError('Vui lòng nhập tiêu đề');
      valid = false;
    } else {
      setTitleError('');
    }

    if (!content.trim()) {
      setContentError('Vui lòng nhập nội dung');
      valid = false;
    } else {
      setContentError('');
    }

    if (!valid) return;

    try {
      await sendNotification({
        userId: selectedUserId || null,
        title,
        content,
      });
      toast.success('Gửi thông báo thành công!');
      navigate('/admin');
    } catch (err) {
      toast.error('Gửi thất bại!');
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  const handleSelect = user => {
    setSearchTerm(`${user.firstName} ${user.lastName} (${user.email})`);
    setSelectedUserId(user.id);
    setShowDropdown(false);
  };

  const handleInputChange = e => {
    setSearchTerm(e.target.value);
    setSelectedUserId('');
    setShowDropdown(true);
  };

  return (
    <div className='max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-10'>
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => window.history.back()}
          className='p-2 cursor-pointer'
          title='Quay lại'
        >
          <IoArrowBack size={24} className='text-gray-700' />
        </button>
        <h2 className='text-xl font-semibold text-gray-800'>
          Gửi thông báo cho người dùng
        </h2>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <TextInput
          id='title'
          label='Tiêu đề'
          value={title}
          placeholder='Vui lòng nhập tiêu đề cho email'
          onChange={e => {
            setTitle(e.target.value);
            setTitleError('');
          }}
          error={titleError}
        />

        <div className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Người nhận (để trống nếu muốn gửi cho tất cả)
          </label>
          <input
            type='text'
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder='Nhập email người dùng...'
            className='w-full border rounded-md p-2 text-sm border-gray-300'
          />
          {showDropdown && filteredUsers.length > 0 && (
            <ul className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border border-gray-200 text-sm'>
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className='px-4 py-2 hover:bg-indigo-100 cursor-pointer flex items-center gap-2'
                >
                  <div>
                    <p className='text-gray-800 font-medium'>
                      {`${user.firstName} ${user.lastName}`}
                    </p>
                    <p className='text-gray-800'>{user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label
            htmlFor='content'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Nội dung
          </label>
          <textarea
            id='content'
            value={content}
            onChange={e => {
              setContent(e.target.value);
              setContentError('');
            }}
            className={`w-full border rounded-md p-2 text-sm ${
              contentError ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder='Vui lòng nhập nội dung cho email'
          />
          {contentError && (
            <p className='text-sm text-red-600 mt-1'>{contentError}</p>
          )}
        </div>

        <div className='text-right'>
          <button
            type='submit'
            className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm'
          >
            Gửi thông báo
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendNotification;
