import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function RoleRoute({ allowedRoles = [] }) {
  const { token, user } = useSelector((s) => s.auth);
  console.log(user);

  console.log(allowedRoles);
  
  
  if (!token) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}