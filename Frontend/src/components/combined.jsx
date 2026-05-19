//Badge.jsx
const variantClasses = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ label, variant = 'default' }) {
  const classes = variantClasses[variant] || variantClasses.default;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium inline-block ${classes}`}>
      {label}
    </span>
  );
}


//Loader.jsx
import Spinner from './Spinner';

export default function Loader({ fullPage = false, message = 'Loading...' }) {
  const base = 'flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm z-40';
  const positionClass = fullPage
    ? 'fixed inset-0'
    : 'absolute inset-0';

  return (
    <div className={`${base} ${positionClass}`} role="status" aria-live="polite">
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      )}
    </div>
  );
}



// Navbar.jsx
import { LogOut, Menu } from 'lucide-react';
import Badge from './Badge';

export default function Navbar({
  title,
  user,
  role,
  onLogout,
  onMenuClick,
}) {

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-base font-semibold text-gray-800 sm:text-lg">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-medium text-gray-700">
            {user?.fullName}
          </span>

          <Badge label={role} variant="info" />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={18} />

          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}


//Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, dataLength, limit, onPageChange }) {
  const isFirst = currentPage <= 1;
  // const isLast  = currentPage >= totalPages;

  const hasNextPage = dataLength === limit;

  const btnBase = 'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors';
  const btnActive = 'border-gray-300 text-gray-700 hover:bg-gray-50';
  const btnDisabled = 'border-gray-100 text-gray-300 cursor-not-allowed';

  return (
    <div className="flex items-center gap-3 mt-4 justify-end">
      <button
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        disabled={isFirst}
        className={`${btnBase} ${isFirst ? btnDisabled : btnActive}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
        <span>Prev</span>
      </button>

      <span className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-800">{currentPage}</span>
      </span>

      <button
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`${btnBase} ${!hasNextPage ? btnDisabled : btnActive}`}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}


//RevenueChart.jsx
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const DEFAULT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function RevenueChart({
  type = 'bar',
  data = [],
  title,
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_COLORS,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
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
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={data} barCategoryGap="30%">
            <XAxis
              dataKey={nameKey}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 13 }}
              cursor={{ fill: '#F3F4F6' }}
            />
            <Bar dataKey={dataKey} fill={colors[0] || '#2563EB'} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}





// Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { Activity, X } from 'lucide-react';

export default function Sidebar({
  links = [],
  role,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            <div className="rounded-lg bg-blue-600 p-1.5 text-white">
              <Activity size={18} />
            </div>

            <span className="text-base font-bold text-gray-800">
              MediCore HMS
            </span>
          </div>

          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role */}
        {role && (
          <p className="mb-6 px-2 text-xs font-medium uppercase tracking-widest text-blue-500">
            {role}
          </p>
        )}

        {/* Links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {Icon && <Icon size={18} />}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}


//Spinner.jsx
const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ size = 'md', color = 'text-blue-600' }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClass} ${color}`}
      role="status"
      aria-label="Loading"
    />
  );
}


//StatCard.jsx
export default function StatCard({ title, value, icon, iconBg = 'bg-blue-100', iconColor = 'text-blue-600', prefix = '' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      {/* Icon */}
      <div className={`p-3 rounded-lg shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {prefix}{value}
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}




//Table.jsx
import Loader from './Loader';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data found',
}) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Header */}
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center"
                  >
                    <div className="relative h-20">
                      <Loader message="Loading data..." />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {data.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col.label}
                  </span>

                  <div className="text-sm text-gray-700 text-right">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


