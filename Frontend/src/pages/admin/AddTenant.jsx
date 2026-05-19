import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, User, Phone, MapPin, Tag, DollarSign, TrendingUp, CalendarDays, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createTenant } from "../../api/tenantApi";

// ─── Reusable UI Components ─────────────────────────────────────────

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  error,
  helperText,
  min,
  max,
  step,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#1E293B]">
        {label}
        {required && <span className="text-[#EF4444]">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 bg-white border rounded-lg text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#002365] focus:border-transparent transition-all ${
            error
              ? "border-[#EF4444] focus:ring-[#EF4444]"
              : "border-[#E2E8F0]"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#64748B]">{helperText}</p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
  error,
  placeholder = "Select an option",
}) => {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#1E293B]">
        {label}
        {required && <span className="text-[#EF4444]">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 bg-white border rounded-lg text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#002365] focus:border-transparent transition-all appearance-none cursor-pointer ${
            error ? "border-[#EF4444] focus:ring-[#EF4444]" : "border-[#E2E8F0]"
          } ${!value ? "text-[#94A3B8]" : ""}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-[#94A3B8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-[#EF4444] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const SectionCard = ({ title, description, children, icon: Icon }) => {
  return (
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
};

const Button = ({
  children,
  onClick,
  type = "button",
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
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ─── Main Component ─────────────────────────────────────────────────

const AddTenant = () => {
  const navigate = useNavigate();

  const initialFormState = {
    company: "",
    address: "",
    category: "",
    contactPerson: "",
    contactNumber: "",
    monthlyRent: "",
    incrementPercentage: "",
    agreementDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categoryOptions = [
    { value: "building", label: "Building" },
    { value: "shop", label: "Shop" },
    { value: "warehouse", label: "Warehouse" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[\d\s\-\+()]{7,20}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid phone number";
    }

    if (formData.monthlyRent === "" || formData.monthlyRent === null) {
      newErrors.monthlyRent = "Monthly rent is required";
    } else if (Number(formData.monthlyRent) < 0) {
      newErrors.monthlyRent = "Monthly rent cannot be negative";
    }

    if (formData.incrementPercentage === "" || formData.incrementPercentage === null) {
      newErrors.incrementPercentage = "Increment percentage is required";
    } else if (
      Number(formData.incrementPercentage) < 0 ||
      Number(formData.incrementPercentage) > 100
    ) {
      newErrors.incrementPercentage = "Must be between 0 and 100";
    }

    if (!formData.agreementDate) {
      newErrors.agreementDate = "Agreement date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (
      formData.agreementDate &&
      new Date(formData.endDate) <= new Date(formData.agreementDate)
    ) {
      newErrors.endDate = "End date must be after agreement date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Construct payload exactly as backend expects
    const payload = {
      company: formData.company.trim(),
      address: formData.address.trim(),
      category: formData.category,
      contactPerson: formData.contactPerson.trim(),
      contactNumber: formData.contactNumber.trim(),
      monthlyRent: Number(formData.monthlyRent),
      incrementPercentage: Number(formData.incrementPercentage),
      agreementDate: new Date(formData.agreementDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    try {
      await createTenant(payload);
      setSubmitSuccess(true);
      setFormData(initialFormState);
      // Optionally redirect after success
      setTimeout(() => {
        navigate("/admin/tenants");
      }, 1500);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create tenant. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/tenants");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-[#1E293B]">Add New Tenant</h1>
            <p className="text-[#64748B] mt-1">
              Create a new tenant agreement with all required details
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
            <p className="text-sm text-[#16A34A] font-medium">
              Tenant created successfully! Redirecting to tenant list...
            </p>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
            <p className="text-sm text-[#DC2626]">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="ml-auto text-[#DC2626] hover:bg-[#FECACA] rounded p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <SectionCard
            title="Company Information"
            description="Basic details about the tenant company"
            icon={Building2}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., ABC Corporation"
                required
                icon={Building2}
                error={errors.company}
              />

              <SelectField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                required
                icon={Tag}
                error={errors.category}
                placeholder="Select category"
              />

              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, Karachi"
                  required
                  icon={MapPin}
                  error={errors.address}
                />
              </div>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard
            title="Contact Information"
            description="Primary contact person details"
            icon={User}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Contact Person"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g., Ali Ahmed"
                required
                icon={User}
                error={errors.contactPerson}
              />

              <InputField
                label="Contact Number"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g., 0300-1234567"
                required
                icon={Phone}
                error={errors.contactNumber}
                helperText="Format: 0300-1234567 or +92 300 1234567"
              />
            </div>
          </SectionCard>

          {/* Agreement Details */}
          <SectionCard
            title="Agreement Details"
            description="Financial terms and agreement duration"
            icon={DollarSign}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Monthly Rent"
                name="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={handleChange}
                placeholder="e.g., 50000"
                required
                icon={DollarSign}
                error={errors.monthlyRent}
                min={0}
                helperText="Amount in PKR"
              />

              <InputField
                label="Increment Percentage"
                name="incrementPercentage"
                type="number"
                value={formData.incrementPercentage}
                onChange={handleChange}
                placeholder="e.g., 10"
                required
                icon={TrendingUp}
                error={errors.incrementPercentage}
                min={0}
                max={100}
                step="0.01"
                helperText="Annual rent increment percentage (0-100)"
              />

              <InputField
                label="Agreement Date"
                name="agreementDate"
                type="date"
                value={formData.agreementDate}
                onChange={handleChange}
                required
                icon={CalendarDays}
                error={errors.agreementDate}
              />

              <InputField
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                icon={CalendarDays}
                error={errors.endDate}
              />
            </div>
          </SectionCard>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || submitSuccess}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Tenant
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenant;