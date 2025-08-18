import CommonButton from '@/components/ui/CommonButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { searchTransaction } from '@/services/paymentService';
import { useEffect, useMemo, useState } from 'react';
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from 'react-icons/bs';
import { GiTwoCoins } from 'react-icons/gi';

const TYPE_LABELS = {
  Login: 'Đăng nhập hàng ngày',
  Purchase: 'Nạp tiền (đổi xu)',
};
const typeLabel = t => TYPE_LABELS[t] ?? t;

const SummaryCard = ({ title, value, tone = 'default', icon }) => {
  const toneClass =
    tone === 'up'
      ? 'text-emerald-600'
      : tone === 'down'
      ? 'text-rose-600'
      : 'text-gray-900';
  return (
    <div className='rounded-2xl border bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-600'>{title}</p>
        {icon}
      </div>
      <div className={`mt-2 text-2xl font-bold leading-none ${toneClass}`}>
        <span>{value}</span>
      </div>
    </div>
  );
};

export default function CoinHistory() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalInAll, setTotalInAll] = useState(0);
  const [totalOutAll, setTotalOutAll] = useState(0);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState('');

  const [tab, setTab] = useState('all');

  const currentUserId = user?.id || user?.userId || user?.uid;

  useEffect(() => {
    if (!currentUserId) return;
    fetchData(pageIndex);
  }, [currentUserId, pageIndex]);

  const computeTotalsAll = async filters => {
    setTotalsLoading(true);
    try {
      const AGG_PAGE_SIZE = 200;
      const first = await searchTransaction(1, AGG_PAGE_SIZE, filters);
      const p1 = first?.data || { data: [], count: 0 };

      const sumPage = items =>
        items.reduce(
          (acc, t) => {
            if (t.coinChange > 0) acc.in += t.coinChange;
            else if (t.coinChange < 0) acc.out += Math.abs(t.coinChange);
            return acc;
          },
          { in: 0, out: 0 }
        );

      let totals = sumPage(p1.data || []);
      const totalPages = Math.ceil((p1.count || 0) / AGG_PAGE_SIZE);

      if (totalPages > 1) {
        const reqs = [];
        for (let p = 2; p <= totalPages; p++) {
          reqs.push(searchTransaction(p, AGG_PAGE_SIZE, filters));
        }
        const results = await Promise.all(reqs);
        results.forEach(r => {
          const pl = r?.data || {};
          const s = sumPage(pl.data || []);
          totals.in += s.in;
          totals.out += s.out;
        });
      }

      setTotalInAll(totals.in);
      setTotalOutAll(totals.out);
    } catch (err) {
      console.error('Compute totals error:', err);
      setTotalInAll(0);
      setTotalOutAll(0);
    } finally {
      setTotalsLoading(false);
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const filters = {
        userId: currentUserId,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(toDate).toISOString() : undefined,
        type: type || undefined,
      };

      // chạy song song: trang hiện tại + tổng toàn bộ
      const [res] = await Promise.all([
        searchTransaction(page, pageSize, filters),
        computeTotalsAll(filters),
      ]);

      const payload = res?.data || {};
      setTransactions(payload.data || []);
      setTotalCount(payload.count || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const tabbedData = useMemo(() => {
    if (tab === 'in') return transactions.filter(t => t.coinChange > 0);
    if (tab === 'out') return transactions.filter(t => t.coinChange < 0);
    return transactions;
  }, [transactions, tab]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const onSearchClick = () => {
    setPageIndex(1);
    fetchData(1);
  };

  const onClearFilters = () => {
    setFromDate('');
    setToDate('');
    setType('');
    setPageIndex(1);
    fetchData(1);
  };

  return (
    <div className='max-w-6xl mx-auto p-6 md:p-8 space-y-6 mt-16'>
      <h1 className='text-center text-3xl font-bold text-gray-800'>
        Lịch sử xu
      </h1>

      {/* Tabs */}
      <div className='flex justify-between items-center mb-4'>
        <div className='w-full max-w-xl bg-gray-100 rounded-2xl p-1 grid grid-cols-3 gap-2'>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'in', label: 'Cộng xu' },
            { key: 'out', label: 'Trừ xu' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full text-center px-4 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === t.key
                    ? 'bg-white shadow border'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary*/}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <SummaryCard
          title='Số dư hiện tại'
          value={`${transactions[0]?.coinAfter ?? 0} xu`}
          icon={<GiTwoCoins size={30} className='text-yellow-500' />}
        />
        <SummaryCard
          title='Tổng cộng xu'
          value={totalsLoading ? '…' : `${totalInAll} xu`}
          tone='up'
          icon={<BsArrowUpSquareFill size={30} className='text-emerald-500' />}
        />
        <SummaryCard
          title='Tổng trừ xu'
          value={totalsLoading ? '…' : `${totalOutAll} xu`}
          tone='down'
          icon={<BsArrowDownSquareFill size={30} className='text-rose-500' />}
        />
      </div>

      {/* Filters */}
      <div className='rounded-2xl bg-gray-100 p-4 md:p-5 shadow-md'>
        <div className='grid gap-3 md:grid-cols-5'>
          <input
            type='date'
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className='w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Từ ngày'
          />
          <input
            type='date'
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className='w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Đến ngày'
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className='w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Tất cả loại</option>
            <option value='Login'>{TYPE_LABELS.Login}</option>
            <option value='Purchase'>{TYPE_LABELS.Purchase}</option>
          </select>

          <PrimaryButton onClick={onSearchClick}>Tìm kiếm</PrimaryButton>
          <CommonButton type='button' onClick={onClearFilters}>
            Xóa bộ lọc
          </CommonButton>
        </div>
      </div>
      {/* Table */}
      <div className='rounded-2xl bg-white shadow-sm overflow-hidden'>
        <div
          className='sticky top-0 z-10 bg-gray-100 backdrop-blur px-4 py-3
                  grid grid-cols-12 text-xs font-semibold uppercase tracking-wide text-gray-600
                  border-b border-gray-200'
        >
          <div className='col-span-1'>STT</div>
          <div className='col-span-3'>Sự kiện</div>
          <div className='col-span-2'>Trước</div>
          <div className='col-span-2'>Thay đổi</div>
          <div className='col-span-2'>Sau</div>
          <div className='col-span-2'>Ngày</div>
        </div>

        {/* Body */}
        {loading ? (
          <div className='px-2 py-2 space-y-1'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='grid grid-cols-12 px-4 py-3 rounded-xl animate-pulse bg-gray-50'
              >
                <div className='col-span-1 h-4 bg-gray-200 rounded' />
                <div className='col-span-3 h-4 bg-gray-200 rounded' />
                <div className='col-span-2 h-4 bg-gray-200 rounded' />
                <div className='col-span-2 h-4 bg-gray-200 rounded' />
                <div className='col-span-2 h-4 bg-gray-200 rounded' />
                <div className='col-span-2 h-4 bg-gray-200 rounded' />
              </div>
            ))}
          </div>
        ) : tabbedData.length === 0 ? (
          <div className='px-6 py-12 text-center text-gray-500'>
            Không có giao dịch nào phù hợp.
          </div>
        ) : (
          <div className='px-2 py-2 space-y-1'>
            {tabbedData.map((t, i) => {
              const positive = t.coinChange > 0;
              const stt = (pageIndex - 1) * pageSize + i + 1;
              return (
                <div
                  key={i}
                  className='grid grid-cols-12 items-center px-4 py-3 rounded-xl bg-white
                       hover:bg-gray-50 transition'
                >
                  <div className='col-span-1 text-gray-700'>{stt}</div>
                  <div className='col-span-3 flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        positive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {positive ? 'Cộng xu' : 'Trừ xu'}
                    </span>
                    <span className='text-sm text-gray-700'>
                      {typeLabel(t.type)}
                    </span>
                  </div>
                  <div className='col-span-2 text-gray-800'>{t.coinBefore}</div>
                  <div
                    className={`col-span-2 font-semibold ${
                      positive ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {positive ? `+${t.coinChange}` : t.coinChange}
                  </div>
                  <div className='col-span-2 text-gray-800'>{t.coinAfter}</div>
                  <div className='col-span-2 text-gray-600'>
                    {new Date(t.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center mt-6 gap-2'>
            <button
              onClick={() => setPageIndex(p => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
              className='px-4 py-2 border rounded disabled:opacity-50 cursor-pointer'
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= pageIndex - 1 && page <= pageIndex + 1)
                );
              })
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== page - 1) {
                  acc.push('ellipsis');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className='px-2'>
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPageIndex(item)}
                    className={`px-4 py-2 border cursor-pointer rounded ${
                      pageIndex === item
                        ? 'bg-orange-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPageIndex(p => (p < totalPages ? p + 1 : p))}
              disabled={pageIndex >= totalPages}
              className='px-4 py-2 border rounded disabled:opacity-50 cursor-pointer'
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
