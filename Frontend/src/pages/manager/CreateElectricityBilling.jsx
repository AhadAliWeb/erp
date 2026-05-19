import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Zap,
  Building2,
  MapPin,
  Gauge,
  AlertTriangle,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getActiveTenants } from "../../api/tenantApi";
import { getCompanyDetails } from "../../api/utilityConfigApi";
import { createElectricityBill } from "../../api/billApi";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

export default function ElectricityBilling() {
  const navigate = useNavigate();
  const tenantInputRef = useRef(null);

  const [tenantId, setTenantId] = useState('');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [currentReading, setCurrentReading] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [billingYear, setBillingYear] = useState(new Date().getFullYear().toString());
  const [dueDate, setDueDate] = useState('');

  const [tenants, setTenants] = useState([]);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');

  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch tenants on mount
  useEffect(() => {
    fetchTenants();
  }, []);

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

  // Auto-fetch when tenantId changes (manual entry or selection)
  useEffect(() => {
    const id = parseInt(tenantId, 10);
    if (id && id > 0) {
      fetchCompanyDetails(id);
    } else {
      setCompanyDetails(null);
    }
  }, [tenantId]);

  const fetchCompanyDetails = async (id) => {
    setIsLoadingDetails(true);
    setError(null);
    try {
      const res = await getCompanyDetails(id);
      setCompanyDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || `Tenant #${id} not found`);
      setCompanyDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleTenantSelect = (tenant) => {
    setTenantId(tenant.id.toString());
    setShowTenantDropdown(false);
    setTenantSearch('');
    tenantInputRef.current?.focus();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!companyDetails) {
      setError('Please lookup a valid tenant first');
      return;
    }
    if (!currentReading || parseFloat(currentReading) < 0) {
      setError('Please enter a valid current reading');
      return;
    }
    if (!billingMonth || !billingYear) {
      setError('Please select billing month and year');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tenantId: parseInt(tenantId, 10),
        billingMonth: `${billingMonth} ${billingYear}`,
        previousReading: companyDetails.electricityPreviousReading || 0,
        currentReading: parseFloat(currentReading),
        dueDate: new Date(dueDate).toISOString(),
      };
      await createElectricityBill(payload);
      setToast({ message: 'Electricity Utility Created Successfully', type: 'success' });
      // Reset form
      setTenantId('');
      setCompanyDetails(null);
      setCurrentReading('');
      setBillingMonth('');
      setDueDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create electricity bill');
      setToast({ message: err.response?.data?.message || 'Failed to create electricity bill', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Zap size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Create Electricity Bill</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          Generate a new electricity utility bill by looking up a tenant and entering current meter reading.
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
          {/* Tenant Lookup Section */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
              <Search size={16} className="text-[#002365]" />
              Tenant Lookup
            </h2>

            <div className="space-y-4">
              {/* Tenant ID Input with Lookup */}
              <div className="relative">
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Tenant ID
                </label>
                <div className="flex gap-2">
                  <input
                    ref={tenantInputRef}
                    type="number"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="Enter Tenant ID or use lookup"
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowTenantDropdown(!showTenantDropdown);
                      setTenantSearch('');
                    }}
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
                            <div>
                              <p className="text-sm font-medium text-[#1E293B]">
                                {tenant.company || tenant.fullName || tenant.name}
                              </p>
                              <p className="text-xs text-[#64748B] mt-0.5">ID: {tenant.id}</p>
                            </div>
                            <ChevronRight size={14} className="text-[#64748B]" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Details (auto-filled) */}
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8 bg-[#F8FAFC] rounded-lg">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-[#64748B]">Loading details...</span>
                </div>
              ) : companyDetails ? (
                <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Building2 size={16} className="text-[#64748B] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Company</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{companyDetails.company || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[#64748B] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Address</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{companyDetails.address || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Gauge size={16} className="text-[#64748B] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Previous Reading</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{companyDetails.electricityPreviousReading ?? 0} units</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Outstanding</p>
                        <p className="text-sm font-semibold text-red-600">{formatCurrency(companyDetails.electricityOutstanding)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tenantId ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-500">No tenant found with ID {tenantId}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Billing Form */}
          {companyDetails && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-base font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
                <Zap size={16} className="text-amber-600" />
                Bill Details
              </h2>

              <div className="space-y-4">
                {/* Current Reading */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Current Reading
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={companyDetails.electricityPreviousReading || 0}
                    required
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value)}
                    placeholder="Enter current meter reading"
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  />
                  <p className="text-xs text-[#64748B] mt-1">
                    Previous: {companyDetails.electricityPreviousReading ?? 0} units
                    {currentReading && parseFloat(currentReading) >= (companyDetails.electricityPreviousReading || 0) && (
                      <span className="text-emerald-600 ml-2">
                        Units used: {parseFloat(currentReading) - (companyDetails.electricityPreviousReading || 0)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Billing Month */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                      Billing Month
                    </label>
                    <select
                      required
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
                    >
                      <option value="">Select Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                      Year
                    </label>
                    <select
                      required
                      value={billingYear}
                      onChange={(e) => setBillingYear(e.target.value)}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors appearance-none"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
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
                        Creating Bill...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Create Electricity Bill
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right: Summary / Help */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-3">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-[#64748B]">Enter a Tenant ID or use the Lookup button to search and select a tenant.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-[#64748B]">Tenant details including previous reading and outstanding amount auto-fill.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-sm text-[#64748B]">Enter the current meter reading, select billing month/year, and set a due date.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#002365] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                <p className="text-sm text-[#64748B]">Submit to generate the electricity bill. The system calculates units consumed automatically.</p>
              </div>
            </div>
          </div>

          {companyDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5">
              <h3 className="text-sm font-semibold text-[#1E293B] mb-3">Bill Preview</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Tenant</span>
                  <span className="font-medium text-[#1E293B]">{companyDetails.company}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Previous Reading</span>
                  <span className="font-medium text-[#1E293B]">{companyDetails.electricityPreviousReading ?? 0} units</span>
                </div>
                {currentReading && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Current Reading</span>
                      <span className="font-medium text-[#1E293B]">{currentReading} units</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-[#E2E8F0] pt-2">
                      <span className="text-[#64748B]">Units Consumed</span>
                      <span className="font-semibold text-[#002365]">
                        {parseFloat(currentReading) - (companyDetails.electricityPreviousReading || 0)} units
                      </span>
                    </div>
                  </>
                )}
                {billingMonth && billingYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Billing Period</span>
                    <span className="font-medium text-[#1E293B]">{billingMonth} {billingYear}</span>
                  </div>
                )}
                {dueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Due Date</span>
                    <span className="font-medium text-[#1E293B]">{new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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