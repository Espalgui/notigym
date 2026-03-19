import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  height_cm: number | null;
  gender: string | null;
  goal: string | null;
  privacy: string;
  language: string;
  is_2fa_enabled: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requires2FA?: boolean }>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; language: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,

  login: async (email, password, totpCode?) => {
    const payload: any = { email, password };
    if (totpCode) payload.totp_code = totpCode;

    const { data } = await api.post("/auth/login", payload);

    if (data.requires_2fa) {
      return { requires2FA: true };
    }

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    set({ isAuthenticated: true });
    const { data: user } = await api.get("/users/me");
    set({ user });
    return {};
  },

  register: async (registerData) => {
    await api.post("/auth/register", registerData);
    const { data } = await api.post("/auth/login", {
      email: registerData.email,
      password: registerData.password,
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    set({ isAuthenticated: true });
    const { data: user } = await api.get("/users/me");
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get("/users/me");
      set({ user: data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (updateData) => {
    const { data } = await api.put("/users/me", updateData);
    set({ user: data });
  },
}));
