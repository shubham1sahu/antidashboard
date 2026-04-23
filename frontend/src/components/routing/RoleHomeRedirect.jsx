import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getDefaultRouteByRole } from '../../utils/roleRoutes';

function RoleHomeRedirect() {
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getDefaultRouteByRole(role)} replace />;
}

export default RoleHomeRedirect;
