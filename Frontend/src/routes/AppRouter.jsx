import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AdminLayout from '../layouts/AdminLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import TenantLayout from '../layouts/TenantLayout';
import LoginPage from '../pages/LoginPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import UserManagement from '../pages/admin/UserManagement';
import TenantManagement from '../pages/TenantManagement';
import AddTenant from '../pages/admin/AddTenant';
import ViewTenant from '../pages/ViewTenant'
import BankManagement from '../pages/admin/BankManagement';
import BankTransactions from '../pages/admin/BankTransactions';
import ElectricityBillsList from '../pages/manager/ElectricityBillsList';
// import BankTransactions from '../pages/admin/BankTransactions';
import UtilityConfig from '../pages/admin/UtilityConfig';
import Reports from '../pages/admin/Reports';
import TenantDetail from '../pages/TenantDetail';
import CreateElectricityBill from '../pages/manager/CreateElectricityBilling';
import CreateWaterBill from '../pages/manager/CreateWaterBilling';
import ElectricityBillView from '../pages/manager/ElectricityBillView';
import WaterBillsList from '../pages/manager/WaterBillList';
import WaterBillView from '../pages/manager/WaterBillView';
import CreateRentBilling from '../pages/manager/CreateRentBilling';
import RentBillsList from '../pages/manager/RentBillsList';
import RentBillView from '../pages/manager/RentBillView';
import PaymentForm from '../pages/manager/PaymentForm';
import PaymentHistory from '../pages/tenant/PaymentHistory';
import AdminPaymentHistory from '../pages/admin/AdminPaymentHistory';
import BillHistory from '../pages/tenant/BillHistory';
import TenantDashboard from '../pages/tenant/TenantDashboard';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RoleRoute allowedRoles={['Tenant','Manager', 'Admin']} />}>
          <Route element={<TenantLayout />}>

            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/payments" element={<PaymentHistory />} />
            <Route path="/tenant/bills" element={<BillHistory />} />


          </Route>

      </Route>

      <Route element={<RoleRoute allowedRoles={['Manager']} />}>
          <Route element={<ManagerLayout />}>

            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            
          <Route path="/manager/tenants" element={<TenantManagement />} />
            <Route path="/manager/tenants/:tenantId" element={<TenantDetail />} />
            <Route path="/manager/electricity/create" element={<CreateElectricityBill />} />
            <Route path="/manager/electricity/view" element={<ElectricityBillsList />} />
            <Route path="/manager/electricity/view/:utilityId" element={<ElectricityBillView />} />
            <Route path="/manager/water/create" element={<CreateWaterBill />} />
            <Route path="/manager/water/view" element={<WaterBillsList />} />
            <Route path="/manager/water/view/:utilityId" element={<WaterBillView />} />
            <Route path="/manager/rent/create" element={<CreateRentBilling />} />
            <Route path="/manager/rent/view" element={<RentBillsList />} />
            <Route path="/manager/rent/view/:utilityId" element={<RentBillView />} />
            <Route path="/manager/payments/new" element={<PaymentForm />} />
            <Route path="/manager/reports" element={<Reports />} />


          </Route>

        {/* 
          <Route path="/manager/dashboard" element={<AdminDashboard />} />
          <Route path="/manager/tenants" element={<TenantManagement />} />
          <Route path="/manager/tenants/:id" element={<ViewTenant />} />
        </Route> */}
      </Route>

      


      {/* Admin Routes */}
      <Route element={<RoleRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/tenants" element={<TenantManagement />} />
          <Route path="/admin/tenants/:tenantId" element={<TenantDetail />} />
          <Route path="/admin/tenants/add" element={<AddTenant />} />
          <Route path="/admin/banks" element={<BankManagement />} />
          <Route path="/admin/bank/transactions/:bankId" element={<BankTransactions />} />
          <Route path="/admin/utility-config" element={<UtilityConfig />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/payment-history" element={<AdminPaymentHistory />} />
          {/* 
          <Route path="/admin/bank/transactions/:bankId" element={<BankTransactions />} />
           */}
        </Route>
      </Route>
      
      


      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}