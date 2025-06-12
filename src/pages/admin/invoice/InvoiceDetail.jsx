import { useParams } from 'react-router-dom';
import logo from '@/assets/images/logo.jpeg';
import PrimaryButton from '@/components/ui/PrimaryButton';

const InvoiceDetail = () => {
  const { id } = useParams();
  const data = [
    {
      id: 1,
      idInvoice: '#INV2540',
      name: 'Michael A. Miner',
      avatar: 'https://i.pravatar.cc/40?img=3',
      paymentDate: '07 Jan , 2023',
      total: '40000 VNĐ',
      paymentMethod: 'Mastercard',
      items: [{ name: 'Gói 400 Coin', qty: 1, price: 40000, total: 400 }],
      status: 'Đã thanh toán',
    },
    {
      id: 2,
      idInvoice: '#INV3924',
      name: 'Theresa T. Brose',
      avatar: 'https://i.pravatar.cc/40?img=5',
      paymentDate: '03 Dec , 2023',
      total: '783 VNĐ',
      paymentMethod: 'Visa',
      items: [{ name: 'Gói 100 Coin', qty: 1, price: 10000, total: 100 }],
      status: 'Hủy',
    },
    {
      id: 3,
      idInvoice: '#INV4571',
      name: 'James L. Erickson',
      avatar: 'https://i.pravatar.cc/40?img=7',
      paymentDate: '28 Sep , 2023',
      total: '134 VNĐ',
      items: [{ name: 'Gói 200 Coin', qty: 1, price: 20000, total: 200 }],
      paymentMethod: 'Paypal',
      status: 'Chờ thanh toán',
    },
    {
      id: 4,
      idInvoice: '#INV4590',
      name: 'James L. Erickson',
      avatar: 'https://i.pravatar.cc/40?img=7',
      paymentDate: '28 Sep , 2023',
      total: '134 VNĐ',
      paymentMethod: 'Paypal',
      items: [{ name: 'Gói 500 Coin', qty: 1, price: 500000, total: 500 }],
      status: 'Thất bại',
    },
  ];

  const getStatusColor = data => {
    switch (data) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-600';
      case 'Chờ thanh toán':
        return 'bg-yellow-100 text-yellow-600';
      case 'Hủy':
      case 'Thất bại':
        return 'bg-red-100 text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const invoice = data.find(item => item.id === parseInt(id));

  if (!invoice) return <p>Không tìm thấy hóa đơn.</p>;

  return (
    <div className='max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-8'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <img src={logo} alt='Logo' className='h-10 w-auto rounded-lg' />
          <h2 className='text-2xl font-semibold text-gray-800'>PhyGen</h2>
          <p className='text-sm text-gray-600 mt-2'>
            1729 Bangor St., Houston, ME, 04730, United States
            <br />
            Phone: +1 (342) 532-9109
          </p>
        </div>
        <div className='text-right space-y-1'>
          <p className='text-sm text-gray-600'>
            Invoice: <strong>{invoice.idInvoice}</strong>
          </p>
          <p className='text-sm text-gray-600'>
            Ngày thanh toán: {invoice.paymentDate}
          </p>
          <p className='text-sm text-gray-600'>
            Tổng cộng: <strong>{invoice.total}</strong>
          </p>
          <span
            className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
              invoice.status
            )}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {/* From & To */}
      <div className='grid grid-cols-2 gap-8 text-sm text-gray-600'>
        <div>
          <h4 className='font-semibold text-gray-800 mb-1'>Issued From :</h4>
          <p>Larkon Admin.INC</p>
          <p>2437 Romano Street Cambridge, MA 02141</p>
          <p>Phone: (+1) 781-217-2004</p>
          <p>Email: julianekuhn@jourrapide.com</p>
        </div>
        <div>
          <h4 className='font-semibold text-gray-800 mb-1'>Issued To :</h4>
          <p>{invoice.name}</p>
          <p>1344 Hershell Hollow Road WA 98168, USA</p>
          <p>Phone: (+123) 732-760-5760</p>
          <p>Email: hello@dundermifflin.com</p>
        </div>
      </div>

      {/* Items Table */}
      <table className='w-full text-sm border-t border-b border-gray-200'>
        <thead className='bg-gray-100 text-gray-600'>
          <tr>
            <th className='text-left py-2 px-4'>Sản phẩm</th>
            <th className='text-center py-2 px-4'>Số lượng</th>
            <th className='text-right py-2 px-4'>Giá</th>
            <th className='text-right py-2 px-4'>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.id} className='border-t'>
              <td className='py-3 px-4 text-gray-700'>{item.name}</td>
              <td className='py-3 px-4 text-center'>{item.qty}</td>
              <td className='py-3 px-4 text-right'>
                {item.price.toLocaleString()} VNĐ
              </td>
              <td className='py-3 px-4 text-right'>
                {item.total.toLocaleString()} VNĐ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className='flex justify-end'>
        <div className='w-full max-w-sm space-y-2 text-sm text-gray-700'>
          <div className='flex justify-between'>
            <span>Tổng phụ:</span>
            <span>{invoice.total}</span>
          </div>
          <div className='flex justify-between'>
            <span>Giảm giá:</span>
            <span>0 VNĐ</span>
          </div>
          <div className='flex justify-between font-semibold text-base border-t pt-2'>
            <span>Tổng cộng:</span>
            <span>{invoice.total}</span>
          </div>
        </div>
      </div>

      {/* Payment Notes */}
      <div className='bg-red-50 border border-red-200 p-4 rounded-md text-sm text-red-800'>
        Tất cả hóa đơn cần được thanh toán trong vòng 7 ngày kể từ ngày phát
        hành. Nếu không, khoản phí dịch vụ đã cung cấp sẽ được tính như xác nhận
        công việc.
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-4 mt-6'>
        <PrimaryButton>In</PrimaryButton>
        <PrimaryButton>Tải PDF</PrimaryButton>
      </div>
    </div>
  );
};

export default InvoiceDetail;
