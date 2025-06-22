import React, { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import ConfirmModal from '../ui/ConfirmModal';
import { changePassword } from '@/services/authService';
import Cookies from 'js-cookie';

const ChangePassword = ({ visible, onClose, onPasswordChanged }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const userEmail = Cookies.get('custom-user') ? JSON.parse(Cookies.get('custom-user')).email : '';

    if (!userEmail) {
      toast.error('Không tìm thấy thông tin email người dùng. Vui lòng thử đăng nhập lại.');
      onClose();
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        email: userEmail,
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      toast.success('Đổi mật khẩu thành công!');
      onPasswordChanged();
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal visible={visible} onClose={onClose} title="Đổi Mật Khẩu">
      <TextInput
        id="currentPassword"
        label="Mật khẩu hiện tại"
        type="password"
        placeholder="Nhập mật khẩu hiện tại"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />
      <TextInput
        id="newPassword"
        label="Mật khẩu mới"
        type="password"
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="mt-4"
        required
      />
      <TextInput
        id="confirmNewPassword"
        label="Xác nhận mật khẩu mới"
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        className="mt-4"
        required
      />
      <div className="flex justify-end gap-4 mt-6">
        <PrimaryButton
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-400 text-white"
          disabled={loading}
        >
          Hủy
        </PrimaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          disabled={loading}
        >
          {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </PrimaryButton>
      </div>
    </ConfirmModal>
  );
};

export default ChangePassword;