import React, { useState, useEffect } from 'react';
import { createPayment } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [coinAmount, setCoinAmount] = useState(10);
  const [totalAmount, setTotalAmount] = useState(10000);

  useEffect(() => {
    setTotalAmount(coinAmount * 1000);
  }, [coinAmount]);

  const handleCreatePayment = async () => {
    if (!user || !user.id) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      toast.error(
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const returnUrl = `${window.location.origin}/payment/success`;
      const cancelUrl = `${window.location.origin}/payment/failed`;

      const response = await createPayment({
        userId: user.id,
        amount: coinAmount,
        returnUrl,
        cancelUrl,
      });

      const { checkoutUrl, paymentLinkId } = response.data;

      if (checkoutUrl) {
        sessionStorage.setItem('currentPaymentLinkId', paymentLinkId);

        window.location.href = checkoutUrl;
      } else {
        setError('Không nhận được URL thanh toán từ PayOS. Vui lòng thử lại.');
        toast.error(
          'Không nhận được URL thanh toán từ PayOS. Vui lòng thử lại.'
        );
      }
    } catch (err) {
      console.error('Lỗi khi tạo thanh toán:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Đã xảy ra lỗi khi tạo thanh toán. Vui lòng thử lại.'
      );
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Đã xảy ra lỗi khi tạo thanh toán.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className='max-w-3xl mx-auto my-12 p-8 border border-gray-200 rounded-xl shadow-lg bg-white text-gray-800 font-sans mt-20'>
      <h2 className='text-3xl font-bold text-center text-gray-900 mb-4'>
        Nạp xu
      </h2>

      <div className='bg-gray-50 p-6 rounded-lg mb-4 border-l-4 border-blue-500'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>
          Tạo hóa đơn
        </h3>
        <p>
          <strong>Họ và tên:</strong> {user.fullName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div className='bg-gray-50 p-6 rounded-lg mb-4 border-l-4 border-blue-500'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>
          Số lượng Xu
        </h3>
        <div className='flex items-center'>
          <input
            type='number'
            min='1'
            value={coinAmount}
            onChange={e => setCoinAmount(parseInt(e.target.value))}
            className='w-24 p-2 border border-gray-300 rounded mr-4'
          />
          <span className='text-gray-600'>Xu</span>
        </div>
      </div>

      <div className='bg-gray-50 p-6 rounded-lg mb-4 border-l-4 border-blue-500'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>Tổng cộng</h3>
        <div className='flex justify-between items-center'>
          <span className='text-gray-600'>Thành tiền:</span>
          <span className='text-2xl font-bold text-blue-600'>
            {totalAmount.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      </div>

      {error && (
        <p className='text-red-600 text-center font-bold bg-red-100 p-3 rounded-md border border-red-300 mb-6'>
          {error}
        </p>
      )}

      <PrimaryButton
        onClick={handleCreatePayment}
        disabled={loading}
        className='w-full py-4 text-lg'
      >
        {loading
          ? 'Đang chuyển hướng đến PayOS...'
          : 'Thanh toán ngay với PayOS'}
      </PrimaryButton>

      {loading && (
        <p className='text-center mt-5 text-gray-600 italic text-sm'>
          Vui lòng không đóng trình duyệt trong quá trình chuyển hướng...
        </p>
      )}
    </div>
  );
};

export default CheckoutPage;
