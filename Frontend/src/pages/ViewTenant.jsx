import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Phone,
  Tag,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Zap,
  Droplets,
  Receipt,
  Clock,
  Loader2,
  AlertCircle,
  Edit3,
  Power,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getTenantById } from "../api/tenantApi";

// ─── Reusable UI Components ─────────────────────────────────────────

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-[#F1F5F9] text-[#64748B]",
    active: "bg-[#DCFCE7] text-[#16A34A]",
    inactive: "bg-[#F1F5F9] text-[#64748B]",
    building: "bg-[#DBEAFE] text-[#1D4ED8]",
    shop: "bg-[#FEF3C7] text-[#B45309]",
    warehouse: "bg-[#E9D5FF] text-[#7C3AED]",
    books: "bg-[#FCE7F3] text-[#BE185D]",
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
    ghost:
      "bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]",
    outlineDanger:
      "bg-white text-[#EF4444] border border-[#EF4444] hover:bg-[#FEE2E2] focus:ring-[#EF4444]",
    success:
      "bg-[#22C55E] text-white hover:bg-[#16A34A] focus:ring-[#22C55E]",
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

const InfoCard = ({ label, value, icon: Icon, variant = "default", subValue }) => {
  const iconBgColors = {
    default: "bg-[#EFF6FF] text-[#3B82F6]",
    success: "bg-[#DCFCE7] text-[#16A34A]",
    warning: "bg-[#FEF9C3] text-[#CA8A04]",
    danger: "bg-[#FEE2E2] text-[#DC2626]",
    info: "bg-[#E0F2FE] text-[#0284C7]",
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg ${
            iconBgColors[variant] || iconBgColors.default
          } flex items-center justify-center`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-[#1E293B]">{value}</p>
      {subValue && <p className="text-xs text-[#64748B] mt-1">{subValue}</p>}
    </div>
  );
};

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
    <div className="flex items-center gap-2 text-sm text-[#64748B]">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </div>
    <span className="text-sm font-semibold text-[#1E293B] text-right">
      {value || "-"}
    </span>
  </div>
);

const SectionCard = ({ title, description, children, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-[#002365]" />}
        <div>
          <h3 className="text-base font-semibold text-[#1E293B]">{title}</h3>
          {description && (
            <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────

const ViewTenant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTenantById(id);
        setTenant(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch tenant details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTenant();
    }
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalOutstanding = (tenant) => {
    return (
      (tenant?.electricityOutstanding || 0) +
      (tenant?.waterOutstanding || 0) +
      (tenant?.rentOutstanding || 0)
    );
  };

  const getCategoryVariant = (category) => {
    const map = {
      building: "building",
      shop: "shop",
      warehouse: "warehouse",
      books: "books",
    };
    return map[category?.toLowerCase()] || "default";
  };

  const getStatusConfig = (status) => {
    const isActive = status?.toLowerCase() === "active";
    return {
      variant: isActive ? "active" : "inactive",
      icon: isActive ? CheckCircle2 : XCircle,
      color: isActive ? "text-[#16A34A]" : "text-[#64748B]",
    };
  };

  const handleBack = () => {
    navigate("/admin/tenants");
  };

  const handleEdit = () => {
    navigate(`/admin/tenants/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#002365] animate-spin" />
          <p className="text-[#64748B] text-sm">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6 gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Tenants
          </Button>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
            <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#DC2626]" />
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mb-2">Error Loading Tenant</h2>
            <p className="text-[#64748B] mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6 gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Tenants
          </Button>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mb-2">Tenant Not Found</h2>
            <p className="text-[#64748B]">The requested tenant could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalOutstanding = calculateTotalOutstanding(tenant);
  const statusConfig = getStatusConfig(tenant.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-3 gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Tenants
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#1E293B]">
                {tenant.company}
              </h1>
              <Badge variant={statusConfig.variant}>{tenant.status}</Badge>
            </div>
            <p className="text-[#64748B] mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {tenant.address}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button variant="secondary" onClick={handleEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button> */}
            {/* {tenant.status === "Active" ? (
              <Button variant="outlineDanger" className="gap-2">
                <Power className="w-4 h-4" />
                Deactivate
              </Button>
            ) : (
              <Button variant="success" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reactivate
              </Button>
            )} */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <InfoCard
            label="Monthly Rent"
            value={formatCurrency(tenant.monthlyRent)}
            icon={DollarSign}
            variant="info"
          />
          <InfoCard
            label="Total Outstanding"
            value={formatCurrency(totalOutstanding)}
            icon={Receipt}
            variant={totalOutstanding > 0 ? "danger" : "success"}
            subValue={
              totalOutstanding > 0 ? "Payment required" : "All clear"
            }
          />
          <InfoCard
            label="Increment Rate"
            value={`${tenant.incrementPercentage}%`}
            icon={TrendingUp}
            variant="default"
            subValue="Annual increase"
          />
          <InfoCard
            label="Agreement Status"
            value={tenant.status}
            icon={StatusIcon}
            variant={tenant.status === "Active" ? "success" : "default"}
            subValue={`Since ${formatDate(tenant.agreementDate)}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Details */}
            <SectionCard
              title="Company Details"
              description="Basic information about the tenant"
              icon={Building2}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <DetailRow
                  label="Company Name"
                  value={tenant.company}
                  icon={Building2}
                />
                <DetailRow
                  label="Category"
                  value={
                    <Badge variant={getCategoryVariant(tenant.category)}>
                      {tenant.category}
                    </Badge>
                  }
                  icon={Tag}
                />
                <DetailRow
                  label="Address"
                  value={tenant.address}
                  icon={MapPin}
                />
                <DetailRow
                  label="Tenant ID"
                  value={`#${tenant.id}`}
                  icon={Receipt}
                />
              </div>
            </SectionCard>

            {/* Contact Information */}
            <SectionCard
              title="Contact Information"
              description="Primary contact person details"
              icon={User}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <DetailRow
                  label="Contact Person"
                  value={tenant.contactPerson}
                  icon={User}
                />
                <DetailRow
                  label="Contact Number"
                  value={tenant.contactNumber}
                  icon={Phone}
                />
              </div>
            </SectionCard>

            {/* Agreement Timeline */}
            <SectionCard
              title="Agreement Timeline"
              description="Contract duration and key dates"
              icon={CalendarDays}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <DetailRow
                  label="Agreement Date"
                  value={formatDate(tenant.agreementDate)}
                  icon={CalendarDays}
                />
                <DetailRow
                  label="End Date"
                  value={formatDate(tenant.endDate)}
                  icon={CalendarDays}
                />
                <DetailRow
                  label="Created At"
                  value={formatDateTime(tenant.createdAt)}
                  icon={Clock}
                />
                <DetailRow
                  label="Duration"
                  value={`${Math.ceil(
                    (new Date(tenant.endDate) - new Date(tenant.agreementDate)) /
                      (1000 * 60 * 60 * 24 * 30)
                  )} months`}
                  icon={Clock}
                />
              </div>
            </SectionCard>
          </div>

          {/* Right Column - Financial Summary */}
          <div className="space-y-6">
            {/* Outstanding Breakdown */}
            <SectionCard
              title="Outstanding Breakdown"
              description="Current pending payments"
              icon={Receipt}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FEF9C3] rounded-md flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#CA8A04]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">
                        Electricity
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tenant.electricityOutstanding > 0
                        ? "text-[#DC2626]"
                        : "text-[#16A34A]"
                    }`}
                  >
                    {formatCurrency(tenant.electricityOutstanding)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#DBEAFE] rounded-md flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-[#1D4ED8]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">Water</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tenant.waterOutstanding > 0
                        ? "text-[#DC2626]"
                        : "text-[#16A34A]"
                    }`}
                  >
                    {formatCurrency(tenant.waterOutstanding)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FCE7F3] rounded-md flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-[#BE185D]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">Rent</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tenant.rentOutstanding > 0
                        ? "text-[#DC2626]"
                        : "text-[#16A34A]"
                    }`}
                  >
                    {formatCurrency(tenant.rentOutstanding)}
                  </span>
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1E293B]">
                      Total Outstanding
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        totalOutstanding > 0
                          ? "text-[#DC2626]"
                          : "text-[#16A34A]"
                      }`}
                    >
                      {formatCurrency(totalOutstanding)}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Quick Actions */}
            {/* <SectionCard
              title="Quick Actions"
              description="Manage this tenant"
              icon={RotateCcw}
            >
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                  onClick={handleEdit}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Tenant Details
                </Button>
                {tenant.status === "Active" ? (
                  <Button
                    variant="outlineDanger"
                    className="w-full justify-start gap-3"
                  >
                    <Power className="w-4 h-4" />
                    Deactivate Tenant
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    className="w-full justify-start gap-3"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reactivate Tenant
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate(`/manager/tenants/${id}`)}
                >
                  <Receipt className="w-4 h-4" />
                  View Full Profile
                </Button>
              </div>
            </SectionCard> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTenant;