import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import useAuthStore from '../store/useAuthStore';
import { getDefaultRouteByRole, normalizeRole } from '../utils/roleRoutes';

function LoginPage() {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isResetCodeMode, setIsResetCodeMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const canSubmit = useMemo(() => email && password, [email, password]);
  const canSubmitForgot = useMemo(() => !!email, [email]);
  const canSubmitReset = useMemo(() => email && resetCode && newPassword, [email, resetCode, newPassword]);

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Please enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email, password, remember });
      const token = response?.data?.token;
      const role = normalizeRole(response?.data?.role);

      if (!token || !role) {
        throw new Error('Invalid login response from server');
      }

      setAuthData({
        token,
        role,
        user: { email },
      });

      navigate(getDefaultRouteByRole(role), { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Unable to login. Please try again.';
      setServerError(typeof message === 'string' ? message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccessMessage(typeof response?.data === 'string' ? response.data : 'Reset code sent to email.');
      setIsForgotPasswordMode(false);
      setIsResetCodeMode(true);
    } catch (error) {
      const message = error?.response?.data || 'Unable to send reset code. Please try again.';
      setServerError(typeof message === 'string' ? message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!resetCode || !newPassword) {
      setErrors({ code: 'Code is required', newPassword: 'New password is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/reset-password', { email, code: resetCode, newPassword });
      setSuccessMessage(typeof response?.data === 'string' ? response.data : 'Password reset successfully.');
      setIsResetCodeMode(false);
      setResetCode('');
      setNewPassword('');
    } catch (error) {
      const message = error?.response?.data || 'Unable to reset password. Please check the code and try again.';
      setServerError(typeof message === 'string' ? message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page min-h-screen px-4 py-12 md:px-8">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-lg)] md:grid-cols-[1.1fr_1fr]">
        <aside className="hidden bg-[color:var(--primary)] p-10 text-white md:flex md:flex-col md:items-center md:justify-center">
          <img src="/logo.png" alt="LuxeServe" className="mx-auto h-28 w-28 rounded-2xl bg-white/10 object-contain p-3 shadow-lg backdrop-blur-sm" />
          <h1 className="mt-6 text-center font-heading text-4xl">LuxeServe</h1>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-slate-300">
            Restaurant Table Booking &amp; Order Management
          </p>
          <div className="mx-auto mt-8 h-px w-16 bg-white/30" />
          <p className="mt-6 max-w-xs text-center text-sm leading-relaxed text-slate-200">
            One elegant command center for reservations, service flow, and order execution.
          </p>
        </aside>

        <div className="p-8 md:p-10">
          {!isForgotPasswordMode && !isResetCodeMode ? (
            <>
              <h2 className="font-heading text-3xl text-[color:var(--primary)]">Log In</h2>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Access your LuxeServe workspace.</p>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@restaurant.com"
                  />
                  {errors.email ? <p className="error-text">{errors.email}</p> : null}
                </div>

                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-16"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[color:var(--text-secondary)]"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password ? <p className="error-text">{errors.password}</p> : null}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[color:var(--text-secondary)]">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setIsForgotPasswordMode(true); setServerError(''); setSuccessMessage(''); setErrors({}); }} className="font-medium text-[color:var(--accent)] hover:text-[color:var(--accent-hover)]">
                    Forgot Password?
                  </button>
                </div>

                {serverError ? <p className="error-text">{serverError}</p> : null}
                {successMessage ? <p className="text-sm font-medium text-green-600">{successMessage}</p> : null}

                <button type="submit" disabled={!canSubmit || loading} className="btn-accent w-full justify-center disabled:opacity-60">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[color:var(--accent)] hover:text-[color:var(--accent-hover)]">
                  Register
                </Link>
              </p>
            </>
          ) : isForgotPasswordMode ? (
            <>
              <h2 className="font-heading text-3xl text-[color:var(--primary)]">Forgot Password</h2>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Enter your email to receive a reset code.</p>

              <form className="mt-8 space-y-4" onSubmit={handleForgotPassword} noValidate>
                <div>
                  <label className="label" htmlFor="email-forgot">Email</label>
                  <input
                    id="email-forgot"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@restaurant.com"
                  />
                  {errors.email ? <p className="error-text">{errors.email}</p> : null}
                </div>

                {serverError ? <p className="error-text">{serverError}</p> : null}

                <button type="submit" disabled={!canSubmitForgot || loading} className="btn-accent w-full justify-center disabled:opacity-60">
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
                <button type="button" onClick={() => setIsForgotPasswordMode(false)} className="mt-2 w-full text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--primary)]">
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-heading text-3xl text-[color:var(--primary)]">Reset Password</h2>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Enter the 6-digit code sent to your email.</p>

              <form className="mt-8 space-y-4" onSubmit={handleResetPassword} noValidate>
                <div>
                  <label className="label" htmlFor="email-reset">Email</label>
                  <input
                    id="email-reset"
                    type="email"
                    className="input bg-gray-50"
                    value={email}
                    disabled
                  />
                </div>
                
                <div>
                  <label className="label" htmlFor="resetCode">Verification Code</label>
                  <input
                    id="resetCode"
                    type="text"
                    className="input"
                    value={resetCode}
                    onChange={(event) => setResetCode(event.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                  {errors.code ? <p className="error-text">{errors.code}</p> : null}
                </div>

                <div>
                  <label className="label" htmlFor="newPassword">New Password</label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-16"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[color:var(--text-secondary)]"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.newPassword ? <p className="error-text">{errors.newPassword}</p> : null}
                </div>

                {serverError ? <p className="error-text">{serverError}</p> : null}
                {successMessage ? <p className="text-sm font-medium text-green-600">{successMessage}</p> : null}

                <button type="submit" disabled={!canSubmitReset || loading} className="btn-accent w-full justify-center disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setIsResetCodeMode(false); setIsForgotPasswordMode(false); }} className="mt-2 w-full text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--primary)]">
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
