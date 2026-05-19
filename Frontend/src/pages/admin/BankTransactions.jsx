import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Filter, Landmark } from 'lucide-react';
import { getBankById, getBankTransactions } from '../../api/bankApi';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';

export default function BankTransactions() {
  const { bankId } = useParams();
  const navigate = useNavigate();

  const [bank, setBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankLoading, setBankLoading] = useState(true);

  // Filters
  const [type, setType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBank = async () => {
    setBankLoading(true);
    try {
      const res = await getBankById(bankId);
      setBank(res.data);
    } catch (err) {
      console.error('Failed to fetch bank:', err);
    } finally {
      setBankLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        type,
        fromDate,
        toDate,
      };
      const res = await getBankTransactions(bankId, params);
      const data = res.data || {};
      setTransactions(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBank();
  }, [bankId]);

  useEffect(() => {
    fetchTransactions();
  }, [bankId, pageNumber, type, fromDate, toDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(1);
      fetchTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleReset = () => {
    setType('');
    setFromDate('');
    setToDate('');
    setSearch('');
    setPageNumber(1);
  };

  const filteredTransactions = transactions.filter((t) =>
    search ? t.description?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => (
        <span className="text-sm text-[#1E293B] whitespace-nowrap">{val}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <Badge
          label={val}
          variant={val === 'Credit' ? 'success' : val === 'Debit' ? 'danger' : 'default'}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val, row) => (
        <span className={`text-sm font-semibold ${row.type === 'Credit' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {row.type === 'Credit' ? '+' : '-'} Rs. {val?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => (
        <span className="text-sm text-[#1E293B] max-w-[200px] truncate">{val}</span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (val) => (
        <span className="text-sm text-[#64748B]">{val}</span>
      ),
    },
  ];

  const inputClass = 'w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-colors';

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/banks')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-white w-fit"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Bank Transactions</h1>
            {bank && (
              <p className="text-sm text-[#64748B] mt-0.5">
                {bank.bankName} — {bank.accountTitle} — Rs. {bank.currentBalance?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Bank Info Card (Mobile friendly) */}
        {bank && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#002365] text-white shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#1E293B]">{bank.bankName}</h3>
                <p className="text-xs text-[#64748B]">{bank.accountNumber}</p>
              </div>
            </div>
            <div className="sm:ml-auto grid grid-cols-2 gap-4 sm:gap-8">
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide">Current Balance</p>
                <p className="text-lg font-bold text-[#16A34A]">Rs. {bank.currentBalance?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide">Opening Balance</p>
                <p className="text-lg font-bold text-[#1E293B]">Rs. {bank.openingBalance?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by description..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-40">
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value); setPageNumber(1); }}
                  className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                >
                  <option value="">All Types</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
            </div>

            {/* From Date */}
            <div className="w-full lg:w-44">
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPageNumber(1); }}
                  className={`${inputClass} pl-9`}
                  placeholder="From Date"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="w-full lg:w-44">
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPageNumber(1); }}
                  className={`${inputClass} pl-9`}
                  placeholder="To Date"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full lg:w-auto rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F5F7FA] whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <Table
            columns={columns}
            data={filteredTransactions}
            isLoading={loading}
            emptyMessage="No transactions found"
          />
        </div>

        {/* Pagination */}
        {!loading && filteredTransactions.length > 0 && (
          <Pagination
            currentPage={pageNumber}
            dataLength={filteredTransactions.length}
            limit={pageSize}
            onPageChange={setPageNumber}
          />
        )}

        {/* Total Count */}
        {!loading && (
          <p className="text-xs text-[#64748B] mt-3 text-right">
            Total: {totalCount} transaction{totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}