import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CheckEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success(t("auth.checkEmail.resent"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md text-center py-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-onair-cyan/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-onair-cyan" />
        </div>

        <h2 className="text-xl font-display font-bold mb-2">
          {t("auth.checkEmail.title")}
        </h2>
        <p className="text-onair-muted mb-2">
          {t("auth.checkEmail.subtitle")}
        </p>
        {email && (
          <p className="text-sm font-medium text-onair-cyan mb-6">{email}</p>
        )}

        <p className="text-sm text-onair-muted mb-6">
          {t("auth.checkEmail.spam")}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="btn-secondary flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
            />
            <span>{t("auth.checkEmail.resend")}</span>
          </button>

          <Link
            to="/login"
            className="text-sm text-onair-muted hover:text-onair-text transition-colors"
          >
            {t("auth.checkEmail.backToLogin")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
