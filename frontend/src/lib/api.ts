import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Envoie les cookies HttpOnly automatiquement
});

// Empêche plusieurs appels API simultanés de déclencher plusieurs redirects vers /login
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // Le cookie refresh_token est envoyé automatiquement
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        isRedirecting = false;
        return api(original);
      } catch {
        // Évite la boucle infinie sur mobile : si on est déjà sur /login,
        // on laisse fetchUser() + ProtectedRoute gérer la redirection via React Router
        if (window.location.pathname !== "/login" && !isRedirecting) {
          isRedirecting = true;
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
