import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Zap,
  Droplets,
  Home,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  DollarSign,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import {
  getElectricityBillsMine,
  getWaterBillsMine,
  getRentBillsMine,
} from "../../api/utilityApi";

const TABS = [
  { id: 'Electricity', label: 'Electricity', icon: Zap },
  { id: 'Water', label: 'Water', icon: Droplets },
  { id: 'Rent', label: 'Rent', icon: Home },
];

function StatusBadge({ label, variant = 'default' }) {
  const variants = {
    "Paid": { bg: '#DCFCE7', text: '#16A34A' },
    'Partially Paid': { bg: '#FEF9C3', text: '#CA8A04' },
    'Unpaid': { bg: '#FEE2E2', text: '#DC2626' },
    default: { bg: '#F1F5F9', text: '#64748B' },
  };
  const style = variants[variant] || variants.default;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

function Spinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-[3px]' : 'h-6 w-6 border-2';
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-[#002365] ${sizeClass}`}
      role="status"
    />
  );
}

export default function BillHistory() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Electricity');
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [billingMonth, setBillingMonth] = useState('');
  const [billingYear, setBillingYear] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    fetchBills();
  }, [activeTab, pagination.pageNumber]);

  const fetchBills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };
      if (billingMonth && billingYear) {
        params.month = `${billingMonth} ${billingYear}`;
      }

      let res;
      switch (activeTab) {
        case 'Electricity':
          res = await getElectricityBillsMine(params);
          break;
        case 'Water':
          res = await getWaterBillsMine(params);
          break;
        case 'Rent':
          res = await getRentBillsMine(params);
          break;
        default:
          res = await getElectricityBillsMine(params);
      }

      setBills(res.data?.data || []);
      setPagination({
        pageNumber: res.data?.pageNumber || 1,
        pageSize: res.data?.pageSize || 10,
        totalCount: res.data?.totalCount || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${activeTab.toLowerCase()} bills`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    fetchBills();
  };

  const handleClearFilters = () => {
    setBillingMonth('');
    setBillingYear('');
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setTimeout(() => fetchBills(), 0);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;
  const hasNextPage = pagination.pageNumber < totalPages;

  const isRent = activeTab === 'Rent';

  const desktopColumns = [
    { key: 'id', label: 'Bill ID' },
    { key: 'billingMonth', label: 'Billing Month' },
    ...(isRent ? [] : [{ key: 'unitsConsumed', label: 'Units' }]),
    { key: 'totalAmount', label: 'Total Amount', render: (val) => formatCurrency(val) },
    // { key: 'remainingAmount', label: 'Remaining', render: (val) => (
    //   <span className={val > 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
    //     {formatCurrency(val)}
    //   </span>
    // )},
    { key: 'issueDate', label: 'Issue Date', render: (val) => formatDate(val) },
    { key: 'dueDate', label: 'Due Date', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <StatusBadge
          label={row.status}
          variant={row.status}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => {
            const route = activeTab === 'Electricity'
              ? `/tenant/electricity/view/${row.id}`
              : activeTab === 'Water'
              ? `/tenant/water/view/${row.id}`
              : `/tenant/rent/view/${row.id}`;
            navigate(route);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye size={13} />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#002365] text-white">
            <Receipt size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Bill History</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          View all your bills across electricity, water, and rent.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPagination((prev) => ({ ...prev, pageNumber: 1 })); }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-[#002365] border-[#002365]'
                  : 'text-[#64748B] border-transparent hover:text-[#1E293B]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Billing Month Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
              Billing Month
            </label>
            <div className="flex gap-2">
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
              >
                <option value="">Month</option>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={billingYear}
                onChange={(e) => setBillingYear(e.target.value)}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {(billingMonth || billingYear) && (
                <button
                  onClick={() => { setBillingMonth(''); setBillingYear(''); }}
                  className="p-2.5 text-[#64748B] hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors"
            >
              <Search size={15} />
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 text-sm font-medium text-[#64748B] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="text-sm text-[#64748B] mt-3">Loading {activeTab.toLowerCase()} bills...</p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-semibold text-[#1E293B]">{bills.length}</span> of{' '}
              <span className="font-semibold text-[#1E293B]">{pagination.totalCount}</span> bills
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {desktopColumns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={desktopColumns.length} className="px-4 py-12 text-center text-sm text-[#64748B]">
                        No {activeTab.toLowerCase()} bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                      >
                        {desktopColumns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm text-[#1E293B] whitespace-nowrap">
                            {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {bills.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
                <p className="text-sm text-[#64748B]">No {activeTab.toLowerCase()} bills found</p>
              </div>
            ) : (
              bills.map((bill) => {
                const statusLabel = bill.status;
                const statusVariant = bill.status;
                return (
                  <div
                    key={bill.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                          Bill #{bill.id}
                        </span>
                      </div>
                      <StatusBadge label={statusLabel} variant={statusVariant} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[#64748B] mb-0.5">Billing Month</p>
                        <p className="text-sm font-medium text-[#1E293B]">{bill.billingMonth}</p>
                      </div>
                      {!isRent && (
                        <div>
                          <p className="text-xs text-[#64748B] mb-0.5">Units</p>
                          <div className="flex items-center gap-1">
                            <Gauge size={12} className="text-[#64748B]" />
                            <p className="text-sm font-medium text-[#1E293B]">{bill.unitsConsumed ?? 0}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[#64748B] mb-0.5">Total Amount</p>
                        <p className="text-sm font-semibold text-[#002365]">{formatCurrency(bill.totalAmount)}</p>
                      </div>
                      {/* <div>
                        <p className="text-xs text-[#64748B] mb-0.5">Remaining</p>
                        <p className={`text-sm font-semibold ${bill.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {formatCurrency(bill.remainingAmount)}
                        </p>
                      </div> */}
                      <div>
                        <p className="text-xs text-[#64748B] mb-0.5">Issue Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#64748B]" />
                          <p className="text-sm font-medium text-[#1E293B]">{formatDate(bill.issueDate)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-0.5">Due Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#64748B]" />
                          <p className="text-sm font-medium text-[#1E293B]">{formatDate(bill.dueDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-[#F1F5F9]">
                      <button
                        onClick={() => {
                          const route = activeTab === 'Electricity'
                            ? `/tenant/electricity/view/${bill.id}`
                            : activeTab === 'Water'
                            ? `/tenant/water/view/${bill.id}`
                            : `/tenant/rent/view/${bill.id}`;
                          navigate(route);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalCount > 0 && (
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, pageNumber: prev.pageNumber - 1 }))}
                disabled={pagination.pageNumber <= 1}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  pagination.pageNumber <= 1
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft size={15} />
                <span>Prev</span>
              </button>

              <span className="text-sm text-[#64748B]">
                Page <span className="font-semibold text-[#1E293B]">{pagination.pageNumber}</span> of{' '}
                <span className="font-semibold text-[#1E293B]">{totalPages}</span>
              </span>

              <button
                onClick={() => setPagination((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
                disabled={!hasNextPage}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  !hasNextPage
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}