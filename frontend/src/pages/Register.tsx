import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        language: i18n.language,
      });
      navigate(`/check-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-30" style={{ background: "var(--purple)" }} />
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "var(--green)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <img src="/notigym-icon.svg" alt="NotiGym" className="h-12 w-12" />
          </motion.div>
          <p className="text-onair-muted text-sm">{t("auth.welcome")}</p>
        </div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          className="card space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div>
            <label className="block text-sm font-medium text-onair-muted mb-2">
              {t("auth.username")}
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
              className="w-full"
              placeholder="mon_pseudo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-onair-muted mb-2">
                {t("auth.firstName")}
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-onair-muted mb-2">
                {t("auth.lastName")}
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-onair-muted mb-2">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-onair-muted mb-2">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-onair-muted hover:text-onair-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-onair-muted mb-2">
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? t("common.loading") : t("auth.registerBtn")}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-center text-sm text-onair-muted">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-onair-cyan hover:underline font-medium">
              {t("auth.login")}
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}
