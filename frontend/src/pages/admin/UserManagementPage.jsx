import { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import ToastMessage from '../../components/ui/ToastMessage';
import { getUsers, updateUserRole, deleteUser, createStaffAccount, checkEmailExists } from '../../api/userApi';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

const ROLES = ['ADMIN', 'CUSTOMER', 'KITCHEN_STAFF', 'WAITER'];

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Full access to all systems, settings, and user management.',
  CUSTOMER: 'Regular guest account for making reservations.',
  KITCHEN_STAFF: 'Access to the kitchen monitor and order fulfillment.',
  WAITER: 'Can manage live floor tables, walk-in guests, and place orders.',
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'WAITER'
  });
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  
  const currentUserEmail = useAuthStore((state) => state.user?.email);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newStaff.email) {
        validateAndCheckEmail(newStaff.email);
      } else {
        setEmailError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newStaff.email]);

  const validateAndCheckEmail = async (email) => {
    // 1. Format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }

    // Clear previous format error before checking existence
    setEmailError('');

    // 2. Existence check
    try {
      setEmailChecking(true);
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailError('Email is already in use');
      }
    } catch (error) {
      console.error('Failed to check email availability:', error);
      // If API fails, we don't block the user but we don't show an error either
      // unless we want to be safe. Let's keep it clear.
      setEmailError('');
    } finally {
      setEmailChecking(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setToast({ type: 'success', message: 'User role updated successfully.' });
      await loadUsers();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update user role.' });
    }
  };

  const handleUserDelete = (userId, email) => {
    setUserToDelete({ id: userId, email });
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(true);
      await deleteUser(userToDelete.id);
      setToast({ type: 'success', message: 'User deleted successfully.' });
      setUserToDelete(null);
      await loadUsers();
    } catch (error) {
      console.error('API call failed:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete user.';
      setToast({ type: 'error', message: errorMsg });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (emailError) return;
    try {
      setCreating(true);
      await createStaffAccount(newStaff);
      setToast({ type: 'success', message: 'Staff account created successfully.' });
      setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'WAITER' });
      setShowCreateForm(false);
      await loadUsers();
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to create staff account.';
      setToast({ type: 'error', message: msg });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardShell
      title="User Management"
      subtitle="Control platform access and delegate operational permissions across the team."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-accent flex items-center gap-2"
          >
            {showCreateForm ? 'Cancel' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Staff Account
              </>
            )}
          </button>

          <div className="flex flex-grow items-center gap-4 max-w-2xl">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text"
                placeholder="Search by name or email..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="input max-w-[160px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateStaff} className="mt-4 grid gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] md:grid-cols-3">
            <div>
              <label className="label">First Name</label>
              <input
                required
                className="input"
                value={newStaff.firstName}
                onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                required
                className="input"
                value={newStaff.lastName}
                onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="label">Email</label>
              <input
                required
                type="email"
                className={`input w-full ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
              {emailChecking && (
                <span className="absolute right-3 top-[38px] flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[color:var(--primary)]"></span>
              )}
              {emailError && (
                <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  {emailError}
                </p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                required
                type="password"
                className="input"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="WAITER">WAITER</option>
                <option value="KITCHEN_STAFF">KITCHEN_STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                disabled={creating || !!emailError || emailChecking} 
                type="submit" 
                className="btn-accent w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>

      <section className="rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-alt)]">
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">User</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Email</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Current Role</th>
                <th className="px-6 py-4 font-semibold text-[color:var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">Loading users...</td></tr>
              ) : null}
              {!loading && filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-[color:var(--text-secondary)]">No users found matching your criteria.</td></tr>
              ) : null}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[color:var(--surface-alt)]/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[color:var(--text-primary)]">{user.firstName} {user.lastName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--text-secondary)]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-bold text-[color:var(--primary)] uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="group relative">
                        <span className="cursor-help text-lg text-[color:var(--text-secondary)]">ⓘ</span>
                        <div className="invisible absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-800 p-2 text-xs text-white opacity-0 transition group-hover:visible group-hover:opacity-100">
                          {ROLE_DESCRIPTIONS[user.role] || 'No description available.'}
                          <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUserDelete(user.id, user.email)}
                        disabled={user.email === currentUserEmail}
                        className={`rounded-lg p-2 transition ${
                          user.email === currentUserEmail
                            ? 'cursor-not-allowed text-gray-300'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={user.email === currentUserEmail ? "You cannot delete yourself" : "Delete User"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Confirm Deletion</h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete user <span className="font-semibold text-slate-900">{userToDelete.email}</span>? 
              This action cannot be undone and will remove all platform access for this account.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default UserManagementPage;
