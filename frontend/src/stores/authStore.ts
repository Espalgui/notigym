import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  height_cm: number | null;
  gender: string | null;
  goal: string | null;
  training_type: string | null;
  weekly_sessions_goal: number | null;
  privacy: string;
  language: string;
  is_2fa_enabled: boolean;
  is_admin: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requires2FA?: boolean }>;
  register: (data: { email: string; password: string; username: string; first_name: string; last_name: string; language: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false, // Déterminé par fetchUser au démarrage
  isLoading: true,

  login: async (email, password, totpCode?) => {
    const payload: Record<string, string> = { email, password };
    if (totpCode) payload.totp_code = totpCode;

    const { data } = await api.post("/auth/login", payload);

    if (data.requires_2fa) {
      return { requires2FA: true };
    }

    // Les tokens sont stockés en cookies HttpOnly par le serveur
    set({ isAuthenticated: true });
    const { data: user } = await api.get("/users/me");
    set({ user });
    return {};
  },

  register: async (registerData) => {
    // Le register crée le compte et pose les cookies en une seule requête
    await api.post("/auth/register", registerData);
    // Auto-login
    await api.post("/auth/login", {
      email: registerData.email,
      password: registerData.password,
    });
    set({ isAuthenticated: true });
    const { data: user } = await api.get("/users/me");
    set({ user });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Nettoyage local même si l'API échoue
    }
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get("/users/me");
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (updateData) => {
    const { data } = await api.put("/users/me", updateData);
    set({ user: data });
  },
}));
