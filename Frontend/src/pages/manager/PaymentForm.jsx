import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  Landmark,
  Calendar,
  FileText,
  Hash,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Search,
  Zap,
  Droplets,
  Home,
} from 'lucide-react';
import { getBanks } from "../../api/bankApi";
import { billPayment } from "../../api/billApi";
import {
  getSingleElectricityBill,
  getSingleWaterBill,
  getSingleRentBill,
} from "../../api/utilityApi";

const BILL_TYPES = [
  { value: 'Electricity', label: 'Electricity', icon: Zap },
  { value: 'Water', label: 'Water', icon: Droplets },
  { value: 'Rent', label: 'Rent', icon: Home },
];

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'PayOrder', label: 'Pay Order' },
];

function StatusBadge({ label, variant = 'default' }) {
  const variants = {
    success: { bg: '#DCFCE7', text: '#16A34A' },
    warning: { bg: '#FEF9C3', text: '#CA8A04' },
    danger: { bg: '#FEE2E2', text: '#DC2626' },
    info: { bg: '#DBEAFE', text: '#2563EB' },
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
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-2';
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-[#002365] ${sizeClass}`}
      role="status"
    />
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: '#DCFCE7', border: '#86EFAC', text: '#16A34A', icon: <CheckCircle2 size={18} /> },
    error: { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626', icon: <AlertTriangle size={18} /> },
  };
  const s = styles[type];

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
    >
      {s.icon}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params from TenantDetail
  const qpUtilityId = searchParams.get('utilityId');
  const qpType = searchParams.get('type');

  const [billType, setBillType] = useState(qpType || '');
  const [utilityId, setUtilityId] = useState(qpUtilityId || '');
  const [amount, setAmount] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('');
  const [bankId, setBankId] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [payOrderNo, setPayOrderNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const [banks, setBanks] = useState([]);
  const [billDetails, setBillDetails] = useState(null);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isLoadingBill, setIsLoadingBill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch banks on mount
  useEffect(() => {
    fetchBanks();
  }, []);

  // Auto-fetch bill if query params present
  useEffect(() => {
    if (qpType && qpUtilityId) {
      setBillType(qpType);
      setUtilityId(qpUtilityId);
      fetchBillDetails(qpType, qpUtilityId);
    }
  }, [qpType, qpUtilityId]);

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const res = await getBanks();
      setBanks(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load banks');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const fetchBillDetails = async (type, id) => {
    if (!type || !id) {
      setBillDetails(null);
      return;
    }
    setIsLoadingBill(true);
    setError(null);
    try {
      let res;
      switch (type) {
        case 'Electricity':
          res = await getSingleElectricityBill(id);
          break;
        case 'Water':
          res = await getSingleWaterBill(id);
          break;
        case 'Rent':
          res = await getSingleRentBill(id);
          break;
        default:
          throw new Error('Invalid bill type');
      }
      const data = res.data;
      setBillDetails(data);
      // Pre-fill amount with remaining amount
      if (data.remainingAmount > 0) {
        setAmount(data.remainingAmount.toString());
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${type} bill #${id}`);
      setBillDetails(null);
    } finally {
      setIsLoadingBill(false);
    }
  };

  const handleBillTypeChange = (value) => {
    setBillType(value);
    setUtilityId('');
    setBillDetails(null);
    setAmount('');
  };

  const handleUtilityIdChange = (value) => {
    setUtilityId(value);
    if (value && billType) {
      fetchBillDetails(billType, value);
    } else {
      setBillDetails(null);
    }
  };

  const handleSearchBill = () => {
    if (billType && utilityId) {
      fetchBillDetails(billType, utilityId);
    } else {
      setError('Please select bill type and enter utility ID');
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const showBankField = modeOfPayment === 'Cheque' || modeOfPayment === 'PayOrder';
  const showChequeField = modeOfPayment === 'Cheque';
  const showPayOrderField = modeOfPayment === 'PayOrder';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!billType) {
      setError('Please select bill type');
      return;
    }
    if (!utilityId) {
      setError('Please enter utility ID');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!modeOfPayment) {
      setError('Please select mode of payment');
      return;
    }
    if (showBankField && !bankId) {
      setError('Please select a bank');
      return;
    }
    if (showChequeField && !chequeNo) {
      setError('Please enter cheque number');
      return;
    }
    if (showPayOrderField && !payOrderNo) {
      setError('Please enter pay order number');
      return;
    }
    if (!paymentDate) {
      setError('Please select payment date');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        utilityId: parseInt(utilityId, 10),
        billType,
        modeOfPayment,
        bankId: showBankField ? parseInt(bankId, 10) : null,
        chequeNo: showChequeField ? chequeNo : null,
        payOrderNo: showPayOrderField ? payOrderNo : null,
        amount: parseFloat(amount),
        paymentDate,
      };
      await billPayment(payload);
      setToast({ message: 'Payment Recorded Successfully', type: 'success' });
      // Reset form
      if (!qpType || !qpUtilityId) {
        setBillType('');
        setUtilityId('');
      }
      setAmount('');
      setModeOfPayment('');
      setBankId('');
      setChequeNo('');
      setPayOrderNo('');
      setPaymentDate('');
      setBillDetails(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record payment';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = BILL_TYPES.find((t) => t.value === billType);
  const TypeIcon = selectedType?.icon || FileText;

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[#002365] text-white">
            <DollarSign size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Record Payment</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          Record a payment against an electricity, water, or rent bill.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#002365]" />
              Bill Selection
            </h2>

            <div className="space-y-4">
              {/* Bill Type */}
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Bill Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BILL_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleBillTypeChange(type.value)}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-sm font-medium transition-colors ${
                          billType === type.value
                            ? 'border-[#002365] bg-blue-50 text-[#002365]'
                            : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Utility ID */}
              {billType && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Utility ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={utilityId}
                      onChange={(e) => handleUtilityIdChange(e.target.value)}
                      placeholder={`Enter ${billType} bill ID`}
                      className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleSearchBill}
                      disabled={isLoadingBill}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isLoadingBill ? <Spinner size="sm" /> : <Search size={15} />}
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bill Details Preview */}
              {isLoadingBill && (
                <div className="flex items-center justify-center py-6 bg-[#F8FAFC] rounded-lg">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-[#64748B]">Loading bill details...</span>
                </div>
              )}

              {billDetails && !isLoadingBill && (
                <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1E293B]">Bill Details</h3>
                    <StatusBadge label={billDetails.status || 'Unpaid'} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#64748B]">Company</p>
                      <p className="text-sm font-semibold text-[#1E293B]">{billDetails.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Billing Month</p>
                      <p className="text-sm font-semibold text-[#1E293B]">{billDetails.billingMonth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Due Date</p>
                      <p className="text-sm font-semibold text-[#1E293B]">{formatDate(billDetails.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Total Amount</p>
                      <p className="text-sm font-semibold text-[#002365]">{formatCurrency(billDetails.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Remaining</p>
                      <p className={`text-sm font-semibold ${billDetails.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(billDetails.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          {billDetails && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-[#002365]" />
                Payment Details
              </h2>

              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={billDetails.remainingAmount}
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter payment amount"
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                    />
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Remaining: <span className="font-semibold text-red-600">{formatCurrency(billDetails.remainingAmount)}</span>
                  </p>
                </div>

                {/* Mode of Payment */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Mode of Payment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setModeOfPayment(mode.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          modeOfPayment === mode.value
                            ? 'border-[#002365] bg-blue-50 text-[#002365]'
                            : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-gray-50'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank (conditional) */}
                {showBankField && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                      Bank
                    </label>
                    <div className="relative">
                      <Landmark size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <select
                        required
                        value={bankId}
                        onChange={(e) => setBankId(e.target.value)}
                        className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
                      >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.bankName} — {bank.accountNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isLoadingBanks && (
                      <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                        <Spinner size="sm" /> Loading banks...
                      </p>
                    )}
                  </div>
                )}

                {/* Cheque No (conditional) */}
                {showChequeField && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                      Cheque Number
                    </label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input
                        type="text"
                        required
                        value={chequeNo}
                        onChange={(e) => setChequeNo(e.target.value)}
                        placeholder="Enter cheque number"
                        className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Pay Order No (conditional) */}
                {showPayOrderField && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                      Pay Order Number
                    </label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input
                        type="text"
                        required
                        value={payOrderNo}
                        onChange={(e) => setPayOrderNo(e.target.value)}
                        placeholder="Enter pay order number"
                        className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Date */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Payment Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" />
                        Recording Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-3">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-[#64748B]">Select the bill type (Electricity, Water, or Rent).</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-[#64748B]">Enter the utility bill ID and search to load bill details.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-sm text-[#64748B]">Enter the payment amount and select the mode of payment.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                <p className="text-sm text-[#64748B]">For Cheque or Pay Order, select the bank and enter the reference number.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</div>
                <p className="text-sm text-[#64748B]">Select the payment date and submit to record the transaction.</p>
              </div>
            </div>
          </div>

          {billDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5">
              <h3 className="text-sm font-semibold text-[#1E293B] mb-3">Payment Preview</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Bill Type</span>
                  <span className="font-medium text-[#1E293B]">{billType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Bill ID</span>
                  <span className="font-medium text-[#1E293B]">#{utilityId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Company</span>
                  <span className="font-medium text-[#1E293B]">{billDetails.companyName}</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm border-t border-[#E2E8F0] pt-2">
                    <span className="text-[#64748B]">Paying</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                )}
                {modeOfPayment && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Mode</span>
                    <span className="font-medium text-[#1E293B]">{modeOfPayment}</span>
                  </div>
                )}
                {paymentDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Date</span>
                    <span className="font-medium text-[#1E293B]">
                      {new Date(paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}