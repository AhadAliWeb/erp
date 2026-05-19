import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { loginUser } from '../api/authApi';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      const token = res.data.token || res.data;
      dispatch(setCredentials(token));

      const decoded = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || '';
      

      if(role === 'Admin') navigate('/admin/dashboard');
      else if(role === 'Manager') navigate('/manager/dashboard');
      else if(role === 'Tenant') navigate('/tenant/dashboard');
      else navigate('/unauthorized');

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl bg-[#002365] p-4 text-white mb-4 shadow-md">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Tenant</h1>
          <p className="text-sm text-[#64748B] mt-1">Property & Tenant Management System</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-6">Sign in to your account</h2>

            {
                error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="flex-1">{error}</span>
                    {onDismiss && (
                        <button onClick={() => setError('')} className="shrink-0 hover:text-red-900 transition-colors">
                        <X size={14} />
                        </button>
                    )}
                </div>)
            }


          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@erp.com"
                className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002365] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#002365] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#002365] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#0033A0] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Spinner size="sm" color="text-white" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Login Credentials Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#002365]"></div>
              <span className="text-xs font-semibold text-[#1E293B] uppercase tracking-wide">Admin</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#64748B]"><span className="font-medium">Email:</span> admin@erp.com</p>
              <p className="text-xs text-[#64748B]"><span className="font-medium">Password:</span> Admin@123</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#0033A0]"></div>
              <span className="text-xs font-semibold text-[#1E293B] uppercase tracking-wide">Manager</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#64748B]"><span className="font-medium">Email:</span> manager@erp.com</p>
              <p className="text-xs text-[#64748B]"><span className="font-medium">Password:</span> Manager@123</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#64748B]"></div>
              <span className="text-xs font-semibold text-[#1E293B] uppercase tracking-wide">Tenant</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#64748B]"><span className="font-medium">Email:</span> tenant@erp.com</p>
              <p className="text-xs text-[#64748B]"><span className="font-medium">Password:</span> Tenant@123</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}