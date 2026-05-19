import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Zap,
  Droplets,
  Home,
  ArrowRight,
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
import { getManagerDashboard } from "../../api/dashboardApi";

const DEFAULT_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];
const STATUS_BADGES = {
  paid: { bg: '#DCFCE7', text: '#16A34A', label: 'Paid' },
  'partially paid': { bg: '#FEF9C3', text: '#CA8A04', label: 'Partially Paid' },
  unpaid: { bg: '#FEE2E2', text: '#DC2626', label: 'Unpaid' },
  active: { bg: '#DCFCE7', text: '#16A34A', label: 'Active' },
  inactive: { bg: '#F1F5F9', text: '#64748B', label: 'Inactive' },
};

function StatusBadge({ label }) {
  const key = label?.toLowerCase();
  const style = STATUS_BADGES[key] || { bg: '#F1F5F9', text: '#64748B', label };
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function Spinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-[3px]' : 'h-6 w-6 border-2';
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-[#002365] ${sizeClass}`}
      role="status"
      aria-label="Loading"
    />
  );
}

function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
      <Spinner size="lg" />
      <p className="text-sm text-[#64748B] font-medium">{message}</p>
    </div>
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

export default function ManagerDashboard() {
  const navigate = useNavigate();
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
      const response = await getManagerDashboard();
    //   setData(response.data);

    setData({
  "collectionToday": 125000,
  "collectionThisMonth": 2875000,
  "overdueBillsCount": 18,
  "activeTenantCount": 45,
  "overdueBills": [
    {
      "tenantName": "ABC Corp",
      "type": "Electricity",
      "overdueSince": "2025-04-15",
      "amount": 22000
    },
    {
      "tenantName": "XYZ Ltd",
      "type": "Rent",
      "overdueSince": "2025-03-28",
      "amount": 185000
    },
    {
      "tenantName": "Prime Traders",
      "type": "Water",
      "overdueSince": "2025-04-02",
      "amount": 12000
    },
    {
      "tenantName": "BlueSky Enterprises",
      "type": "Electricity",
      "overdueSince": "2025-04-10",
      "amount": 34000
    },
    {
      "tenantName": "Metro Solutions",
      "type": "Rent",
      "overdueSince": "2025-03-15",
      "amount": 145000
    },
    {
      "tenantName": "Global Tech",
      "type": "Water",
      "overdueSince": "2025-04-05",
      "amount": 9000
    },
    {
      "tenantName": "Sunrise Foods",
      "type": "Electricity",
      "overdueSince": "2025-04-20",
      "amount": 28000
    },
    {
      "tenantName": "Nova Marketing",
      "type": "Rent",
      "overdueSince": "2025-03-18",
      "amount": 98000
    },
    {
      "tenantName": "Alpha Logistics",
      "type": "Electricity",
      "overdueSince": "2025-04-12",
      "amount": 41000
    },
    {
      "tenantName": "City Mart",
      "type": "Water",
      "overdueSince": "2025-04-07",
      "amount": 15000
    },
    {
      "tenantName": "Vertex Media",
      "type": "Rent",
      "overdueSince": "2025-03-25",
      "amount": 112000
    },
    {
      "tenantName": "Orbit Solutions",
      "type": "Electricity",
      "overdueSince": "2025-04-14",
      "amount": 36000
    },
    {
      "tenantName": "Titan Industries",
      "type": "Water",
      "overdueSince": "2025-04-09",
      "amount": 17000
    },
    {
      "tenantName": "Evergreen Pvt Ltd",
      "type": "Rent",
      "overdueSince": "2025-03-11",
      "amount": 132000
    },
    {
      "tenantName": "NextGen Labs",
      "type": "Electricity",
      "overdueSince": "2025-04-17",
      "amount": 25000
    },
    {
      "tenantName": "FastTrack Ltd",
      "type": "Water",
      "overdueSince": "2025-04-08",
      "amount": 14000
    },
    {
      "tenantName": "Urban Retail",
      "type": "Rent",
      "overdueSince": "2025-03-30",
      "amount": 156000
    },
    {
      "tenantName": "SilverLine Group",
      "type": "Electricity",
      "overdueSince": "2025-04-21",
      "amount": 30000
    }
  ],
  "recentPayments": [
    {
      "type": "Electricity",
      "amount": 5000,
      "modeOfPayment": "Cash",
      "paymentDate": "2025-05-01",
      "createdAt": "2025-05-01"
    },
    {
      "type": "Rent",
      "amount": 85000,
      "modeOfPayment": "Bank Transfer",
      "paymentDate": "2025-05-03",
      "createdAt": "2025-05-03"
    },
    {
      "type": "Water",
      "amount": 12000,
      "modeOfPayment": "Cheque",
      "paymentDate": "2025-05-04",
      "createdAt": "2025-05-04"
    },
    {
      "type": "Electricity",
      "amount": 18000,
      "modeOfPayment": "Online",
      "paymentDate": "2025-05-06",
      "createdAt": "2025-05-06"
    },
    {
      "type": "Rent",
      "amount": 125000,
      "modeOfPayment": "Bank Transfer",
      "paymentDate": "2025-05-08",
      "createdAt": "2025-05-08"
    },
    {
      "type": "Water",
      "amount": 9000,
      "modeOfPayment": "Cash",
      "paymentDate": "2025-05-09",
      "createdAt": "2025-05-09"
    },
    {
      "type": "Electricity",
      "amount": 15000,
      "modeOfPayment": "Online",
      "paymentDate": "2025-05-10",
      "createdAt": "2025-05-10"
    },
    {
      "type": "Rent",
      "amount": 95000,
      "modeOfPayment": "Cheque",
      "paymentDate": "2025-05-12",
      "createdAt": "2025-05-12"
    },
    {
      "type": "Electricity",
      "amount": 25000,
      "modeOfPayment": "Bank Transfer",
      "paymentDate": "2025-05-14",
      "createdAt": "2025-05-14"
    },
    {
      "type": "Water",
      "amount": 11000,
      "modeOfPayment": "Cash",
      "paymentDate": "2025-05-15",
      "createdAt": "2025-05-15"
    }
  ],
  "topOutstandingTenants": [
    {
      "tenantName": "XYZ Ltd",
      "totalOutstanding": 185000
    },
    {
      "tenantName": "Urban Retail",
      "totalOutstanding": 156000
    },
    {
      "tenantName": "Metro Solutions",
      "totalOutstanding": 145000
    },
    {
      "tenantName": "Evergreen Pvt Ltd",
      "totalOutstanding": 132000
    },
    {
      "tenantName": "Vertex Media",
      "totalOutstanding": 112000
    }
  ],
  "monthlyCollectionChart": [
    {
      "month": "Dec-2024",
      "electricity": 180000,
      "water": 45000,
      "rent": 210000
    },
    {
      "month": "Jan-2025",
      "electricity": 220000,
      "water": 52000,
      "rent": 260000
    },
    {
      "month": "Feb-2025",
      "electricity": 240000,
      "water": 61000,
      "rent": 275000
    },
    {
      "month": "Mar-2025",
      "electricity": 265000,
      "water": 58000,
      "rent": 290000
    },
    {
      "month": "Apr-2025",
      "electricity": 310000,
      "water": 72000,
      "rent": 340000
    },
    {
      "month": "May-2025",
      "electricity": 295000,
      "water": 69000,
      "rent": 328000
    }
  ],
  "overdueBillsByTypeChart": {
    "electricity": 7,
    "water": 5,
    "rent": 6
  },
  "topOutstandingChart": [
    {
      "name": "XYZ Ltd",
      "amount": 185000
    },
    {
      "name": "Urban Retail",
      "amount": 156000
    },
    {
      "name": "Metro Solutions",
      "amount": 145000
    },
    {
      "name": "Evergreen Pvt Ltd",
      "amount": 132000
    },
    {
      "name": "Vertex Media",
      "amount": 112000
    }
  ]
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

  const getTypeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'electricity': return 'warning';
      case 'water': return 'info';
      case 'rent': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <FullPageLoader message="Loading dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error || 'Failed to load dashboard'}</p>
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

  const monthlyCollectionData = (data.monthlyCollectionChart || []).map((item) => ({
    name: item.month,
    Electricity: item.electricity || 0,
    Water: item.water || 0,
    Rent: item.rent || 0,
  }));

  const overdueByTypeData = [
    { name: 'Electricity', value: data.overdueBillsByTypeChart?.electricity || 0 },
    { name: 'Water', value: data.overdueBillsByTypeChart?.water || 0 },
    { name: 'Rent', value: data.overdueBillsByTypeChart?.rent || 0 },
  ].filter((item) => item.value > 0);

  const topOutstandingData = (data.topOutstandingChart || []).map((item) => ({
    name: item.name,
    value: item.amount || 0,
  }));

  const recentPaymentsColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (val) => <StatusBadge label={val} />,
    },
    { key: 'amount', label: 'Amount', render: (val) => formatCurrency(val) },
    { key: 'modeOfPayment', label: 'Mode' },
    { key: 'paymentDate', label: 'Date', render: (val) => formatDate(val) },
  ];

  const overdueBillsColumns = [
    { key: 'tenantName', label: 'Tenant Name' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <StatusBadge label={val} />,
    },
    { key: 'overdueSince', label: 'Overdue Since', render: (val) => formatDate(val) },
    { key: 'amount', label: 'Amount', render: (val) => formatCurrency(val) },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Manager Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Overview of collections, bills, and tenant activity.</p>
        </div>
      </div>

      {/* Row 1 — Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collection Today"
          value={formatCurrency(data.collectionToday).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Collection This Month"
          value={formatCurrency(data.collectionThisMonth).replace('Rs. ', '')}
          prefix="Rs. "
          icon={<TrendingUp size={20} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Overdue Bills"
          value={data.overdueBillsCount || 0}
          icon={<AlertTriangle size={20} />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          title="Active Tenants"
          value={data.activeTenantCount || 0}
          icon={<Users size={20} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Row 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          type="bar"
          data={monthlyCollectionData}
          title="Monthly Collection"
          multiKeys={['Electricity', 'Water', 'Rent']}
          colors={['#F59E0B', '#3B82F6', '#10B981']}
        />
        <RevenueChart
          type="pie"
          data={overdueByTypeData}
          title="Overdue Bills By Type"
          dataKey="value"
          nameKey="name"
          colors={['#F59E0B', '#3B82F6', '#10B981']}
        />
      </div>

      {/* Row 3 — Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          type="bar"
          data={topOutstandingData}
          title="Top Outstanding Tenants"
          dataKey="value"
          nameKey="name"
          colors={['#EF4444']}
        />
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1E293B]">Recent Payments</h3>
            <button
              onClick={() => navigate('/manager/payments')}
              className="flex items-center gap-1 text-xs font-medium text-[#002365] hover:text-[#0033A0] transition-colors"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <DataTable
            columns={recentPaymentsColumns}
            data={(data.recentPayments || []).slice(0, 10)}
            emptyMessage="No recent payments"
          />
        </div>
      </div>

      {/* Row 4 — Overdue Bills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1E293B]">Overdue Bills</h3>
          <button
            onClick={() => navigate('/manager/bills?filter=overdue')}
            className="flex items-center gap-1 text-xs font-medium text-[#002365] hover:text-[#0033A0] transition-colors"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <DataTable
          columns={overdueBillsColumns}
          data={data.overdueBills || []}
          emptyMessage="No overdue bills"
        />
      </div>
    </div>
  );
}