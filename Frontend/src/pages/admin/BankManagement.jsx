import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, MinusCircle, Trash2, Landmark } from 'lucide-react';
import { getBanks, createBank, deductFromBank, deleteBank } from '../../api/bankApi';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import StatCard from '../../components/StatCard';

export default function BankManagement() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    bankName: '',
    bankAddress: '',
    branchCode: '',
    accountNumber: '',
    accountTitle: '',
    openingDate: '',
    openingBalance: 0,
  });

  const [deductForm, setDeductForm] = useState({
    bankId: null,
    amount: '',
    description: '',
  });

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await getBanks();
      setBanks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch banks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBank(addForm);
      setShowAddModal(false);
      setAddForm({
        bankName: '',
        bankAddress: '',
        branchCode: '',
        accountNumber: '',
        accountTitle: '',
        openingDate: '',
        openingBalance: 0,
      });
      fetchBanks();
    } catch (err) {
      console.error('Failed to create bank:', err);
      alert('Failed to create bank');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await deductFromBank(deductForm);
      setShowDeductModal(false);
      setDeductForm({ bankId: null, amount: '', description: '' });
      fetchBanks();
    } catch (err) {
      console.error('Failed to deduct:', err);
      alert('Failed to deduct amount');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank?')) return;
    try {
      await deleteBank(id);
      fetchBanks();
    } catch (err) {
      console.error('Failed to delete bank:', err);
      alert('Failed to delete bank');
    }
  };

  const openDeductModal = (bank) => {
    setSelectedBank(bank);
    setDeductForm({ bankId: bank.id, amount: '', description: '' });
    setShowDeductModal(true);
  };

  const totalBalance = banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0);
  const totalBanks = banks.length;

  const inputClass = 'w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-colors';
  const labelClass = 'block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1';

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#1E293B]">Bank Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002365] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0033A0] active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Bank
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Banks"
            value={totalBanks}
            icon={<Landmark size={22} />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Current Balance"
            value={totalBalance.toLocaleString()}
            icon={<Landmark size={22} />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            prefix="Rs. "
          />
        </div>

        {/* Bank Cards */}
        {loading ? (
          <div className="relative h-64">
            <Loader message="Loading banks..." />
          </div>
        ) : banks.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
            <Landmark size={48} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B] text-sm">No banks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#002365] text-white">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#1E293B]">{bank.bankName}</h3>
                      <p className="text-xs text-[#64748B]">{bank.accountTitle}</p>
                    </div>
                  </div>
                  <Badge
                    label={bank.isDeleted ? 'Inactive' : 'Active'}
                    variant={bank.isDeleted ? 'danger' : 'success'}
                  />
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Account Number</span>
                    <span className="font-medium text-[#1E293B]">{bank.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Current Balance</span>
                    <span className="font-semibold text-[#16A34A]">Rs. {bank.currentBalance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Opening Balance</span>
                    <span className="font-medium text-[#1E293B]">Rs. {bank.openingBalance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Opening Date</span>
                    <span className="font-medium text-[#1E293B]">{bank.openingDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => navigate(`/admin/bank/transactions/${bank.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] transition-colors hover:bg-[#F5F7FA]"
                  >
                    <Eye size={14} />
                    View Transactions
                  </button>
                  <button
                    onClick={() => openDeductModal(bank)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#FEF3C7] bg-[#FEF9C3] px-3 py-1.5 text-xs font-medium text-[#CA8A04] transition-colors hover:bg-[#FEF3C7]"
                  >
                    <MinusCircle size={14} />
                    Deduct
                  </button>
                  <button
                    onClick={() => handleDelete(bank.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#FEE2E2] bg-[#FEE2E2] px-3 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FECACA] ml-auto"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bank Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-[#1E293B]">Add New Bank</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl leading-none text-[#64748B]">&times;</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Bank Name</label>
                <input
                  type="text"
                  required
                  value={addForm.bankName}
                  onChange={(e) => setAddForm({ ...addForm, bankName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. HBL"
                />
              </div>

              <div>
                <label className={labelClass}>Bank Address</label>
                <input
                  type="text"
                  value={addForm.bankAddress}
                  onChange={(e) => setAddForm({ ...addForm, bankAddress: e.target.value })}
                  className={inputClass}
                  placeholder="Bank address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Branch Code</label>
                  <input
                    type="text"
                    value={addForm.branchCode}
                    onChange={(e) => setAddForm({ ...addForm, branchCode: e.target.value })}
                    className={inputClass}
                    placeholder="Branch code"
                  />
                </div>
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input
                    type="text"
                    required
                    value={addForm.accountNumber}
                    onChange={(e) => setAddForm({ ...addForm, accountNumber: e.target.value })}
                    className={inputClass}
                    placeholder="Account number"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Account Title</label>
                <input
                  type="text"
                  required
                  value={addForm.accountTitle}
                  onChange={(e) => setAddForm({ ...addForm, accountTitle: e.target.value })}
                  className={inputClass}
                  placeholder="Account title"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Opening Date</label>
                  <input
                    type="date"
                    required
                    value={addForm.openingDate}
                    onChange={(e) => setAddForm({ ...addForm, openingDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Opening Balance</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={addForm.openingBalance}
                    onChange={(e) => setAddForm({ ...addForm, openingBalance: Number(e.target.value) })}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F5F7FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-lg bg-[#002365] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0033A0] disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deduct Modal */}
      {showDeductModal && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1E293B]">Deduct from Bank</h2>
              <button
                onClick={() => setShowDeductModal(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl leading-none text-[#64748B]">&times;</span>
              </button>
            </div>

            <form onSubmit={handleDeductSubmit} className="p-6 space-y-4">
              <div className="bg-[#F5F7FA] rounded-lg p-3 mb-2">
                <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1">Selected Bank</p>
                <p className="text-sm font-semibold text-[#1E293B]">{selectedBank.bankName} — {selectedBank.accountTitle}</p>
                <p className="text-xs text-[#64748B]">Current Balance: Rs. {selectedBank.currentBalance?.toLocaleString()}</p>
              </div>

              <div>
                <label className={labelClass}>Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedBank.currentBalance}
                  value={deductForm.amount}
                  onChange={(e) => setDeductForm({ ...deductForm, amount: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={3}
                  value={deductForm.description}
                  onChange={(e) => setDeductForm({ ...deductForm, description: e.target.value })}
                  className={inputClass}
                  placeholder="Reason for deduction"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeductModal(false)}
                  className="w-full sm:w-auto rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F5F7FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D97706] disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Deduct Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}