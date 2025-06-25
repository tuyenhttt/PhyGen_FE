import { useState, useEffect, useCallback, useRef } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import ChangePassword from '@/components/layouts/ChangePassword';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photoURL: 'https://via.placeholder.com/80',
    gender: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [isOAuthLogin, setIsOAuthLogin] = useState(false);
  const hasFetched = useRef(false);

  const fetchUserProfile = useCallback(async () => {
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;
    setLoading(true);
    try {
      const response = await getUserProfile();
      const userData = response.data;

      const formattedUserData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        photoURL: userData.photoURL || 'https://via.placeholder.com/80',
        gender: userData.gender || '',
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split('T')[0]
          : '',
      };
      setFormData(formattedUserData);
      setOriginalFormData(formattedUserData);

      const customUserCookie = Cookies.get('custom-user');
      if (customUserCookie) {
        const parsedUser = JSON.parse(customUserCookie);
        if (parsedUser.loginMethod === 'google') {
          setIsOAuthLogin(true);
        }
      }

      toast.success('Tải thông tin hồ sơ thành công!');
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ người dùng:', error);
      toast.error(
        error.response?.data?.message || 'Không thể tải thông tin hồ sơ.'
      );
      if (error.response?.status === 401) {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('custom-user');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoURL: imageUrl }));
    }
  };

  const handleEditSave = async () => {
    if (editMode) {
      //Validate DateOfBirth
      if (!formData.dateOfBirth || formData.dateOfBirth === '0000-12-31') {
        toast.error('Ngày sinh là bắt buộc.');
        return;
      }

      const selectedDate = new Date(formData.dateOfBirth);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (selectedDate > currentDate) {
        toast.error('Ngày sinh không được ở tương lai.');
        return;
      }
      //validate LastName FirstName
      if (!formData.firstName || !formData.lastName) {
        toast.error('Họ và tên không được để trống.');
        return;
      }

      //Call API
      setLoading(true);
      try {
        const dataToUpdate = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
          gender: formData.gender,
          photoURL: formData.photoURL,
          dateOfBirth: formData.dateOfBirth || '',
        };

        await updateUserProfile(dataToUpdate);
        toast.success('Cập nhật hồ sơ thành công!');
        setEditMode(false);
      } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        toast.error(
          error.response?.data?.message || 'Cập nhật hồ sơ thất bại.'
        );
      } finally {
        setLoading(false);
      }
    } else {
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (originalFormData) {
      setFormData(originalFormData);
    }
    toast.info('Đã hủy chỉnh sửa.');
  };

  const openChangePasswordPopup = () => {
    setShowChangePasswordPopup(true);
  };

  const closeChangePasswordPopup = () => {
    setShowChangePasswordPopup(false);
  };

  const handlePasswordChanged = () => {
    setShowChangePasswordPopup(false);
    toast.success('Mật khẩu đã được đổi thành công!');
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-100 mt-12'>
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-100 flex-col items-center py-8 mt-15'>
      {/* Hồ sơ người dùng */}

      <div className='bg-white rounded-2xl shadow-lg p-4 w-full max-w-5xl h-full max-h-full overflow-y-auto'>
        {/* Thông tin người dùng */}
        <div className='flex flex-col items-center text-center'>
          <img
            src={formData.photoURL}
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
              disabled
            />
          </div>
          <div>
            <TextInput
              id='phone'
              label='Số điện thoại'
              type='tel'
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
              className={`w-full px-3 py-2 mt-2 outline-1 -outline-offset-1 outline-gray-300 rounded-md focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 ${editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                }`}
            >
              <option value=''>Chọn giới tính</option>
              <option value='Nam'>Nam</option>
              <option value='Nữ'>Nữ</option>
              <option value='Khác'>Khác</option>
            </select>
          </div>
          <div className='md:col-span-1'>
            <label
              htmlFor='DateOfBirth'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Ngày sinh
            </label>
            <TextInput
              required
              type='date'
              id='dateOfBirth'
              name='dateOfBirth'
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>

          <div className='flex col-span-2 items-center justify-center text-center mb-2'>
            {!editMode ? (
              <>
                <PrimaryButton
                  onClick={handleEditSave}
                  className='bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 ml-16'
                >
                  Sửa
                </PrimaryButton>
                {!isOAuthLogin && (
                  <PrimaryButton
                    onClick={openChangePasswordPopup}
                    className='bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 ml-4'
                  >
                    Đổi mật khẩu
                  </PrimaryButton>
                )}
              </>
            ) : (
              <>
                <PrimaryButton
                  onClick={handleCancelEdit}
                  className='bg-gray-500 hover:bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300 mr-4'
                >
                  Hủy
                </PrimaryButton>
                <PrimaryButton
                  onClick={handleEditSave}
                  className='bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-300'
                >
                  Lưu
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </div>
      {showChangePasswordPopup && (
        <ChangePassword
          visible={showChangePasswordPopup}
          onClose={closeChangePasswordPopup}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
    </div>
  );
};

export default UserProfile;
