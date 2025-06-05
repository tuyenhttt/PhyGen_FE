import React, { useState } from 'react';
import PrimaryButton from "@/components/ui/PrimaryButton";

const UserProfile = () => {
    const [editMode, setEditMode] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    const [isNameEditable, setIsNameEditable] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        lastName: 'Người',
        firstName: 'Dùng',
        email: 'nguoidung@gmail.com',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
        avatar: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // xử lý "Lưu", gọi API
    const handleToggleEdit = () => {
        if (editMode) {
            if (formData.password !== formData.confirmPassword) {
                setPasswordMatch(true);
                return;
            }
            console.log('Lưu dữ liệu:', formData);
            setSaveSuccess(true);
            setPasswordMatch(false);
            if (isNameEditable) {
                setIsNameEditable(false); // khóa họ tên sau lần lưu đầu
            }
        }
        setEditMode(!editMode);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const renderField = (label, name, isPassword = false) => (
        <div className="mb-4">
            <div className="text-gray-600">{label}:</div>
            {editMode ? (
                <div className="relative max-w-md">
                    <input
                        type={isPassword && !showPassword ? 'password' : 'text'}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 mt-1 w-full max-w-md"
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                        >
                            {showPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="mt-1 font-medium">{isPassword
                    ? '••••••••'
                    : formData[name] || '-'}</div>
            )}
        </div>
    );

    return (
        <div className="flex-1 p-8 space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Hồ sơ của tôi</h1>
            <div className="grid grid-cols-2 font-semibold gap-6 max-w-2xl text-sm text-gray-800">
                {renderField('Họ', 'lastName', false, editMode && isNameEditable)}
                {renderField('Tên', 'firstName', false, editMode && isNameEditable)}
                {editMode && isNameEditable && (
                    (
                        <div className="col-span-2 text-sm text-red-500 mt-2 flex items-center gap-1">
                            ❗ Sau khi chỉnh sửa lần đầu, bạn sẽ không thể thay đổi Họ và Tên nữa.
                        </div>
                    )
                )}
                {renderField('Email', 'email')} <br />
                {renderField('Số điện thoại', 'phone')} <br />
                {renderField('Địa chỉ', 'address')} <br />
                {renderField('Mật khẩu', 'password', true)}
                {editMode && renderField('Xác nhận mật khẩu', 'confirmPassword', true)}
                <div className="col-span-2 mb-6 flex items-center gap-4">
                    <img
                        src={formData.avatar || 'https://via.placeholder.com/100'}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border"
                    />

                    {editMode && (
                        <div>
                            <label className="block mb-1 text-gray-600">Thay đổi Avatar:</label>
                            <label className="inline-block px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
                                Chọn tệp
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <PrimaryButton
                onClick={handleToggleEdit}
            >
                {editMode ? 'Lưu' : 'Sửa'}
            </PrimaryButton>
            {saveSuccess && (
                <span className="p-4 text-green-600 font-medium">Lưu thành công</span>
            )}
            {passwordMatch && (
                <span className="p-4 text-red-600 font-medium">Mật khẩu không khớp</span>
            )}
        </div>
    );
};

export default UserProfile;