import { create } from 'zustand';
import type { Profile } from '@/types';

// ────────────────────────────────────────────
// State & actions
// ────────────────────────────────────────────
interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (profile: Profile) => void;
  logout: () => void;
  updateProfile: (partial: Partial<Profile>) => void;
}

// ────────────────────────────────────────────
// Store
// ────────────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  // ---------- state ----------
  user: null,
  isAuthenticated: false,

  // ---------- actions ----------
  login: (profile) => {
    set({ user: profile, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (partial) => {
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, ...partial } };
    });
  },
}));
