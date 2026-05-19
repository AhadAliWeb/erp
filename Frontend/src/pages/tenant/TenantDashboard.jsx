import { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Home,
  Receipt,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getTenantDashboard } from "../../api/dashboardApi";

const DEFAULT_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

function StatusBadge({ label, variant = 'default' }) {
  const variants = {
    paid: { bg: '#DCFCE7', text: '#16A34A' },
    'partially paid': { bg: '#FEF9C3', text: '#CA8A04' },
    unpaid: { bg: '#FEE2E2', text: '#DC2626' },
    electricity: { bg: '#FEF3C7', text: '#D97706' },
    water: { bg: '#DBEAFE', text: '#2563EB' },
    rent: { bg: '#D1FAE5', text: '#059669' },
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

function StatCard({ title, value, prefix = '', icon, iconBg = 'bg-blue-100', iconColor = 'text-blue-600' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 flex items-center gap-4 border-l-4 border-l-[#002365]">
      <div className={`p-3 rounded-lg shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1E293B] leading-none">
          {prefix}{value}
        </p>
        <p className="text-sm text-[#64748B] mt-1">{title}</p>
      </div>
    </div>
  );
}

function RevenueChart({ type = 'bar', data = [], title, dataKey = 'value', nameKey = 'name', colors = DEFAULT_COLORS, multiKeys = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
      {title && (
        <h3 className="text-sm font-semibold text-[#1E293B] mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 13 }}
            />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={data} barCategoryGap="30%">
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 13 }}
              cursor={{ fill: '#F8FAFC' }}
              formatter={(val) => [`Rs. ${Number(val).toLocaleString()}`, '']}
            />
            {multiKeys.length > 0 ? (
              multiKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))
            ) : (
              <Bar dataKey={dataKey} fill={colors[0] || '#002365'} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function DataTable({ columns, data, emptyMessage = 'No data found' }) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
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
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#64748B]">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-[#1E293B]">
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4 p-4">
          {data.length === 0 ? (
            <p className="text-sm text-[#64748B] text-center py-6">{emptyMessage}</p>
          ) : (
            data.map((row, rowIdx) => (
              <div key={rowIdx} className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                      {col.label}
                    </span>
                    <div className="text-sm text-[#1E293B] text-right">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ paid, total }) {
  const percentage = total > 0 ? ((total - paid) / total) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#64748B]">Paid</span>
        <span className="text-[#64748B]">{Math.max(0, 100 - percentage).toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, 100 - percentage)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-emerald-600 font-medium">
          Rs. {Number(total - paid).toLocaleString()}
        </span>
        <span className="text-red-500 font-medium">
          Rs. {Number(paid).toLocaleString()} remaining
        </span>
      </div>
    </div>
  );
}

export default function TenantDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTenantDashboard();
    //   setData(response.data);
    setData({
  "outstandingSummary": {
    "electricity": 8250.00,
    "water": 18500.00,
    "rent": 180000.00
  },
  "activeBills": {
    "electricity": {
      "billingMonth": "April 2026",
      "totalAmount": 12000.00,
      "remainingAmount": 8250.00,
      "dueDate": "2026-06-05T00:00:00"
    },
    "water": {
      "billingMonth": "May 2026",
      "totalAmount": 25000.00,
      "remainingAmount": 18500.00,
      "dueDate": "2026-05-28T00:00:00"
    },
    "rent": {
      "billingMonth": "May 2026",
      "totalAmount": 240000.00,
      "remainingAmount": 180000.00,
      "dueDate": "2026-05-10T00:00:00"
    }
  },
  "agreementDetails": {
    "monthlyRent": 60000.00,
    "agreementDate": "2026-01-01T00:00:00",
    "endDate": "2026-12-31T00:00:00"
  },
  "recentPayments": [
    {
      "type": "Rent",
      "amount": 20000.00,
      "modeOfPayment": "Bank Transfer",
      "paymentDate": "2026-05-18T00:00:00",
      "createdAt": "2026-05-18T10:15:22.1234567"
    },
    {
      "type": "Rent",
      "amount": 20000.00,
      "modeOfPayment": "Cash",
      "paymentDate": "2026-05-15T00:00:00",
      "createdAt": "2026-05-15T14:42:11.7654321"
    },
    {
      "type": "Rent",
      "amount": 20000.00,
      "modeOfPayment": "Cheque",
      "paymentDate": "2026-05-10T00:00:00",
      "createdAt": "2026-05-10T09:30:45.9988776"
    },
    {
      "type": "Electricity",
      "amount": 3750.00,
      "modeOfPayment": "Online",
      "paymentDate": "2026-05-09T00:00:00",
      "createdAt": "2026-05-09T18:20:30.1122334"
    },
    {
      "type": "Water",
      "amount": 6500.00,
      "modeOfPayment": "Cash",
      "paymentDate": "2026-05-08T00:00:00",
      "createdAt": "2026-05-08T11:55:12.4455667"
    }
  ],
  "monthlyBillChart": [
    {
      "month": "May-2026",
      "electricity": 12000.00,
      "water": 25000.00,
      "rent": 60000.00
    },
    {
      "month": "Apr-2026",
      "electricity": 9800.00,
      "water": 21800.00,
      "rent": 60000.00
    },
    {
      "month": "Mar-2026",
      "electricity": 11000.00,
      "water": 24200.00,
      "rent": 60000.00
    },
    {
      "month": "Feb-2026",
      "electricity": 10250.00,
      "water": 23000.00,
      "rent": 60000.00
    },
    {
      "month": "Jan-2026",
      "electricity": 9500.00,
      "water": 20500.00,
      "rent": 60000.00
    },
    {
      "month": "Dec-2025",
      "electricity": 8900.00,
      "water": 19800.00,
      "rent": 55000.00
    }
  ],
  "currentMonthPaidVsOutstanding": {
    "paid": 70250.00,
    "outstanding": 206750.00
  }
})
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    return `Rs. ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusInfo = (remaining, total) => {
    if (remaining === 0) return { label: 'Paid', variant: 'paid' };
    if (remaining < total) return { label: 'Partially Paid', variant: 'partially paid' };
    return { label: 'Unpaid', variant: 'unpaid' };
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="text-sm text-[#64748B] mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const outstanding = data.outstandingSummary || {};
  const activeBills = data.activeBills || {};
  const agreement = data.agreementDetails || {};
  const recentPayments = data.recentPayments || [];
  const monthlyChart = data.monthlyBillChart || [];
  const paidVsOutstanding = data.currentMonthPaidVsOutstanding || { paid: 0, outstanding: 0 };

  const monthlyChartData = monthlyChart.map((item) => ({
    name: item.month,
    Electricity: item.electricity || 0,
    Water: item.water || 0,
    Rent: item.rent || 0,
  }));

  const paidVsOutstandingData = [
    { name: 'Paid', value: paidVsOutstanding.paid || 0 },
    { name: 'Outstanding', value: paidVsOutstanding.outstanding || 0 },
  ].filter((item) => item.value > 0);

  const daysUntilExpiry = getDaysUntilExpiry(agreement.endDate);

  const billCards = [
    {
      key: 'electricity',
      title: 'Electricity Bill',
      icon: <Zap size={20} />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      data: activeBills.electricity,
    },
    {
      key: 'water',
      title: 'Water Bill',
      icon: <Droplets size={20} />,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      data: activeBills.water,
    },
    {
      key: 'rent',
      title: 'Rent Bill',
      icon: <Home size={20} />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      data: activeBills.rent,
    },
  ];

  const recentPaymentsColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (val) => <StatusBadge label={val} variant={val?.toLowerCase()} />,
    },
    { key: 'amount', label: 'Amount', render: (val) => formatCurrency(val) },
    { key: 'modeOfPayment', label: 'Mode' },
    { key: 'paymentDate', label: 'Payment Date', render: (val) => formatDate(val) },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Tenant Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Overview of your bills, payments, and agreement details.</p>
        </div>
      </div>

      {/* Row 1 — Outstanding Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Electricity Outstanding"
          value={formatCurrency(outstanding.electricity).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Zap size={20} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Water Outstanding"
          value={formatCurrency(outstanding.water).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Droplets size={20} />}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Rent Outstanding"
          value={formatCurrency(outstanding.rent).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<Home size={20} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Row 2 — Active Bill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {billCards.map((bill) => {
          const d = bill.data;
          if (!d) return null;
          const status = getStatusInfo(d.remainingAmount, d.totalAmount);
          return (
            <div key={bill.key} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${bill.iconBg} ${bill.iconColor}`}>
                  {bill.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#1E293B]">{bill.title}</h3>
                </div>
                <StatusBadge label={status.label} variant={status.variant} />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Billing Month</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{d.billingMonth}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">Total</p>
                    <p className="text-sm font-semibold text-[#1E293B]">{formatCurrency(d.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] mb-0.5">Remaining</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(d.remainingAmount)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Due Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-[#64748B]" />
                    <p className="text-sm font-medium text-[#1E293B]">{formatDate(d.dueDate)}</p>
                  </div>
                </div>
                <ProgressBar paid={d.remainingAmount} total={d.totalAmount} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 3 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          type="bar"
          data={monthlyChartData}
          title="Monthly Bills"
          multiKeys={['Electricity', 'Water', 'Rent']}
          colors={['#F59E0B', '#3B82F6', '#10B981']}
        />
        <RevenueChart
          type="pie"
          data={paidVsOutstandingData}
          title="Paid vs Outstanding (This Month)"
          dataKey="value"
          nameKey="name"
          colors={['#10B981', '#EF4444']}
        />
      </div>

      {/* Row 4 — Agreement & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agreement Details */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1E293B] mb-4 flex items-center gap-2">
            <FileText size={16} className="text-[#002365]" />
            Agreement Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#F8FAFC] text-[#64748B]">
                <DollarSign size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Monthly Rent</p>
                <p className="text-sm font-semibold text-[#1E293B]">{formatCurrency(agreement.monthlyRent)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#F8FAFC] text-[#64748B]">
                <Calendar size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Agreement Date</p>
                <p className="text-sm font-semibold text-[#1E293B]">{formatDate(agreement.agreementDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#F8FAFC] text-[#64748B]">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">End Date</p>
                <p className="text-sm font-semibold text-[#1E293B]">{formatDate(agreement.endDate)}</p>
              </div>
            </div>
            {daysUntilExpiry !== null && (
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${daysUntilExpiry < 30 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Days Until Expiry</p>
                  <p className={`text-sm font-semibold ${daysUntilExpiry < 30 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : daysUntilExpiry === 0 ? 'Expires today' : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1E293B] mb-4">Recent Payments</h3>
          <DataTable
            columns={recentPaymentsColumns}
            data={recentPayments.slice(0, 5)}
            emptyMessage="No recent payments"
          />
        </div>
      </div>
    </div>
  );
}