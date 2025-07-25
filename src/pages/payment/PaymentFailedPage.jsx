import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { getPaymentStatus, getWebhook } from '@/services/paymentService';
import { toast } from 'react-toastify';

const PaymentFailedPage = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentLinkId = sessionStorage.getItem('currentPaymentLinkId');
      if (!paymentLinkId) {
        setError('Không tìm thấy ID giao dịch. Vui lòng kiểm tra lại đơn hàng của bạn.');
        toast.error('Không tìm thấy ID giao dịch. Vui lòng kiểm tra lại đơn hàng của bạn.');
        setLoading(false);
        return;
      }

      try {
        const response = await getPaymentStatus(paymentLinkId);
        setPaymentDetails(response);

        const webhookRes = await getWebhook(paymentLinkId);
        console.log('Webhook response:', webhookRes?.data);

        sessionStorage.removeItem('currentPaymentLinkId');

        toast.warn(`Giao dịch ${mapStatusToText(response.data.status)}!`);
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', err);
        setError(err.response?.data?.message || err.message || 'Không thể kiểm tra trạng thái thanh toán chi tiết. Vui lòng liên hệ hỗ trợ.');
        toast.error(err.response?.data?.message || err.message || 'Không thể kiểm tra trạng thái thanh toán chi tiết.');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const mapStatusToText = (statusCode) => {
    switch (statusCode) {
      case 'Completed':
      case 1:
        return 'Thành công';
      case 'Pending':
      case 0:
        return 'Đang chờ xử lý';
      case 'Cancelled':
      case 2:
        return 'Đã hủy';
      case 'Failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className='max-w-3xl mx-auto my-12 p-8 mt-20 rounded-xl shadow-lg text-center font-sans border border-red-300 bg-red-50 text-gray-800'>
      <h2 className='text-3xl font-bold text-red-600 mb-4'>Thanh toán không thành công!</h2>
      <p className='text-lg text-gray-700 mb-6'>
        Đã có lỗi xảy ra trong quá trình thanh toán, hoặc giao dịch đã bị hủy.
      </p>
      <p className='text-base text-gray-600 italic mb-8'>
        Vui lòng kiểm tra lại thông tin và thử lại, hoặc chọn phương thức thanh toán khác.
      </p>
      <div className='flex justify-center gap-4 mt-8'>
        <PrimaryButton
          onClick={() => navigate('/payment')}
          className='px-6 py-3 text-base bg-red-600 hover:bg-red-700'
        >
          Thử thanh toán lại
        </PrimaryButton>
        <CommonButton
          onClick={() => navigate('/')}
          className='px-6 py-3 text-base'
        >
          Quay lại trang chủ
        </CommonButton>
      </div>
    </div>
  );
};

export default PaymentFailedPage;