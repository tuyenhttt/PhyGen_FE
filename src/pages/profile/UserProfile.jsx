import { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';

const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: 'alexarawles@gmail.com',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: 'https://via.placeholder.com/80',
    gender: '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = () => {
    setEditMode(!editMode);
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-100 flex flex-col items-center py-10 mt-12'>
      {/* Hồ sơ người dùng */}
      {/* <UserSidebar name={formData.firstName}/> */}
      {/* <div className='py-10 w-full'> */}
      <div className='bg-white rounded-2xl shadow-lg p-4 w-full max-w-5xl h-full max-h-full overflow-y-auto'>
        {/* Thông tin người dùng */}
        <div className='flex flex-col items-center text-center'>
          <img
            src={formData.avatar}
            alt='Avatar'
            className='w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md object-cover mb-4 hover:scale-105 transition-transform duration-300'
          />
          <div className='h-8 mb-2'>
            {editMode ? (
              <>
                <label
                  htmlFor='avatarInput'
                  className='rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2  cursor-pointer text-sm'
                >
                  Chọn ảnh đại diện
                </label>
                <input
                  type='file'
                  id='avatarInput'
                  name='avatar'
                  accept='image/*'
                  className='hidden'
                  onChange={handleAvatarChange}
                />
              </>
            ) : (
              <div className='invisible h-full'>placeholder</div>
            )}
          </div>
        </div>

        {/* Biểu mẫu */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <TextInput
              id='lastName'
              label='Họ'
              type='text'
              required
              placeholder='Họ'
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>
          <div>
            <TextInput
              id='firstName'
              label='Tên'
              type='text'
              required
              placeholder='Tên'
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>
          <div>
            <TextInput
              id='email'
              label='Email'
              type='email'
              required
              autoComplete='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>
          <div>
            <TextInput
              id='phone'
              label='Số điện thoại'
              type='tel'
              required
              placeholder='Số điện thoại'
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>
          <div className='md:col-span-1'>
            <label
              htmlFor='gender'
              className='block text-sm font-medium text-gray-700'
            >
              Giới tính
            </label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!editMode}
              className={`w-full px-3 py-2 mt-2 outline-1 -outline-offset-1 outline-gray-300 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 ${
                editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
              }`}
            >
              <option value=''>Chọn giới tính</option>
              <option value='male'>Nam</option>
              <option value='female'>Nữ</option>
              <option value='other'>Khác</option>
            </select>
          </div>
          <div className='md:col-span-1'>
            <label
              htmlFor='dob'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Ngày sinh
            </label>
            <TextInput type='date' id='dob' name='dob' disabled={!editMode} />
          </div>

          <div>
            <TextInput
              id='password'
              label='Mật khẩu'
              type='password'
              required
              placeholder='Mật khẩu'
              value={formData.password}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>
          {editMode && (
            <div>
              <TextInput
                id='confirmPassword'
                label='Xác nhận mật khẩu'
                type='password'
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder='Xác nhận mật khẩu'
              />
            </div>
          )}
          <div className='flex flex-col col-span-2 items-center text-center mb-2'>
            <PrimaryButton
              onClick={handleEditSave}
              className='bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300'
            >
              {editMode ? 'Lưu' : 'Sửa'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default UserProfile;
