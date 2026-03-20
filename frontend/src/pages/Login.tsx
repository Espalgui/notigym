import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.requires2FA) {
        setNeeds2FA(true);
      } else {
        navigate("/");
      }
    } catch {
      toast.error(t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim()) return;
    setLoading(true);
    try {
      await login(email, password, totpCode.trim());
      navigate("/");
    } catch {
      toast.error(t("auth.invalid2FA"));
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-30"
          style={{ background: "var(--red)" }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--cyan)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-5"
          style={{ background: "var(--purple)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <img src="/notigym-icon.svg" alt="NotiGym" className="h-12 w-12" />
          </motion.div>
          <p className="text-onair-muted text-sm">{t("auth.welcomeBack")}</p>
        </div>

        <AnimatePresence mode="wait">
          {!needs2FA ? (
            <motion.form
              key="login-form"
              onSubmit={handleSubmit}
              className="card space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-onair-muted mb-2">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-onair-muted hover:text-onair-text transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>
                  {loading ? t("common.loading") : t("auth.loginBtn")}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-sm text-onair-muted">
                {t("auth.noAccount")}{" "}
                <Link
                  to="/language"
                  className="text-onair-cyan hover:underline font-medium"
                >
                  {t("auth.register")}
                </Link>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="2fa-form"
              onSubmit={handle2FA}
              className="card space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-onair-cyan/10 mb-4">
                  <ShieldCheck className="w-8 h-8 text-onair-cyan" />
                </div>
                <h2 className="text-lg font-display font-bold text-onair-text">
                  {t("auth.twoFA.title")}
                </h2>
                <p className="text-sm text-onair-muted mt-1">
                  {t("auth.twoFA.enterCode")}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                  }
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono tracking-[0.3em] py-4"
                  autoFocus
                />
                <p className="text-xs text-onair-muted text-center mt-2">
                  {t("auth.twoFA.backupHint")}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !totpCode.trim()}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {loading ? t("common.loading") : t("auth.twoFA.verify")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeeds2FA(false);
                  setTotpCode("");
                }}
                className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("auth.twoFA.back")}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
