import CommonButton from '@/components/ui/CommonButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { searchTransaction } from '@/services/paymentService';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from 'react-icons/bs';
import { GiTwoCoins } from 'react-icons/gi';

const TYPE_LABELS = {
  Register: 'Đăng kí tài khoản mới',
  Login: 'Đăng nhập hàng ngày',
  Generate: 'Tạo đề với AI',
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
    <div className='rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-600'>{title}</p>
        <div className={`size-10 rounded-full grid place-items-center`}>
          {icon}
        </div>
      </div>
      <div
        className={`mt-2 text-2xl font-bold leading-none ${toneClass} font-mono tabular-nums`}
      >
        <span>{value}</span>
      </div>
    </div>
  );
};

const CoinHistory = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalInAll, setTotalInAll] = useState(0);
  const [totalOutAll, setTotalOutAll] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState('');
  const [allData, setAllData] = useState([]);
  const [tab, setTab] = useState('all');

  const currentUserId = user?.id || user?.userId || user?.uid;

  // Chốt id để chỉ nhận kết quả của lần tính tổng mới nhất (tránh nhấp nháy khi filter liên tục)
  const computeIdRef = useRef(0);

  const buildFilters = () => ({
    userId: currentUserId,
    fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate: toDate ? new Date(toDate).toISOString() : undefined,
    type: type || undefined,
  });

  const computeTotalsAll = async filters => {
    const myId = ++computeIdRef.current;
    try {
      const AGG_PAGE_SIZE = 200;
      const first = await searchTransaction(1, AGG_PAGE_SIZE, filters);
      const p1 = first?.data || { data: [], count: 0 };

      const sumPage = items =>
        (items || []).reduce(
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

      if (myId === computeIdRef.current) {
        setTotalInAll(totals.in);
        setTotalOutAll(totals.out);
      }
    } catch (err) {
      console.error('Compute totals error:', err);
      // giữ nguyên giá trị cũ để không nhảy
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const filters = buildFilters();
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

  const fetchAllForTabs = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const filters = buildFilters();
      const AGG_SIZE = 200;

      const first = await searchTransaction(1, AGG_SIZE, filters);
      const p1 = first?.data || { data: [], count: 0 };
      let items = [...(p1.data || [])];

      const totalPages = Math.ceil((p1.count || 0) / AGG_SIZE);
      if (totalPages > 1) {
        const reqs = [];
        for (let p = 2; p <= totalPages; p++) {
          reqs.push(searchTransaction(p, AGG_SIZE, filters));
        }
        const rs = await Promise.all(reqs);
        rs.forEach(r => {
          const pl = r?.data || {};
          if (pl.data) items = items.concat(pl.data);
        });
      }
      setAllData(items);
    } catch (e) {
      console.error('fetchAllForTabs error:', e);
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    if (tab === 'all') fetchData(pageIndex);
  }, [currentUserId, pageIndex, tab]);

  useEffect(() => {
    if (!currentUserId) return;
    setPageIndex(1);
    if (tab === 'all') {
      fetchData(1);
    } else {
      fetchAllForTabs();
      computeTotalsAll(buildFilters());
    }
  }, [currentUserId, fromDate, toDate, type, tab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageIndex]);

  const filteredAll = useMemo(() => {
    if (tab === 'in') return allData.filter(t => t.coinChange > 0);
    if (tab === 'out') return allData.filter(t => t.coinChange < 0);
    return allData;
  }, [allData, tab]);

  const totalPages =
    tab === 'all'
      ? Math.max(1, Math.ceil(totalCount / pageSize))
      : Math.max(1, Math.ceil(filteredAll.length / pageSize));

  const pageData =
    tab === 'all'
      ? transactions
      : filteredAll
          .slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
          .map((t, i) => ({ ...t, __no: (pageIndex - 1) * pageSize + i + 1 }));

  const renderStt = (t, i) => t.__no ?? (pageIndex - 1) * pageSize + i + 1;

  const tabbedData = useMemo(() => {
    if (tab === 'in') return transactions.filter(t => t.coinChange > 0);
    if (tab === 'out') return transactions.filter(t => t.coinChange < 0);
    return transactions;
  }, [transactions, tab]);

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

  const fmt = n => (n ?? 0).toLocaleString('vi-VN');

  return (
    <div className='max-w-6xl mx-auto p-6 md:p-8 space-y-6 mt-16'>
      <h1 className='text-center text-3xl font-bold text-gray-900 tracking-tight'>
        Lịch sử xu
      </h1>

      {/* Tabs */}
      <div className='flex'>
        <div
          className='w-full max-w-xl bg-gray-100 rounded-2xl p-1 grid grid-cols-3 gap-1'
          role='tablist'
        >
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'in', label: 'Cộng xu' },
            { key: 'out', label: 'Trừ xu' },
          ].map(t => (
            <button
              role='tab'
              aria-selected={tab === t.key}
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full text-center px-4 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === t.key
                    ? 'bg-white shadow-sm border'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <SummaryCard
          title='Số dư hiện tại'
          value={`${fmt(transactions[0]?.coinAfter)} xu`}
          icon={<GiTwoCoins size={22} className='text-yellow-500' />}
        />
        <SummaryCard
          title='Tổng cộng xu'
          value={`${fmt(totalInAll)} xu`}
          tone='up'
          icon={<BsArrowUpSquareFill size={22} className='text-emerald-500' />}
        />
        <SummaryCard
          title='Tổng trừ xu'
          value={`${fmt(totalOutAll)} xu`}
          tone='down'
          icon={<BsArrowDownSquareFill size={22} className='text-rose-500' />}
        />
      </div>

      {/* Filters */}
      <div className='rounded-2xl bg-gray-50 p-4 md:p-5 shadow-sm ring-1 ring-gray-200'>
        <div className='grid gap-3 md:grid-cols-4'>
          <input
            type='date'
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className='w-full px-3 py-2 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Từ ngày'
          />

          <input
            type='date'
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className='w-full px-3 py-2 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Đến ngày'
          />

          <PrimaryButton onClick={onSearchClick} className='w-full'>
            Tìm kiếm
          </PrimaryButton>

          <CommonButton
            type='button'
            onClick={onClearFilters}
            className='w-full'
          >
            Xóa bộ lọc
          </CommonButton>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-2xl bg-white shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <div className='min-w-[760px]'>
            <div
              className='sticky top-0 z-10 bg-gray-100 px-4 py-3
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
                {pageData.map((t, i) => {
                  const positive = t.coinChange > 0;
                  const stt = renderStt(t, i);
                  return (
                    <div
                      key={i}
                      className='grid grid-cols-12 items-center px-4 py-3 rounded-xl
                        odd:bg-gray-50 bg-white hover:bg-gray-100 transition'
                    >
                      <div className='col-span-1 text-gray-700'>{stt}</div>

                      <div className='col-span-3 flex items-center gap-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            positive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {positive ? 'Cộng xu' : 'Trừ xu'}
                        </span>
                        <span className='text-sm text-gray-700'>
                          {typeLabel(t.type)}
                        </span>
                      </div>

                      <div className='col-span-2 text-gray-800 font-mono tabular-nums'>
                        {fmt(t.coinBefore)}
                      </div>

                      <div
                        className={`col-span-2 font-semibold font-mono tabular-nums ${
                          positive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {positive ? `+${fmt(t.coinChange)}` : fmt(t.coinChange)}
                      </div>

                      <div className='col-span-2 text-gray-800 font-mono tabular-nums'>
                        {fmt(t.coinAfter)}
                      </div>

                      <div className='col-span-2 text-gray-600'>
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-6 gap-2'>
          <button
            onClick={() => setPageIndex(p => Math.max(1, p - 1))}
            disabled={pageIndex === 1}
            className='px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50'
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
              if (idx > 0 && arr[idx - 1] !== page - 1) acc.push('ellipsis');
              acc.push(page);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`e-${idx}`} className='px-2 text-gray-500'>
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPageIndex(item)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    pageIndex === item
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setPageIndex(p => (p < totalPages ? p + 1 : p))}
            disabled={pageIndex >= totalPages}
            className='px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50'
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default CoinHistory;
