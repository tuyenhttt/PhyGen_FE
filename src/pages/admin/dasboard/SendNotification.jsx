import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [loadingUsers, setLoadingUsers] = useState(false);

  const inputRef = useRef(null);

  const fetchAllUsersAllPages = async () => {
    const all = [];
    let pageIndex = 1;

    while (true) {
      const res = await getAllUserProfile(pageIndex, 10, { Role: 'User' });
      const chunk =
        (res && res.data && (res.data.data || res.data.items)) || [];

      all.push(...chunk);

      if (!Array.isArray(chunk) || chunk.length === 0) break;

      pageIndex += 1;

      if (pageIndex > 500) break;
    }

    return all;
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingUsers(true);
        const all = await fetchAllUsersAllPages();
        setUsers(all);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        toast.error('Không tải được danh sách người dùng');
      } finally {
        setLoadingUsers(false);
      }
    };
    run();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    let valid = true;

    if (!title.trim()) {
      setTitleError('Vui lòng nhập tiêu đề');
      valid = false;
    } else setTitleError('');

    if (!content.trim()) {
      setContentError('Vui lòng nhập nội dung');
      valid = false;
    } else setContentError('');

    if (!valid) return;

    try {
      await sendNotification({
        userId: selectedUserId || null,
        title,
        content,
      });
      toast.success('Gửi thông báo thành công!');
      setContent('');
      setTitle('');
      setSelectedUserId('');
      setSearchTerm('');
      setShowDropdown(false);
    } catch (err) {
      toast.error('Gửi thất bại!');
      console.error(err);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => {
      const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`
        .trim()
        .toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [users, searchTerm]);

  const handleSelect = user => {
    if (user === null) {
      setSelectedUserId('');
      setSearchTerm('');
    } else {
      setSelectedUserId(user.id);
      setSearchTerm(
        `${user.firstName ?? ''} ${user.lastName ?? ''}${
          user.email ? ` (${user.email})` : ''
        }`.trim()
      );
    }
    setShowDropdown(false);
    inputRef.current?.blur();
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
            ref={inputRef}
            type='text'
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder='Nhập tên hoặc email người dùng...'
            className='w-full border rounded-md p-2 text-sm border-gray-300'
          />

          {showDropdown && (
            <ul className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border border-gray-200 text-sm'>
              <li
                onMouseDown={() => handleSelect(null)}
                className='px-4 py-2 hover:bg-indigo-100 cursor-pointer text-gray-700'
              >
                Gửi cho tất cả
              </li>

              {loadingUsers && (
                <li className='px-4 py-2 text-gray-500'>
                  Đang tải người dùng...
                </li>
              )}

              {!loadingUsers &&
                filteredUsers.map(user => (
                  <li
                    key={user.id}
                    onMouseDown={() => handleSelect(user)}
                    className='px-4 py-2 hover:bg-indigo-100 cursor-pointer flex items-center gap-2'
                  >
                    <div>
                      <p className='text-gray-800 font-medium'>
                        {`${user.firstName ?? ''} ${
                          user.lastName ?? ''
                        }`.trim() || '(Không tên)'}
                      </p>
                      <p className='text-gray-800'>
                        {user.email ?? '(Không có email)'}
                      </p>
                    </div>
                  </li>
                ))}

              {!loadingUsers && filteredUsers.length === 0 && (
                <li className='px-4 py-2 text-gray-500'>
                  Không tìm thấy người dùng
                </li>
              )}
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
