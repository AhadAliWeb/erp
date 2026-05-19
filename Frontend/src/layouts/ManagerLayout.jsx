import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard,
  Users,
  Building2,
  Landmark,
  Zap,
  FileText,
  X,
  Menu,
  LogOut,
  Activity,
  Plus,
  EyeIcon,
  ChevronDown,
  Droplet,
  BadgeDollarSign,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Badge from '../components/Badge';

const navLinks = [
  { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
  { label: 'Tenants', path: '/manager/tenants', icon: Building2 },
  {
    label: 'Electricity',
    icon: Zap,
    sublinks: [
      { label: 'Create Bill', path: '/manager/electricity/create', icon: Plus },
      { label: 'View', path: '/manager/electricity/view', icon: EyeIcon },
    ],
  },
  {
    label: 'Water',
    icon: Droplet,
    sublinks: [
      { label: 'Create Bill', path: '/manager/water/create', icon: Plus },
      { label: 'View', path: '/manager/water/view', icon: EyeIcon },
    ],
  },
  {
    label: 'Rent',
    icon: Building2,
    sublinks: [
      { label: 'Create Bill', path: '/manager/rent/create', icon: Plus },
      { label: 'View', path: '/manager/rent/view', icon: EyeIcon },
    ],
  },
  { label: 'Payments', path: '/manager/payments/new', icon: BadgeDollarSign },
  { label: 'Reports', path: '/manager/reports', icon: FileText },
];

function SidebarItem({ link, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const hasSublinks = link.sublinks && link.sublinks.length > 0;

  if (hasSublinks) {
    return (
      <div
        className="group"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <button
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#CBD5E1] hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <link.icon size={18} />
            <span>{link.label}</span>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ${
            expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-0.5 pl-10 pr-2 py-1">
            {link.sublinks.map((sub) => (
              <NavLink
                key={sub.path}
                to={sub.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#002365] text-white font-medium'
                      : 'text-[#CBD5E1] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <sub.icon size={16} />
                <span>{sub.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      key={link.path}
      to={link.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
          isActive
            ? 'bg-[#002365] text-white font-medium'
            : 'text-[#CBD5E1] hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <link.icon size={18} />
      <span>{link.label}</span>
    </NavLink>
  );
}

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#001845] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[#002365] p-2 text-white">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-white leading-none block">Tenant MS</span>
              <span className="text-xs text-[#CBD5E1]">Manager Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-[#CBD5E1] hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => (
            <SidebarItem
              key={link.label}
              link={link}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#002365] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-[#CBD5E1] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white border-b border-[#E2E8F0] px-4 py-0 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#64748B] hover:bg-[#F5F7FA] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1E293B]">Property & Tenant Management</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-[#64748B]">{user?.name}</span>
              <Badge label="Manager" variant="info" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}