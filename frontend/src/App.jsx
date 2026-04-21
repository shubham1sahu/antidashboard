import { Navigate, Route, Routes } from 'react-router-dom';
import AuthRedirectRoute from './components/routing/AuthRedirectRoute';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleHomeRedirect from './components/routing/RoleHomeRedirect';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import ReservationManagement from './pages/admin/ReservationManagement';
import TableManagement from './pages/admin/TableManagement';
import UserManagementPage from './pages/admin/UserManagementPage';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import MyReservations from './pages/customer/MyReservations';
import ReservePage from './pages/customer/ReservePage';
import KitchenPage from './pages/kitchen/KitchenPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WaiterPage from './pages/waiter/WaiterPage';
import { ROLES } from './utils/roleRoutes';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthRedirectRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/home" element={<RoleHomeRedirect />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/admin/reservations" element={<ReservationManagement />} />
          <Route path="/admin/menu" element={<MenuManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/customer" element={<ReservePage />} />
          <Route path="/customer/menu" element={<CustomerMenuPage />} />
          <Route path="/customer/reservations" element={<MyReservations />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.KITCHEN_STAFF]} />}>
          <Route path="/kitchen" element={<KitchenPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.WAITER]} />}>
          <Route path="/waiter" element={<WaiterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
