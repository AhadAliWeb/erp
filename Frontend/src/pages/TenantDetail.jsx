import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, FileText, Zap, Droplets, Home, Calendar, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTenantById, reAgreementTenant, reAgreementHistory } from "../api/tenantApi";
import { currentElectricityBill, currentWaterBill, currentRentBill } from "../api/utilityApi";
import Badge from "../components/Badge";
import Loader from "../components/Loader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useSelector } from 'react-redux';

const TABS = [
  { id: 'current-bills', label: 'Current Bills' },
  { id: 'bill-history', label: 'Bill History' },
  { id: 'reagreement-history', label: 'Re-Agreement History' },
];

const BILL_HISTORY_SUB_TABS = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'water', label: 'Water' },
  { id: 'rent', label: 'Rent' },
];

export default function TenantDetail() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const { role } = useSelector((s) => s.auth.user);

  console.log(role);
  

  const [tenant, setTenant] = useState(null);
  const [currentBills, setCurrentBills] = useState({ electricity: null, water: null, rent: null });
  const [reAgreementData, setReAgreementData] = useState([]);
  const [activeTab, setActiveTab] = useState('current-bills');
  const [activeBillSubTab, setActiveBillSubTab] = useState('electricity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-Agreement Modal State
  const [showReAgreementModal, setShowReAgreementModal] = useState(false);
  const [reAgreementForm, setReAgreementForm] = useState({
    monthlyRent: '',
    yearlyIncrement: '',
    agreementDate: '',
    endDate: '',
  });
  const [isSavingReAgreement, setIsSavingReAgreement] = useState(false);

  useEffect(() => {
    fetchTenantData();
  }, [tenantId]);

  const fetchTenantData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tenantRes, elecRes, waterRes, rentRes, reAgreeRes] = await Promise.all([
        getTenantById(tenantId),
        currentElectricityBill(tenantId),
        currentWaterBill(tenantId),
        currentRentBill(tenantId),
        reAgreementHistory(tenantId),
      ]);

      setTenant(tenantRes.data);
      setCurrentBills({
        electricity: elecRes.data,
        water: waterRes.data,
        rent: rentRes.data,
      });
      setReAgreementData(reAgreeRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenant details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReAgreementSubmit = async (e) => {
    e.preventDefault();
    setIsSavingReAgreement(true);
    try {
      const payload = {
        monthlyRent: parseFloat(reAgreementForm.monthlyRent) || 0,
        yearlyIncrement: parseFloat(reAgreementForm.yearlyIncrement) || 0,
        agreementDate: new Date(reAgreementForm.agreementDate).toISOString(),
        endDate: new Date(reAgreementForm.endDate).toISOString(),
      };
      await reAgreementTenant(tenantId, payload);
      setShowReAgreementModal(false);
      setReAgreementForm({ monthlyRent: '', yearlyIncrement: '', agreementDate: '', endDate: '' });
      // Refresh data
      const reAgreeRes = await reAgreementHistory(tenantId);
      setReAgreementData(reAgreeRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create re-agreement');
    } finally {
      setIsSavingReAgreement(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'paid': return 'success';
      case 'partially paid': return 'warning';
      case 'unpaid': return 'danger';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <Loader fullPage message="Loading tenant details..." />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error || 'Tenant not found'}</p>
          <button
            onClick={() => {

              if (role === 'Admin') navigate('/admin/tenants');
              else if (role === 'Manager') navigate('/manager/tenants');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const billCards = [
    {
      key: 'electricity',
      title: 'Electricity Bill',
      icon: <Zap size={20} />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      data: currentBills.electricity,
    },
    {
      key: 'water',
      title: 'Water Bill',
      icon: <Droplets size={20} />,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      data: currentBills.water,
    },
    {
      key: 'rent',
      title: 'Rent Bill',
      icon: <Home size={20} />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      data: currentBills.rent,
    },
  ];

  const reAgreementColumns = [
    { key: 'monthlyRent', label: 'Monthly Rent', render: (val) => formatCurrency(val) },
    { key: 'yearlyIncrement', label: 'Yearly Increment', render: (val) => `${val}%` },
    { key: 'agreementDate', label: 'Agreement Date', render: (val) => formatDate(val) },
    { key: 'endDate', label: 'End Date', render: (val) => formatDate(val) },
    { key: 'createdAt', label: 'Created At', render: (val) => formatDate(val) },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => role === "Admin" ? navigate('/admin/tenants') : navigate('/manager/tenants')}
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#002365] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to Tenants
      </button>

      {/* Tenant Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#002365] text-white shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">{tenant.company}</h1>
                <Badge label={tenant.status || 'Active'} variant={getStatusVariant(tenant.status)} />
              </div>
              <p className="text-sm text-[#64748B] mt-1">{tenant.category} · {tenant.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReAgreementModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={15} />
              Re-Agreement
            </button>
            <button
              onClick={() => navigate(`/manager/tenants/${tenantId}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors"
            >
              <Pencil size={15} />
              Edit
            </button>
          </div>
        </div>

        {/* Tenant Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Contact Person</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{tenant.contactPerson || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Contact Number</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{tenant.contactNumber || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Monthly Rent</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{formatCurrency(tenant.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Increment %</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{tenant.incrementPercentage ? `${tenant.incrementPercentage}%` : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Agreement Date</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{formatDate(tenant.agreementDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">End Date</p>
            <p className="text-sm font-semibold text-[#1E293B] mt-1">{formatDate(tenant.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Outstanding Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Electricity Outstanding"
          value={formatCurrency(tenant.electricityOutstanding).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Zap size={20} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Water Outstanding"
          value={formatCurrency(tenant.waterOutstanding).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Droplets size={20} />}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Rent Outstanding"
          value={formatCurrency(tenant.rentOutstanding).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Home size={20} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'bill-history') setActiveBillSubTab('electricity'); }}
              className={`px-4 sm:px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-[#002365] border-[#002365]'
                  : 'text-[#64748B] border-transparent hover:text-[#1E293B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Current Bills Tab */}
          {activeTab === 'current-bills' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {billCards.map((bill) => (
                <div key={bill.key} className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${bill.iconBg} ${bill.iconColor}`}>
                      {bill.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-[#1E293B]">{bill.title}</h3>
                  </div>

                  {bill.data ? (
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Billing Month</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{bill.data.billingMonth || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Total Amount</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{formatCurrency(bill.data.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Remaining</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{formatCurrency(bill.data.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Due Date</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{formatDate(bill.data.dueDate)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Status</p>
                        <Badge label={bill.data.status || 'Unpaid'} variant={getStatusVariant(bill.data.status)} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-sm text-[#64748B]">No current bill</p>
                    </div>
                  )}

                  {bill.data && (
                    <button
                      onClick={() => navigate(`/manager/payments/new?utilityId=${bill.data.id}`)}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors"
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bill History Tab */}
          {activeTab === 'bill-history' && (
            <div>
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {BILL_HISTORY_SUB_TABS.map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveBillSubTab(subTab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeBillSubTab === subTab.id
                        ? 'bg-[#002365] text-white'
                        : 'bg-gray-100 text-[#64748B] hover:bg-gray-200'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>
              <div className="text-center py-12">
                <p className="text-sm text-[#64748B]">Bill history for {activeBillSubTab} will be displayed here.</p>
              </div>
            </div>
          )}

          {/* Re-Agreement History Tab */}
          {activeTab === 'reagreement-history' && (
            <Table
              columns={reAgreementColumns}
              data={reAgreementData}
              emptyMessage="No re-agreement history found"
            />
          )}
        </div>
      </div>

      {/* Re-Agreement Modal */}
      {showReAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowReAgreementModal(false)} />
          <div className="relative bg-white rounded-xl shadow-lg border border-[#E2E8F0] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1E293B]">Re-Agreement</h2>
              <button
                onClick={() => setShowReAgreementModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReAgreementSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={reAgreementForm.monthlyRent}
                  onChange={(e) => setReAgreementForm((prev) => ({ ...prev, monthlyRent: e.target.value }))}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  placeholder="Enter monthly rent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Yearly Increment (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={reAgreementForm.yearlyIncrement}
                  onChange={(e) => setReAgreementForm((prev) => ({ ...prev, yearlyIncrement: e.target.value }))}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                  placeholder="Enter yearly increment %"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  Agreement Date
                </label>
                <input
                  type="date"
                  required
                  value={reAgreementForm.agreementDate}
                  onChange={(e) => setReAgreementForm((prev) => ({ ...prev, agreementDate: e.target.value }))}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={reAgreementForm.endDate}
                  onChange={(e) => setReAgreementForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 px-3 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingReAgreement}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors disabled:opacity-50"
                >
                  {isSavingReAgreement ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save size={15} />
                  )}
                  {isSavingReAgreement ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReAgreementModal(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#64748B] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}