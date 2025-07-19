import { useState, useEffect, useCallback, useRef } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import ChangePassword from '@/components/layouts/ChangePassword';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { supabase } from '@/supabase/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { CameraIcon } from '@heroicons/react/24/outline';

const AdminProfile = () => {
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
  const { user, setUser } = useAuth();

  const fetchUserProfile = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    try {
      const response = await getUserProfile();
      const userData = response.data;
      const formatted = {
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
      setFormData(formatted);
      setOriginalFormData(formatted);

      const cookie = Cookies.get('custom-user');
      if (cookie && JSON.parse(cookie).loginMethod === 'google') {
        setIsOAuthLogin(true);
      }

      toast.success('Tải thông tin hồ sơ thành công!');
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ:', err);
      toast.error(err.response?.data?.message || 'Không thể tải hồ sơ.');
      if (err.response?.status === 401) {
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
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) return toast.error('Tải ảnh thất bại.');

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setFormData(prev => ({ ...prev, photoURL: data.publicUrl }));
    setUser(prev => ({ ...prev, photoURL: data.publicUrl }));
    Cookies.set(
      'custom-user',
      JSON.stringify({ ...user, photoURL: data.publicUrl })
    );
    toast.success('Cập nhật ảnh đại diện thành công!');
  };

  const handleEditSave = async () => {
    if (!editMode) return setEditMode(true);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return toast.error('Họ và tên không được để trống.');
    }
    if (!formData.dateOfBirth) {
      return toast.error('Ngày sinh là bắt buộc.');
    }
    if (new Date(formData.dateOfBirth) > new Date().setHours(0, 0, 0, 0)) {
      return toast.error('Ngày sinh không được ở tương lai.');
    }

    setLoading(true);
    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        gender: formData.gender,
        photoURL: formData.photoURL,
        dateOfBirth: formData.dateOfBirth,
      });
      toast.success('Cập nhật hồ sơ thành công!');
      setOriginalFormData(formData);
      setEditMode(false);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      toast.error(err.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalFormData);
    setEditMode(false);
    toast.info('Đã hủy chỉnh sửa.');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <p className='text-gray-600'>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className='flex justify-center py-5 bg-gray-100'>
      <div className='w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg'>
        <div className='flex flex-col md:flex-row items-center md:items-start'>
          <div className='relative mb-6 md:mb-0 md:mr-8'>
            <img
              src={formData.photoURL}
              alt='Avatar'
              className='w-32 h-32 rounded-full border-4 border-indigo-500 object-cover'
            />
            {editMode && (
              <label
                htmlFor='avatarInput'
                className='absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-full cursor-pointer shadow-lg'
              >
                <CameraIcon className='w-6 h-6 text-white' />
                <input
                  type='file'
                  id='avatarInput'
                  className='hidden'
                  onChange={handleAvatarChange}
                  accept='image/*'
                />
              </label>
            )}
          </div>
          <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <TextInput
              label='Họ'
              name='lastName'
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
            <TextInput
              label='Tên'
              name='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
            <TextInput
              label='Email'
              name='email'
              value={formData.email}
              disabled
            />
            <TextInput
              label='Số điện thoại'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editMode}
            />
            <div className='sm:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Giới tính
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${
                  !editMode && 'bg-gray-100 cursor-not-allowed'
                }`}
              >
                <option value=''>Chọn giới tính</option>
                <option value='Nam'>Nam</option>
                <option value='Nữ'>Nữ</option>
                <option value='Khác'>Khác</option>
              </select>
            </div>
            <div className='sm:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Ngày sinh
              </label>
              <TextInput
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
          </div>
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          {editMode ? (
            <>
              <PrimaryButton
                onClick={handleCancelEdit}
                className='bg-gray-500 hover:bg-gray-400 text-white'
              >
                Hủy
              </PrimaryButton>
              <PrimaryButton onClick={handleEditSave}>Lưu</PrimaryButton>
            </>
          ) : (
            <>
              <PrimaryButton onClick={handleEditSave}>Sửa hồ sơ</PrimaryButton>
              {!isOAuthLogin && (
                <PrimaryButton onClick={() => setShowChangePasswordPopup(true)}>
                  Đổi mật khẩu
                </PrimaryButton>
              )}
            </>
          )}
        </div>
      </div>
      {showChangePasswordPopup && (
        <ChangePassword
          visible={showChangePasswordPopup}
          onClose={() => setShowChangePasswordPopup(false)}
          onPasswordChanged={() => {
            setShowChangePasswordPopup(false);
            toast.success('Mật khẩu đã được đổi thành công!');
          }}
        />
      )}
    </div>
  );
};

export default AdminProfile;
