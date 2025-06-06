import React, { useState } from 'react';
import PrimaryButton from "@/components/ui/PrimaryButton";
import TextInput from '@/components/ui/TextInput';

const UserProfile = () => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "alexarawles@gmail.com",
        phone: "",
        password: "",
        confirmPassword: "",
        avatar: "https://via.placeholder.com/80",
        gender: ""
    });

    const [message, setMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSave = () => {
        if (editMode) {
            // Validate
            if (formData.password !== formData.confirmPassword) {
                setMessage("Mật khẩu không khớp");
                return;
            }
            setMessage(" Lưu thành công!");
        } else {
            setMessage("");
        }
        setEditMode(!editMode);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, avatar: imageUrl }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
            {/* Hồ sơ người dùng */}
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
                {/* Thông tin người dùng */}
                <div className="flex flex-col items-center text-center">
                    <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-2 border-blue-500 object-cover mb-4"
                    />
                    <div className="h-10 mb-2">
                        {editMode ? (
                            <>
                                <label htmlFor="avatarInput" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2  cursor-pointer text-sm">
                                    Chọn ảnh đại diện
                                </label>
                                <input
                                    type="file"
                                    id="avatarInput"
                                    name="avatar"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </>
                        ) : (
                            <div className="invisible h-full">placeholder</div>
                        )}
                    </div>
                </div>

                {/* Biểu mẫu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="w-full md:w-1/2 px-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring ${editMode ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                                }`}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div> <br />
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
                                placeholder='Xác nhận mật khẩu'
                            />
                        </div>
                    )}
                    <div className="flex flex-col col-span-2 items-center text-center mb-8">
                        <PrimaryButton
                            onClick={handleEditSave}
                        >
                            {editMode ? "Lưu" : "Sửa"}
                        </PrimaryButton>
                        {message && (
                            <p className={`mt-3 text-sm ${message.includes("khớp") ? "text-red-500" : "text-green-600"}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;