import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Power, X, AlertTriangle, Loader2, Plus } from "lucide-react";
import {
  getActiveTenants,
  getInactiveTenants,
  deactivateTenant,
} from "../api/tenantApi";
import { useSelector } from "react-redux";

// ─── Reusable UI Components ─────────────────────────────────────────

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-[#F1F5F9] text-[#64748B]",
    active: "bg-[#DCFCE7] text-[#16A34A]",
    inactive: "bg-[#F1F5F9] text-[#64748B]",
    building: "bg-[#DBEAFE] text-[#1D4ED8]",
    shop: "bg-[#FEF3C7] text-[#B45309]",
    warehouse: "bg-[#E9D5FF] text-[#7C3AED]",
    paid: "bg-[#DCFCE7] text-[#16A34A]",
    partiallyPaid: "bg-[#FEF9C3] text-[#CA8A04]",
    unpaid: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[variant] || styles.default
      }`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  const variants = {
    primary:
      "bg-[#002365] text-white hover:bg-[#0033A0] focus:ring-[#002365]",
    secondary:
      "bg-white text-[#1E293B] border border-[#E2E8F0] hover:bg-[#F5F7FA] focus:ring-[#E2E8F0]",
    danger:
      "bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-[#EF4444]",
    ghost:
      "bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]",
    outlineDanger:
      "bg-white text-[#EF4444] border border-[#EF4444] hover:bg-[#FEE2E2] focus:ring-[#EF4444]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E293B]">{title}</h3>
          </div>

          <p className="text-[#64748B] mb-6 leading-relaxed">{message}</p>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────

const TenantManagement = () => {
  const navigate = useNavigate();

  const { role } = useSelector((s) => s.auth.user);

  

  // State
  const [activeTab, setActiveTab] = useState("Active");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Fetch tenants
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response =
          activeTab === "Active"
            ? await getActiveTenants()
            : await getInactiveTenants();
        setTenants(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tenants");
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [activeTab]);

  // Filter tenants by search
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;

    const query = searchQuery.toLowerCase().trim();
    return tenants.filter(
      (tenant) =>
        tenant.company?.toLowerCase().includes(query) ||
        String(tenant.id).includes(query)
    );
  }, [tenants, searchQuery]);

  // Handlers
  const handleView = (id) => {
    if (role === 'Admin') navigate(`/admin/tenants/${id}`);
    else if (role === 'Manager') navigate(`/manager/tenants/${id}`);
  };

  const openDeactivateDialog = (tenant) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDeactivate = async () => {
    if (!selectedTenant) return;

    setDialogLoading(true);
    try {
      await deactivateTenant(selectedTenant.id);
      // Remove from current list or refresh
      setTenants((prev) => prev.filter((t) => t.id !== selectedTenant.id));
      setDialogOpen(false);
      setSelectedTenant(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate tenant");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCancelDialog = () => {
    if (!dialogLoading) {
      setDialogOpen(false);
      setSelectedTenant(null);
    }
  };

  const getCategoryVariant = (category) => {
    const map = {
      building: "building",
      shop: "shop",
      warehouse: "warehouse",
    };
    return map[category?.toLowerCase()] || "default";
  };

  const calculateTotalOutstanding = (tenant) => {
    return (
      (tenant.electricityOutstanding || 0) +
      (tenant.waterOutstanding || 0) +
      (tenant.rentOutstanding || 0)
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
                Tenant Management
            </h1>
            <p className="text-[#64748B]">
                Manage and monitor all tenant agreements and outstanding payments
            </p>
            </div>
            <Link

                to="/admin/tenants/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002365] text-white text-sm font-medium rounded-lg hover:bg-[#0033A0] transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
                Add Tenant
            </Link>
        </div>

        {/* Controls Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tab Toggle */}
            <div className="inline-flex bg-[#F1F5F9] rounded-lg p-1">
              {["Active", "Inactive"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchQuery("");
                  }}
                  className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-[#002365] shadow-sm"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  {tab} Tenants
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by company name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#002365] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
            <p className="text-sm text-[#DC2626]">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-[#DC2626] hover:bg-[#FECACA] rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#002365] animate-spin mb-3" />
              <p className="text-[#64748B] text-sm">Loading tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-1">
                No tenants found
              </h3>
              <p className="text-[#64748B] text-sm">
                {searchQuery
                  ? "Try adjusting your search query"
                  : `No ${activeTab.toLowerCase()} tenants available`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Total Outstanding
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredTenants.map((tenant) => {
                    const totalOutstanding = calculateTotalOutstanding(tenant);

                    return (
                      <tr
                        key={tenant.id}
                        className="hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#002365]">
                            #{tenant.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#1E293B]">
                              {tenant.company}
                            </span>
                            <span className="text-xs text-[#64748B] mt-0.5">
                              {tenant.address}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getCategoryVariant(tenant.category)}>
                            {tenant.category
                              ? tenant.category.charAt(0).toUpperCase() +
                                tenant.category.slice(1)
                              : "N/A"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-[#1E293B]">
                              {tenant.contactPerson || "-"}
                            </span>
                            <span className="text-xs text-[#64748B] mt-0.5">
                              {tenant.contactNumber || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-[#1E293B]">
                            {formatCurrency(tenant.monthlyRent)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-semibold ${
                                totalOutstanding > 0
                                  ? "text-[#DC2626]"
                                  : "text-[#16A34A]"
                              }`}
                            >
                              {formatCurrency(totalOutstanding)}
                            </span>
                            {totalOutstanding > 0 && (
                              <span className="text-xs text-[#64748B] mt-0.5">
                                E: {formatCurrency(tenant.electricityOutstanding || 0)} · W:{" "}
                                {formatCurrency(tenant.waterOutstanding || 0)} · R:{" "}
                                {formatCurrency(tenant.rentOutstanding || 0)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              tenant.status === "Active" ? "active" : "inactive"
                            }
                          >
                            {tenant.status || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleView(tenant.id)}
                              className="gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            {activeTab === "Active" && (
                              <Button
                                variant="outlineDanger"
                                size="sm"
                                onClick={() => openDeactivateDialog(tenant)}
                                className="gap-1.5"
                              >
                                <Power className="w-3.5 h-3.5" />
                                Deactivate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer with count */}
          {!loading && filteredTenants.length > 0 && (
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-sm text-[#64748B]">
                Showing <span className="font-medium text-[#1E293B]">{filteredTenants.length}</span>{" "}
                {activeTab.toLowerCase()} tenant
                {filteredTenants.length !== 1 ? "s" : ""}
              </span>
              {searchQuery && (
                <span className="text-sm text-[#64748B]">
                  Filtered from {tenants.length} total
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="Deactivate Tenant"
        message={
          selectedTenant
            ? `Are you sure you want to deactivate "${selectedTenant.company}"? This tenant will be moved to the inactive list and their agreement will be marked as ended.`
            : ""
        }
        onConfirm={handleDeactivate}
        onCancel={handleCancelDialog}
        isLoading={dialogLoading}
      />
    </div>
  );
};

export default TenantManagement;