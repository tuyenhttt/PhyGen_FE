import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPaymentStatus, getWebhook } from '@/services/paymentService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { toast } from 'react-toastify';

const PaymentSuccessPage = () => {
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

        toast.success(`Giao dịch ${mapStatusToText(response.data.status)}!`);
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
      case 'CANCELLED':
      case 2:
        return 'Đã hủy';
      case 'Failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  const getStatusBadgeClasses = (status) => {
    let baseClasses = 'inline-block px-3 py-1 rounded-full font-bold text-sm';
    if (status === 'Completed' || status === 1) return `${baseClasses} bg-green-500 text-white`;
    if (status === 'Pending' || status === 0) return `${baseClasses} bg-yellow-500 text-gray-900`;
    if (status === 'Failed' || status === 2 || status === 'FAILED') return `${baseClasses} bg-red-500 text-white`;
    return `${baseClasses} bg-gray-400 text-white`;
  };



  return (
    <div className='max-w-3xl mx-auto my-12 p-8 rounded-xl shadow-lg text-center font-sans border border-green-300 bg-green-50'>
      {loading ? (
        <>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Đang kiểm tra trạng thái thanh toán...</h2>
          <p className='text-gray-600 italic text-base'>Vui lòng đợi trong giây lát.</p>
        </>
      ) : error ? (
        <>
          <h2 className='text-3xl font-bold text-red-600 mb-4'>Lỗi!</h2>
          <p className='text-red-600 mb-6 font-bold bg-red-100 p-3 rounded-md border border-red-300'>
            {error}
          </p>
          <PrimaryButton onClick={() => navigate('/')} className='mt-6 px-6 py-3'>Về trang chủ</PrimaryButton>
        </>
      ) : (
        <>
          <h2 className='text-3xl font-bold text-green-600 mb-4'>Thanh toán hoàn tất!</h2>
          <p className='text-lg text-gray-700 mb-6'>Cảm ơn bạn đã thực hiện giao dịch.</p>
          {paymentDetails && (
            <div className='bg-white p-6 rounded-lg border border-gray-200 mb-8 text-left leading-relaxed'>
              <p className='mb-2'><strong>Mã giao dịch:</strong> {paymentDetails.data.id || 'N/A'}</p>
              <p className='mb-2'><strong>Mã liên kết PayOS:</strong> {paymentDetails.data.paymentLinkId}</p>
              <p className='mb-2'><strong>Tổng tiền:</strong> {paymentDetails.data.amount?.toLocaleString('vi-VN')}.000 VNĐ</p>
              <p className='mb-4'>
                <strong>Trạng thái:</strong> <span className={getStatusBadgeClasses(paymentDetails.data.status)}>
                  {mapStatusToText(paymentDetails.data.status)}
                </span>
              </p>
              {paymentDetails.status === 'PENDING' && (
                <p className='mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md text-sm italic'>
                  Giao dịch đang chờ xác nhận. Vui lòng kiểm tra lại sau ít phút hoặc xem lịch sử đơn hàng của bạn.
                </p>
              )}
            </div>
          )}

          <div className='flex justify-center gap-4 mt-8'>
            <PrimaryButton
              onClick={() => navigate('/payment/history')}
              className='px-6 py-3 text-base'
            >
              Xem lịch sử giao dịch
            </PrimaryButton>
            <CommonButton
              onClick={() => navigate('/')}
              className='px-6 py-3 text-base'
            >
              Tiếp tục mua sắm
            </CommonButton>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;