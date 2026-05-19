import { useState, useEffect } from 'react';
import { Download, Users, Landmark, Receipt, AlertTriangle, Wallet, UserCheck, FileSpreadsheet } from 'lucide-react';
import { getActiveTenants } from "../../api/tenantApi";
import { getBanks } from "../../api/bankApi";
import {
  downloadTenantReport,
  downloadBankTransactionsReport,
  downloadTenantBillsReport,
  downloadOutstandingReport,
  downloadReceivablesReport,
  downloadUserAmountsReport,
} from "../../api/reportApi";
import Loader from "../../components/Loader";
import { useSelector } from 'react-redux';



function ReportCard({ report, tenants, banks, isLoading, onDownload }) {
  const [filters, setFilters] = useState({
    bankId: '',
    fromDate: '',
    toDate: '',
    tenantId: '',
  });

  const Icon = report.icon;

  const canDownload = () => {
    if (!report.hasFilters) return true;
    if (report.filterType === 'bank-date') {
      return filters.bankId && filters.fromDate && filters.toDate;
    }
    if (report.filterType === 'tenant') {
      return filters.tenantId;
    }
    return true;
  };

  const handleDownload = async () => {
    if (!canDownload()) return;

    let args = [];
    if (report.filterType === 'bank-date') {
      args = [filters.bankId, filters.fromDate, filters.toDate];
    } else if (report.filterType === 'tenant') {
      args = [filters.tenantId];
    }

    await onDownload(report.id, report.downloadFn, args, report.filename);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-2.5 rounded-lg shrink-0 ${report.iconBg} ${report.iconColor}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#1E293B] truncate">{report.name}</h3>
          <p className="text-sm text-[#64748B] mt-1 leading-relaxed">{report.description}</p>
        </div>
      </div>

      {/* Filters */}
      {report.hasFilters && (
        <div className="space-y-3 mb-4">
          {report.filterType === 'bank-date' && (
            <>
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Select Bank
                </label>
                <select
                  value={filters.bankId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, bankId: e.target.value }))}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                >
                  <option value="">-- Select a bank --</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bankName || bank.name || `Bank #${bank.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {report.filterType === 'tenant' && (
            <div>
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                Select Tenant
              </label>
              <select
                value={filters.tenantId}
                onChange={(e) => setFilters((prev) => ({ ...prev, tenantId: e.target.value }))}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
              >
                <option value="">-- Select a tenant --</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.fullName || tenant.name || `Tenant #${tenant.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isLoading || !canDownload()}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors mt-2 ${
          isLoading || !canDownload()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#002365] text-white hover:bg-[#0033A0]'
        }`}
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Downloading...
          </>
        ) : (
          <>
            <Download size={16} />
            Download Excel
          </>
        )}
      </button>
    </div>
  );
}

export default function Reports() {
  const [tenants, setTenants] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(null);
  const [error, setError] = useState(null);

  const { role } = useSelector((s) => s.auth.user);

  const REPORTS = [
  {
    id: 'tenant-details',
    name: 'Tenant Details',
    description: 'Complete list of all tenants with contact and lease information.',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    hasFilters: false,
    downloadFn: downloadTenantReport,
    filename: 'tenant-details.xlsx',
  },
  {
    id: 'bank-transactions',
    name: 'Bank Transactions',
    description: 'Transaction history for a selected bank account within a date range.',
    icon: Landmark,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    hasFilters: true,
    filterType: 'bank-date',
    downloadFn: downloadBankTransactionsReport,
    filename: 'bank-transactions.xlsx',
  },
  {
    id: 'tenant-bills',
    name: 'Tenant Bills',
    description: 'Bill history and breakdown for a specific tenant.',
    icon: Receipt,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    hasFilters: true,
    filterType: 'tenant',
    downloadFn: downloadTenantBillsReport,
    filename: 'tenant-bills.xlsx',
  },
  {
    id: 'outstanding',
    name: 'Outstanding Report',
    description: 'Summary of all outstanding balances across tenants.',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    hasFilters: false,
    downloadFn: downloadOutstandingReport,
    filename: 'outstanding-report.xlsx',
  },
  {
    id: 'receivables',
    name: 'Receivables Report',
    description: 'Overview of expected receivables and collection status.',
    icon: Wallet,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    hasFilters: false,
    downloadFn: downloadReceivablesReport,
    filename: 'receivables-report.xlsx',
  },

  ...(role === "Admin"
    ? [{
        id: 'user-amounts',
        name: 'User Amounts',
        description: 'Collection amounts handled by each user (Admin only).',
        icon: UserCheck,
        iconColor: 'text-sky-600',
        iconBg: 'bg-sky-50',
        hasFilters: false,
        downloadFn: downloadUserAmountsReport,
        filename: 'user-amounts.xlsx',
        adminOnly: true,
      }]
    : []),
];

  // Fetch dropdown data
  useEffect(() => {
    fetchTenants();
    fetchBanks();
  }, []);

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      const response = await getActiveTenants();
      setTenants(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await getBanks();
      setBanks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load banks');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleDownload = async (reportId, downloadFn, args, filename) => {
    setDownloadingReport(reportId);
    try {
      await downloadFn(...args);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to download ${filename}`);
    } finally {
      setDownloadingReport(null);
    }
  };

  const isLoadingDropdowns = loadingTenants || loadingBanks;

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#002365] text-white">
            <FileSpreadsheet size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Reports</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          Generate and download Excel reports for tenants, transactions, bills, and financial summaries.
        </p>
      </div>

      {/* Loading State */}
      {isLoadingDropdowns && (
        <div className="mb-6">
          <Loader message="Loading report data..." />
        </div>
      )}

      {/* Error State */}
      {error && !isLoadingDropdowns && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={() => { setError(null); fetchTenants(); fetchBanks(); }}
            className="text-sm text-[#002365] hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REPORTS.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            tenants={tenants}
            banks={banks}
            isLoading={downloadingReport === report.id}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}