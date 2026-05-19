import { useState, useEffect } from 'react';
import { Pencil, Save, X, Zap, Droplets } from 'lucide-react';
import { getElectricityConfig, updateElectricityConfig, getWaterConfig, updateWaterConfig } from "../../api/utilityConfigApi";
import Badge from "../../components/Badge";
import Loader from "../../components/Loader";
import { useNavigate } from 'react-router-dom';


const initialFormState = {
  ratePerUnit: '',
  fixedCharges: '',
  sstPercentage: '',
  overdueSurchargePercentage: '',
};

function ConfigCard({ title, icon: Icon, iconColor, iconBg, data, isEditing, formData, onEdit, onCancel, onSave, onChange, isLoading, error }) {
  const displayFields = [
    { key: 'ratePerUnit', label: 'Rate Per Unit', prefix: 'Rs. ', type: 'number', step: '0.01' },
    { key: 'fixedCharges', label: 'Fixed Charges', prefix: 'Rs. ', type: 'number', step: '0.01' },
    { key: 'sstPercentage', label: 'SST Percentage', suffix: '%', type: 'number', step: '0.01' },
    { key: 'overdueSurchargePercentage', label: 'Overdue Surcharge %', suffix: '%', type: 'number', step: '0.01' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B]">{title}</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Manage rates and charges</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#002365] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Pencil size={15} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <Loader message={`Loading ${title.toLowerCase()}...`} />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-[#002365] hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && data && (
        <div className="flex-1">
          <div className="space-y-4">
            {displayFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1.5">
                  {field.label}
                </label>
                {isEditing ? (
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                        {field.prefix}
                      </span>
                    )}
                    <input
                      type={field.type}
                      step={field.step}
                      value={formData[field.key]}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      className={`w-full rounded-lg border border-[#E2E8F0] bg-white py-2 text-sm text-[#1E293B] focus:border-[#002365] focus:outline-none focus:ring-1 focus:ring-[#002365] transition-colors ${
                        field.prefix ? 'pl-10 pr-3' : 'px-3'
                      } ${field.suffix ? 'pr-8' : ''}`}
                    />
                    {field.suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                        {field.suffix}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {field.prefix}
                    {data[field.key] !== undefined && data[field.key] !== null
                      ? Number(data[field.key]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '—'}
                    {field.suffix}
                  </p>
                )}
              </div>
            ))}

            {/* Last Updated Info */}
            <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1">
                    Last Updated At
                  </label>
                  <p className="text-sm text-[#1E293B]">
                    {data.updatedAt
                      ? new Date(data.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label="Active" variant="success" />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#002365] rounded-lg hover:bg-[#0033A0] transition-colors"
              >
                <Save size={15} />
                Save
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#64748B] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UtilityConfig() {
  const [electricityData, setElectricityData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [isLoadingElectricity, setIsLoadingElectricity] = useState(true);
  const [isLoadingWater, setIsLoadingWater] = useState(true);
  const [errorElectricity, setErrorElectricity] = useState(null);
  const [errorWater, setErrorWater] = useState(null);

  const navigate = useNavigate();

  const [isEditingElectricity, setIsEditingElectricity] = useState(false);
  const [isEditingWater, setIsEditingWater] = useState(false);

  const [electricityForm, setElectricityForm] = useState(initialFormState);
  const [waterForm, setWaterForm] = useState(initialFormState);

  const [isSavingElectricity, setIsSavingElectricity] = useState(false);
  const [isSavingWater, setIsSavingWater] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchElectricityConfig();
    fetchWaterConfig();
  }, []);

  const fetchElectricityConfig = async () => {
    setIsLoadingElectricity(true);
    setErrorElectricity(null);
    try {
      const response = await getElectricityConfig();
      setElectricityData(response.data);
    } catch (err) {
      setErrorElectricity(err.response?.data?.message || 'Failed to load electricity config');
    } finally {
      setIsLoadingElectricity(false);
    }
  };

  const fetchWaterConfig = async () => {
    setIsLoadingWater(true);
    setErrorWater(null);
    try {
      const response = await getWaterConfig();
      setWaterData(response.data);
    } catch (err) {
      setErrorWater(err.response?.data?.message || 'Failed to load water config');
    } finally {
      setIsLoadingWater(false);
    }
  };

  const handleEditElectricity = () => {
    if (electricityData) {
      setElectricityForm({
        ratePerUnit: electricityData.ratePerUnit || '',
        fixedCharges: electricityData.fixedCharges || '',
        sstPercentage: electricityData.sstPercentage || '',
        overdueSurchargePercentage: electricityData.overdueSurchargePercentage || '',
      });
      setIsEditingElectricity(true);
    }
  };

  const handleEditWater = () => {
    if (waterData) {
      setWaterForm({
        ratePerUnit: waterData.ratePerUnit || '',
        fixedCharges: waterData.fixedCharges || '',
        sstPercentage: waterData.sstPercentage || '',
        overdueSurchargePercentage: waterData.overdueSurchargePercentage || '',
      });
      setIsEditingWater(true);
    }
  };

  const handleCancelElectricity = () => {
    setIsEditingElectricity(false);
    setElectricityForm(initialFormState);
  };

  const handleCancelWater = () => {
    setIsEditingWater(false);
    setWaterForm(initialFormState);
  };

  const handleFormChange = (setter) => (key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveElectricity = async () => {
    setIsSavingElectricity(true);
    try {
      const payload = {
        ratePerUnit: parseFloat(electricityForm.ratePerUnit) || 0,
        fixedCharges: parseFloat(electricityForm.fixedCharges) || 0,
        sstPercentage: parseFloat(electricityForm.sstPercentage) || 0,
        overdueSurchargePercentage: parseFloat(electricityForm.overdueSurchargePercentage) || 0,
      };
      await updateElectricityConfig(payload);
      const data = await getElectricityConfig();
      setElectricityData(data.data);
      setIsEditingElectricity(false);
      setElectricityForm(initialFormState);
    } catch (err) {
      setErrorElectricity(err.response?.data?.message || 'Failed to update electricity config');
    } finally {
      setIsSavingElectricity(false);
    }
  };

  const handleSaveWater = async () => {
    setIsSavingWater(true);
    try {
      const payload = {
        ratePerUnit: parseFloat(waterForm.ratePerUnit) || 0,
        fixedCharges: parseFloat(waterForm.fixedCharges) || 0,
        sstPercentage: parseFloat(waterForm.sstPercentage) || 0,
        overdueSurchargePercentage: parseFloat(waterForm.overdueSurchargePercentage) || 0,
      };
      await updateWaterConfig(payload);
      const data = await getWaterConfig();
      setWaterData(data.data);
      setIsEditingWater(false);
      setWaterForm(initialFormState);
    } catch (err) {
      setErrorWater(err.response?.data?.message || 'Failed to update water config');
    } finally {
      setIsSavingWater(false);
    }
  };

  const isPageLoading = isLoadingElectricity || isLoadingWater;
  const isPageSaving = isSavingElectricity || isSavingWater;

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">Utility Configuration</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Manage electricity and water utility rates, charges, and surcharge settings.
        </p>
      </div>

      {/* Full Page Loader */}
      {isPageSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <Loader fullPage message="Saving changes..." />
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigCard
          title="Electricity Config"
          icon={Zap}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          data={electricityData}
          isEditing={isEditingElectricity}
          formData={electricityForm}
          onEdit={handleEditElectricity}
          onCancel={handleCancelElectricity}
          onSave={handleSaveElectricity}
          onChange={handleFormChange(setElectricityForm)}
          isLoading={isLoadingElectricity}
          error={errorElectricity}
        />

        <ConfigCard
          title="Water Config"
          icon={Droplets}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          data={waterData}
          isEditing={isEditingWater}
          formData={waterForm}
          onEdit={handleEditWater}
          onCancel={handleCancelWater}
          onSave={handleSaveWater}
          onChange={handleFormChange(setWaterForm)}
          isLoading={isLoadingWater}
          error={errorWater}
        />
      </div>
    </div>
  );
}