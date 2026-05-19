import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosInstance';
import { 
  Search, 
  Plus, 
  Loader2, 
  X, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ isActive }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-[#DCFCE7] text-[#16A34A]'
          : 'bg-[#F1F5F9] text-[#64748B]'
      }`}
    >
      {isActive ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const isManager = role === 'Manager';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isManager
          ? 'bg-[#DBEAFE] text-[#1E40AF]'
          : 'bg-[#F3E8FF] text-[#7C3AED]'
      }`}
    >
      <Shield className="w-3.5 h-3.5" />
      {role}
    </span>
  );
};

// Modal Component
const AddUserModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Manager',
    tenantId: null,
  });

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Manager',
      tenantId: null,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.role === 'Tenant' && !formData.tenantId) {
      newErrors.tenantId = 'Tenant ID is required for Tenant role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        tenantId: formData.role === 'Tenant' ? Number(formData.tenantId) : null,
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tenantId' ? (value === '' ? null : value) : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#1E293B]">Add New User</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#64748B] hover:text-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all ${
                  errors.name ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-[#EF4444]">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all ${
                  errors.email ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-[#EF4444]">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all ${
                  errors.password ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#EF4444]">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="Manager">Manager</option>
                <option value="Tenant">Tenant</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tenant ID - Conditional */}
          {formData.role === 'Tenant' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                Tenant ID
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="number"
                  name="tenantId"
                  value={formData.tenantId || ''}
                  onChange={handleChange}
                  placeholder="Enter tenant ID"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all ${
                    errors.tenantId ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.tenantId && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.tenantId}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#002365] text-sm font-medium text-white hover:bg-[#0033A0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/auth/users');
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Client-side search filter
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Create user handler
  const handleCreateUser = async (formData) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/auth/register', formData);
      setIsModalOpen(false);
      await fetchUsers(); // Refresh list
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user';
      alert(message); // You can replace with toast notification
      console.error('Error creating user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">User Management</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Manage system users and their roles
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002365] text-white text-sm font-medium rounded-lg hover:bg-[#0033A0] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-[#DC2626]" />
              </div>
              <p className="text-[#1E293B] font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-3 text-sm text-[#3B82F6] hover:text-[#002365] font-medium"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-[#64748B]" />
              </div>
              <p className="text-[#1E293B] font-medium">
                {searchQuery ? 'No users found' : 'No users available'}
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding a new user'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Tenant ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                            <span className="text-xs font-semibold text-[#1E40AF]">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-[#1E293B]">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {user.tenantId || (
                          <span className="text-[#94A3B8] italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with count */}
          {!isLoading && !error && filteredUsers.length > 0 && (
            <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <p className="text-xs text-[#64748B]">
                Showing {filteredUsers.length} of {users.length} user
                {users.length !== 1 ? 's' : ''}
                {searchQuery && ' (filtered)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default UserManagement;