import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import useAuthStore from '../store/useAuthStore';
import { getDefaultRouteByRole, normalizeRole } from '../utils/roleRoutes';

function RegisterPage() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roleType: 'CUSTOMER',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords must match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    const role = form.roleType;

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role,
      });

      const token = response?.data?.token;
      const responseRole = normalizeRole(response?.data?.role);

      if (!token || !responseRole) {
        throw new Error('Invalid register response from server');
      }

      setAuthData({
        token,
        role: responseRole,
        user: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
        },
      });

      navigate(getDefaultRouteByRole(responseRole), { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Unable to register. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen px-4 py-12 md:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-[var(--shadow-lg)] md:p-10">
        <h1 className="font-heading text-3xl text-[color:var(--primary)]">Create Account</h1>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Join RTROM and optimize your restaurant operations.</p>

        <form className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="firstName">First Name</label>
            <input id="firstName" name="firstName" className="input" value={form.firstName} onChange={handleChange} />
            {errors.firstName ? <p className="error-text">{errors.firstName}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="lastName">Last Name</label>
            <input id="lastName" name="lastName" className="input" value={form.lastName} onChange={handleChange} />
            {errors.lastName ? <p className="error-text">{errors.lastName}</p> : null}
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} />
            {errors.email ? <p className="error-text">{errors.email}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" value={form.password} onChange={handleChange} />
            {errors.password ? <p className="error-text">{errors.password}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword ? <p className="error-text">{errors.confirmPassword}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="phone">Phone (optional)</label>
            <input id="phone" name="phone" className="input" value={form.phone} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <p className="mt-2 text-xs text-[color:var(--text-muted)]">
              Note: Staff accounts (Admin, Waiter, Kitchen) must be created by an administrator.
            </p>
          </div>

          {serverError ? <p className="error-text md:col-span-2">{serverError}</p> : null}

          <button type="submit" disabled={loading} className="btn-accent mt-2 w-full justify-center md:col-span-2 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[color:var(--accent)] hover:text-[color:var(--accent-hover)]">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
