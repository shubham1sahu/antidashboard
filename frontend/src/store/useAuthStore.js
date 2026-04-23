import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialAuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

const useAuthStore = create(
  persist(
    (set) => ({
      ...initialAuthState,
      setAuthData: ({ token, role, user = null }) =>
        set({
          token,
          role,
          user,
          isAuthenticated: Boolean(token),
        }),
      logout: () => set(initialAuthState),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'rtrom-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
