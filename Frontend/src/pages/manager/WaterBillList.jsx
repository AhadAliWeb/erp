import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Eye,
  Zap,
  ChevronRight,
  ChevronLeft,
  Filter,
  Building2,
  Calendar,
  Gauge,
  DollarSign,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getWaterBills } from "../../api/utilityApi";
import { getActiveTenants } from "../../api/tenantApi";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StatusBadge({ label }) {
  const key = label?.toLowerCase();
  const variants = {
    paid: { bg: '#DCFCE7', text: '#16A34A' },
    'partially paid': { bg: '#FEF9C3', text: '#CA8A04' },
    unpaid: { bg: '#FEE2E2', text: '#DC2626' },
    active: { bg: '#DCFCE7', text: '#16A34A' },
    inactive: { bg: '#F1F5F9', text: '#64748B' },
  };
  const style = variants[key] || { bg: '#F1F5F9', text: '#64748B' };
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
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-2';
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-[#002365] ${sizeClass}`}
      role="status"
    />
  );
}

export default function WaterBillsList() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [tenantId, setTenantId] = useState('');
  const [selectedTenantName, setSelectedTenantName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Tenant Lookup
  const [tenants, setTenants] = useState([]);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  useEffect(() => {
    fetchBills();
  }, [pagination.pageNumber]);

  const fetchBills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };
      if (tenantId) params.tenantId = tenantId;
      if (selectedMonth && selectedYear) {
        params.month = `${selectedMonth} ${selectedYear}`;
      }

      const res = await getWaterBills(params);
      setBills(res.data?.data || []);
      setPagination({
        pageNumber: res.data?.pageNumber || 1,
        pageSize: res.data?.pageSize || 10,
        totalCount: res.data?.totalCount || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Water bills');
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

  const clearMonthFilter = () => {
    setSelectedMonth('');
    setSelectedYear('');
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    fetchBills();
  };

  const handleClearFilters = () => {
    setTenantId('');
    setSelectedTenantName('');
    setSelectedMonth('');
    setSelectedYear('');
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setTimeout(() => fetchBills(), 0);
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

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;
  const hasNextPage = pagination.pageNumber < totalPages;

  const columns = [
    { key: 'id', label: 'Bill ID' },
    { key: 'billingMonth', label: 'Billing Month' },
    { key: 'unitsConsumed', label: 'Units' },
    { key: 'totalAmount', label: 'Total Amount', render: (val) => formatCurrency(val) },
    { key: 'issueDate', label: 'Issue Date', render: (val) => formatDate(val) },
    { key: 'dueDate', label: 'Due Date', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge label={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/manager/water/view/${row.id}`)}
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
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Zap size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Water Bills</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          View and manage all water utility bills. Filter by tenant or billing month.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Tenant Lookup */}
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
                  placeholder="Select a tenant..."
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

          {/* Month Filter */}
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
              Billing Month
            </label>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {(selectedMonth || selectedYear) && (
                <button
                  onClick={clearMonthFilter}
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
          <p className="text-sm text-[#64748B] mt-3">Loading water bills...</p>
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
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#64748B]">
                        No water bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((row, rowIdx) => (
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
            {bills.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
                <p className="text-sm text-[#64748B]">No water bills found</p>
              </div>
            ) : (
              bills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                      Bill #{bill.id}
                    </span>
                    <StatusBadge label={bill.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Billing Month</p>
                      <p className="text-sm font-medium text-[#1E293B]">{bill.billingMonth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Units</p>
                      <p className="text-sm font-medium text-[#1E293B]">{bill.unitsConsumed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Total Amount</p>
                      <p className="text-sm font-semibold text-[#002365]">{formatCurrency(bill.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Due Date</p>
                      <p className="text-sm font-medium text-[#1E293B]">{formatDate(bill.dueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                    <div>
                      <p className="text-xs text-[#64748B]">Issued: {formatDate(bill.issueDate)}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/manager/water/view/${bill.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={13} />
                      View
                    </button>
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