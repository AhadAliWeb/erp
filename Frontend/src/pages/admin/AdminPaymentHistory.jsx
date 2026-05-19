import { useState, useEffect } from 'react';
import {
  DollarSign,
  Zap,
  Droplets,
  Home,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  Hash,
} from 'lucide-react';
import { getPaymentsHistory } from "../../api/billApi";
import { getActiveTenants } from "../../api/tenantApi";

const TABS = [
  { id: 'Electricity', label: 'Electricity', icon: Zap },
  { id: 'Water', label: 'Water', icon: Droplets },
  { id: 'Rent', label: 'Rent', icon: Home },
];

const PAYMENT_MODES = [
  { value: '', label: 'All Modes' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'PayOrder', label: 'Pay Order' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StatusBadge({ label, variant = 'default' }) {
  const variants = {
    paid: { bg: '#DCFCE7', text: '#16A34A' },
    'partially paid': { bg: '#FEF9C3', text: '#CA8A04' },
    unpaid: { bg: '#FEE2E2', text: '#DC2626' },
    active: { bg: '#DCFCE7', text: '#16A34A' },
    inactive: { bg: '#F1F5F9', text: '#64748B' },
    electricity: { bg: '#FEF3C7', text: '#D97706' },
    water: { bg: '#DBEAFE', text: '#2563EB' },
    rent: { bg: '#D1FAE5', text: '#059669' },
    cash: { bg: '#DBEAFE', text: '#2563EB' },
    cheque: { bg: '#F3E8FF', text: '#9333EA' },
    payorder: { bg: '#FFEDD5', text: '#EA580C' },
    default: { bg: '#F1F5F9', text: '#64748B' },
  };
  const key = label?.toLowerCase().replace(/\s/g, '');
  const style = variants[key] || variants.default;
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

export default function AdminPaymentHistory() {
  const [activeTab, setActiveTab] = useState('Electricity');
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tenant Lookup
  const [tenants, setTenants] = useState([]);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [selectedTenantName, setSelectedTenantName] = useState('');

  // Filters
  const [modeFilter, setModeFilter] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [billingYear, setBillingYear] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    fetchPayments();
  }, [activeTab, pagination.pageNumber]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        billType: activeTab,
      };
      if (tenantId) params.tenantId = tenantId;
      if (modeFilter) params.modeOfPayment = modeFilter;
      if (billingMonth && billingYear) {
        params.billingMonth = `${billingMonth} ${billingYear}`;
      }

      const res = await getPaymentsHistory(params);
      setPayments(res.data?.data || []);
      setPagination({
        pageNumber: res.data?.pageNumber || 1,
        pageSize: res.data?.pageSize || 10,
        totalCount: res.data?.totalCount || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenants = async () => {
    setIsLoadingTenants(true);
    try {
      const res = await getActiveTenants();
      setTenants(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants');
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const handleTenantLookup = () => {
    setShowTenantDropdown(!showTenantDropdown);
    setTenantSearch('');
    if (tenants.length === 0) fetchTenants();
  };

  const handleTenantSelect = (tenant) => {
    setTenantId(tenant.id.toString());
    setSelectedTenantName(tenant.company || tenant.fullName || tenant.name || `Tenant #${tenant.id}`);
    setShowTenantDropdown(false);
    setTenantSearch('');
  };

  const clearTenantFilter = () => {
    setTenantId('');
    setSelectedTenantName('');
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    fetchPayments();
  };

  const handleClearFilters = () => {
    setTenantId('');
    setSelectedTenantName('');
    setModeFilter('');
    setBillingMonth('');
    setBillingYear('');
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setTimeout(() => fetchPayments(), 0);
  };

  const filteredTenants = tenants.filter((t) =>
    (t.company || t.fullName || t.name || '')
      .toLowerCase()
      .includes(tenantSearch.toLowerCase()) ||
    (t.id?.toString() || '').includes(tenantSearch)
  );

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;
  const hasNextPage = pagination.pageNumber < totalPages;

  const columns = [
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-[#64748B]" />
          <span>{formatDate(val)}</span>
        </div>
      ),
    },
    {
      key: 'companyName',
      label: 'Tenant',
      render: (val) => <span className="font-medium text-[#1E293B]">{val || '—'}</span>,
    },
    {
      key: 'billType',
      label: 'Bill Type',
      render: (val) => <StatusBadge label={val} variant={val?.toLowerCase()} />,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-semibold text-[#002365]">{formatCurrency(val)}</span>,
    },
    {
      key: 'modeOfPayment',
      label: 'Mode',
      render: (val) => <StatusBadge label={val} variant={val?.toLowerCase().replace(/\s/g, '')} />,
    },
    {
      key: 'chequeNo',
      label: 'Cheque No',
      render: (val) => val || <span className="text-[#94A3B8]">—</span>,
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      render: (val) => val || <span className="text-[#94A3B8]">—</span>,
    },
    {
      key: 'createdBy',
      label: 'Received By',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-[#64748B]" />
          <span>{val || '—'}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-[#64748B]" />
          <span>{formatDateTime(val)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#002365] text-white">
            <DollarSign size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Payment History</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          View all payment transactions across tenants. Filter by tenant, bill type, mode, or billing month.
        </p>
      </div>

      {/* Tenant Lookup Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 min-w-0 relative">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
              Tenant
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={selectedTenantName || (tenantId ? `Tenant #${tenantId}` : '')}
                  readOnly
                  placeholder="All Tenants"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 px-3 text-sm text-[#1E293B] cursor-pointer"
                  onClick={handleTenantLookup}
                />
                {tenantId && (
                  <button
                    onClick={clearTenantFilter}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleTenantLookup}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors shrink-0"
              >
                <Search size={15} />
                <span className="hidden sm:inline">Lookup</span>
              </button>
            </div>

            {/* Tenant Dropdown */}
            {showTenantDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-[#E2E8F0] shadow-lg overflow-hidden">
                <div className="p-3 border-b border-[#E2E8F0]">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      placeholder="Search tenants..."
                      autoFocus
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingTenants ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="sm" />
                    </div>
                  ) : filteredTenants.length === 0 ? (
                    <p className="text-sm text-[#64748B] text-center py-6">No tenants found</p>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        type="button"
                        onClick={() => handleTenantSelect(tenant)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#64748B]" />
                          <div>
                            <p className="text-sm font-medium text-[#1E293B]">
                              {tenant.company || tenant.fullName || tenant.name}
                            </p>
                            <p className="text-xs text-[#64748B]">ID: {tenant.id}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[#64748B]" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Mode Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
              Mode of Payment
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>

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
                {MONTHS.map((m) => (
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
              <Filter size={15} />
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
          <p className="text-sm text-[#64748B] mt-3">Loading payments...</p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-semibold text-[#1E293B]">{payments.length}</span> of{' '}
              <span className="font-semibold text-[#1E293B]">{pagination.totalCount}</span> payments
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {columns.map((col) => (
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
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#64748B]">
                        No payment history found
                      </td>
                    </tr>
                  ) : (
                    payments.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                      >
                        {columns.map((col) => (
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
            {payments.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
                <p className="text-sm text-[#64748B]">No payment history found</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge label={payment.billType} variant={payment.billType?.toLowerCase()} />
                      <span className="text-xs text-[#64748B]">#{payment.id}</span>
                    </div>
                    <StatusBadge label={payment.modeOfPayment} variant={payment.modeOfPayment?.toLowerCase().replace(/\s/g, '')} />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <Building2 size={13} className="text-[#64748B]" />
                    <span className="font-medium text-[#1E293B]">{payment.companyName || '—'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Payment Date</p>
                      <p className="text-sm font-medium text-[#1E293B]">{formatDate(payment.paymentDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Amount</p>
                      <p className="text-sm font-semibold text-[#002365]">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Cheque No</p>
                      <p className="text-sm font-medium text-[#1E293B]">{payment.chequeNo || <span className="text-[#94A3B8]">—</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Bank</p>
                      <p className="text-sm font-medium text-[#1E293B]">{payment.bankName || <span className="text-[#94A3B8]">—</span>}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <User size={12} />
                      <span>Received by: <span className="font-medium text-[#1E293B]">{payment.createdBy || '—'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Clock size={12} />
                      <span>Recorded: {formatDateTime(payment.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
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