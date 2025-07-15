import { useState, useEffect } from 'react';
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
    if (!user?.id) {
      const msg =
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/payment/success`;
      const cancelUrl = `${window.location.origin}/payment/failed`;

      const res = await createPayment({
        userId: user.id,
        amount: coinAmount,
        returnUrl,
        cancelUrl,
      });

      const { checkoutUrl, paymentLinkId } = res.data;
      if (checkoutUrl) {
        sessionStorage.setItem('currentPaymentLinkId', paymentLinkId);
        window.location.href = checkoutUrl;
      } else {
        const msg = 'Không nhận được URL thanh toán. Vui lòng thử lại.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tạo thanh toán.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const suggestedAmounts = [5, 10, 20, 50, 80, 100];

  return (
    <div className='max-w-xl mx-auto mb-20 mt-20 px-6 py-10 bg-white shadow-lg rounded-2xl border border-gray-200'>
      <h2 className='text-3xl font-bold text-center text-gray-900 mb-8'>
        Nạp xu
      </h2>

      <div className='space-y-6 text-gray-700 text-sm'>
        <div className='space-y-1'>
          <p>
            <span className='font-semibold'>Họ và tên: {''}</span>
            <span>{user.fullName}</span>
          </p>
          <p>
            <span className='font-semibold'>Email: {''}</span>
            <span>{user.email}</span>
          </p>
        </div>

        <div>
          <label className='font-semibold'>Chọn nhanh số xu:</label>
          <div className='flex gap-3 mt-2'>
            {suggestedAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => setCoinAmount(amount)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  coinAmount === amount
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:bg-blue-50'
                }`}
              >
                {amount.toLocaleString()} xu
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='font-semibold block mb-1'>Hoặc nhập số xu</label>
          <input
            type='number'
            min='1'
            value={coinAmount}
            onChange={e => setCoinAmount(parseInt(e.target.value) || 0)}
            className='w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-right font-medium text-base'
          />
          <p className='text-xs text-gray-500 mt-1'>1 xu = 1.000 VNĐ</p>
        </div>

        <div className='flex justify-between items-center text-lg border-t pt-4 mt-4 font-semibold'>
          <span>Thành tiền:</span>
          <span className='text-blue-600 text-xl'>
            {totalAmount.toLocaleString('vi-VN')} VNĐ
          </span>
        </div>

        {error && (
          <p className='text-red-600 text-center font-bold bg-red-100 p-3 rounded-md border border-red-300'>
            {error}
          </p>
        )}

        <PrimaryButton
          onClick={handleCreatePayment}
          disabled={loading}
          className='w-full py-4 text-base mt-2'
        >
          {loading ? 'Đang chuyển hướng...' : 'Thanh toán ngay với PayOS'}
        </PrimaryButton>

        {loading && (
          <p className='text-center mt-3 text-gray-500 italic text-sm'>
            Vui lòng không tắt trình duyệt...
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
