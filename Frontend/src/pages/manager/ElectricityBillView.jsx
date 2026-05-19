import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Building2,
  Calendar,
  Gauge,
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Hash,
  TrendingUp,
  Percent,
  Ban,
} from 'lucide-react';
import { getSingleElectricityBill } from "../../api/utilityApi";

function StatusBadge({ label }) {
  const key = label?.toLowerCase();
  const variants = {
    paid: { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' },
    'partially paid': { bg: '#FEF9C3', text: '#CA8A04', border: '#FDE047' },
    unpaid: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
    active: { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' },
    inactive: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
    obsolete: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  };
  const style = variants[key] || { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border"
      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
    >
      {key === 'paid' && <CheckCircle2 size={12} />}
      {key === 'partially paid' && <Clock size={12} />}
      {key === 'unpaid' && <AlertTriangle size={12} />}
      {key === 'obsolete' && <Ban size={12} />}
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

function DetailRow({ icon: Icon, label, value, highlight = false, isNegative = false }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F1F5F9] last:border-b-0">
      <div className={`p-1.5 rounded-lg shrink-0 ${highlight ? 'bg-[#002365] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 truncate ${isNegative ? 'text-red-600' : 'text-[#1E293B]'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function AmountRow({ label, value, isTotal = false, isNegative = false }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${isTotal ? 'border-t-2 border-[#E2E8F0] pt-3 mt-2' : 'border-b border-[#F1F5F9]'}`}>
      <span className={`text-sm ${isTotal ? 'font-semibold text-[#1E293B]' : 'text-[#64748B]'}`}>{label}</span>
      <span className={`text-sm font-medium ${isTotal ? 'text-lg font-bold text-[#002365]' : isNegative ? 'text-red-600' : 'text-[#1E293B]'}`}>
        {value}
      </span>
    </div>
  );
}

export default function ElectricityBillView() {
  const { utilityId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBill();
  }, [utilityId]);

  const fetchBill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSingleElectricityBill(utilityId);
      setBill(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load electricity bill');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="text-sm text-[#64748B] mt-3">Loading bill details...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <button
          onClick={() => navigate('/manager/electricity')}
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#002365] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Bills
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{error || 'Bill not found'}</p>
          <button
            onClick={fetchBill}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayStatus = bill.isObsolete ? 'Obsolete' : bill.status;

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/manager/electricity')}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#002365] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to Bills
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
                  Electricity Bill #{bill.id}
                </h1>
                <StatusBadge label={displayStatus} />
              </div>
              <p className="text-sm text-[#64748B] mt-1">
                {bill.companyName} · {bill.billingMonth}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bill Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant & Billing Info */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#002365]" />
              Bill Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <DetailRow icon={Hash} label="Bill ID" value={`#${bill.id}`} />
              <DetailRow icon={Hash} label="Tenant ID" value={`#${bill.tenantId}`} />
              <DetailRow icon={Building2} label="Company" value={bill.companyName} highlight />
              <DetailRow icon={Calendar} label="Billing Month" value={bill.billingMonth} />
              <DetailRow icon={Calendar} label="Issue Date" value={formatDate(bill.issueDate)} />
              <DetailRow icon={Calendar} label="Due Date" value={formatDate(bill.dueDate)} />
              <DetailRow icon={Clock} label="Created At" value={formatDateTime(bill.createdAt)} />
              <DetailRow
                icon={Ban}
                label="Obsolete"
                value={bill.isObsolete ? 'Yes — This bill has been replaced' : 'No'}
                isNegative={bill.isObsolete}
              />
            </div>
          </div>

          {/* Meter Readings */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
              <Gauge size={18} className="text-[#002365]" />
              Meter Readings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F8FAFC] rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Previous Reading</p>
                <p className="text-2xl font-bold text-[#1E293B]">{bill.previousReading ?? 0}</p>
                <p className="text-xs text-[#64748B] mt-1">units</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Current Reading</p>
                <p className="text-2xl font-bold text-[#002365]">{bill.currentReading ?? 0}</p>
                <p className="text-xs text-[#64748B] mt-1">units</p>
              </div>
              <div className="bg-[#002365] rounded-lg p-4 text-center">
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">Units Consumed</p>
                <p className="text-2xl font-bold text-white">{bill.unitsConsumed ?? 0}</p>
                <p className="text-xs text-white/70 mt-1">units</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
              <TrendingUp size={14} />
              <span>Rate per unit: <span className="font-semibold text-[#1E293B]">{formatCurrency(bill.ratePerUnit)}</span></span>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-[#002365]" />
              Charges Breakdown
            </h2>
            <div className="space-y-1">
              <AmountRow
                label="Electricity Charges (Units × Rate)"
                value={formatCurrency(bill.electricityCharges)}
              />
              <AmountRow
                label="Fixed Charges"
                value={formatCurrency(bill.fixedCharges)}
              />
              <AmountRow
                label="SST Charges"
                value={formatCurrency(bill.sstCharges)}
              />
              <AmountRow
                label="Overdue Amount Added"
                value={bill.overdueAmountAdded ? 'Yes' : 'No'}
                isNegative={bill.overdueAmountAdded}
              />
              <AmountRow
                label="Total Amount"
                value={formatCurrency(bill.totalAmount)}
                isTotal
              />
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-4">Payment Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#002365]">{formatCurrency(bill.totalAmount)}</p>
              </div>
              <div className="border-t border-[#F1F5F9] pt-4">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Remaining Amount</p>
                <p className={`text-xl font-bold ${bill.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(bill.remainingAmount)}
                </p>
              </div>
              <div className="border-t border-[#F1F5F9] pt-4">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Payment Status</p>
                <div className="mt-1">
                  <StatusBadge label={displayStatus} />
                </div>
              </div>
              <div className="border-t border-[#F1F5F9] pt-4">
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1">Due Date</p>
                <p className="text-sm font-semibold text-[#1E293B]">{formatDate(bill.dueDate)}</p>
                {new Date(bill.dueDate) < new Date() && bill.status?.toLowerCase() !== 'paid' && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Overdue
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Rate/Unit</span>
                <span className="text-sm font-semibold text-[#1E293B]">{formatCurrency(bill.ratePerUnit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Units</span>
                <span className="text-sm font-semibold text-[#1E293B]">{bill.unitsConsumed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">SST %</span>
                <span className="text-sm font-semibold text-[#1E293B]">
                  {bill.totalAmount > 0 && bill.electricityCharges > 0
                    ? `${((bill.sstCharges / bill.electricityCharges) * 100).toFixed(1)}%`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Overdue Added</span>
                <span className={`text-sm font-semibold ${bill.overdueAmountAdded ? 'text-red-600' : 'text-[#1E293B]'}`}>
                  {bill.overdueAmountAdded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/manager/payments/new?utilityId=${bill.id}&type=Electricity`)}
                disabled={bill.remainingAmount <= 0 || bill.isObsolete}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign size={15} />
                Record Payment
              </button>
              <button
                onClick={() => navigate(`/manager/tenants/${bill.tenantId}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Building2 size={15} />
                View Tenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}