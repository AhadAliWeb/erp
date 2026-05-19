import { useEffect, useState } from 'react';
import {
  TrendingUp, AlertCircle, Landmark, Building2,
  DollarSign, Users
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { getAdminDashboard } from '../../api/dashboardApi';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';


const PIE_COLORS = ['#3B82F6', '#22C55E', '#002365', '#F59E0B'];

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n ?? 0);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDashboard();
        // setData(res.data);
        setData({
  "totalRevenueThisMonth": 1245850.00,
  "totalOutstandingAllTenants": 412340.00,
  "totalBankBalance": 2867500.00,
  "activeTenantCount": 18,
  "systemOverdueCount": 4,

  "bankSummary": [
    {
      "bankName": "Meezan Bank",
      "accountNumber": "233442",
      "currentBalance": 1240000.00
    },
    {
      "bankName": "HBL",
      "accountNumber": "778921",
      "currentBalance": 845000.00
    },
    {
      "bankName": "Bank Alfalah",
      "accountNumber": "552188",
      "currentBalance": 512500.00
    },
    {
      "bankName": "UBL",
      "accountNumber": "990144",
      "currentBalance": 270000.00
    }
  ],

  "userCollectionSummary": [
    {
      "userName": "Uzair",
      "totalThisMonth": 385000.00
    },
    {
      "userName": "Ahmed",
      "totalThisMonth": 312500.00
    },
    {
      "userName": "Fatima",
      "totalThisMonth": 276000.00
    },
    {
      "userName": "Ali",
      "totalThisMonth": 172350.00
    },
    {
      "userName": "Hassan",
      "totalThisMonth": 100000.00
    }
  ],

  "monthlyRevenueChart": [
    {
      "month": "May-2026",
      "total": 1245850.00
    },
    {
      "month": "Apr-2026",
      "total": 1182400.00
    },
    {
      "month": "Mar-2026",
      "total": 1098700.00
    },
    {
      "month": "Feb-2026",
      "total": 975500.00
    },
    {
      "month": "Jan-2026",
      "total": 902300.00
    },
    {
      "month": "Dec-2025",
      "total": 845200.00
    }
  ],

  "revenueByTypeChart": {
    "electricity": 182500.00,
    "water": 94500.00,
    "rent": 893000.00,
    "commission": 75850.00
  },

  "bankBalanceChart": [
    {
      "bankName": "Meezan Bank",
      "balance": 1240000.00
    },
    {
      "bankName": "HBL",
      "balance": 845000.00
    },
    {
      "bankName": "Bank Alfalah",
      "balance": 512500.00
    },
    {
      "bankName": "UBL",
      "balance": 270000.00
    }
  ],

  "collectionEfficiencyChart": [
    {
      "month": "May-2026",
      "billed": 1380000.00,
      "collected": 1245850.00
    },
    {
      "month": "Apr-2026",
      "billed": 1295000.00,
      "collected": 1182400.00
    },
    {
      "month": "Mar-2026",
      "billed": 1170000.00,
      "collected": 1098700.00
    },
    {
      "month": "Feb-2026",
      "billed": 1050000.00,
      "collected": 975500.00
    },
    {
      "month": "Jan-2026",
      "billed": 980000.00,
      "collected": 902300.00
    },
    {
      "month": "Dec-2025",
      "billed": 910000.00,
      "collected": 845200.00
    }
  ]
}) 
      
} catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="relative h-64"><Loader message="Loading dashboard..." /></div>;
  if (error) return (<div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="flex-1">{error}</span>
                    {onDismiss && (
                        <button onClick={() => setError('')} className="shrink-0 hover:text-red-900 transition-colors">
                        <X size={14} />
                        </button>
                    )}
                </div>);
  if (!data) return null;

  const revenueByTypeData = data.revenueByTypeChart
    ? Object.entries(data.revenueByTypeChart).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[#1E293B]">Dashboard</h1>

      {/* Row 1 — Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Revenue This Month"
          value={`PKR ${fmt(data.totalRevenueThisMonth)}`}
          icon={<TrendingUp size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Outstanding"
          value={`PKR ${fmt(data.totalOutstandingAllTenants)}`}
          icon={<AlertCircle size={22} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Total Bank Balance"
          value={`PKR ${fmt(data.totalBankBalance)}`}
          icon={<Landmark size={22} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Active Tenants"
          value={`${data.activeTenantCount} / ${data.systemOverdueCount} overdue`}
          icon={<Building2 size={22} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Row 2 — Line + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthlyRevenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="total" stroke="#002365" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={revenueByTypeData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} paddingAngle={2}>
                {revenueByTypeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Collection Efficiency (Billed vs Collected)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.collectionEfficiencyChart} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="billed" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Billed" />
              <Bar dataKey="collected" fill="#22C55E" radius={[3, 3, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bank Balance">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bankBalanceChart} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="bankName" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `PKR ${v.toLocaleString()}`} />
              <Bar dataKey="balance" fill="#002365" radius={[4, 4, 0, 0]} name="Balance" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 — Summary tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SummaryTable
          title="Bank Summary"
          columns={['Bank Name', 'Account Number', 'Current Balance']}
          rows={(data.bankSummary || []).map((b) => [
            b.bankName,
            b.accountNumber,
            `PKR ${(b.currentBalance || 0).toLocaleString()}`,
          ])}
        />
        <SummaryTable
          title="User Collection Summary"
          columns={['User Name', 'Total Collected This Month']}
          rows={(data.userCollectionSummary || []).map((u) => [
            u.userName,
            `PKR ${(u.totalThisMonth || 0).toLocaleString()}`,
          ])}
        />
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-5 transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-sm font-semibold text-[#1E293B] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SummaryTable({ title, columns, rows }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="px-5 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-sm font-semibold text-[#1E293B]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#002365]">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-[#64748B]">
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className={`border-b border-[#E2E8F0] transition-colors duration-100 hover:bg-[#F8FAFC] ${i % 2 === 1 ? 'bg-[#F8FAFC]' : ''}`}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-[#1E293B]">{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}