import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getDefaultRouteByRole } from '../../utils/roleRoutes';

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
