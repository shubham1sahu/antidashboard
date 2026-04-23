import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getDefaultRouteByRole } from '../../utils/roleRoutes';

function AuthRedirectRoute() {
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return <Outlet />;
}

export default AuthRedirectRoute;
