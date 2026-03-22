import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

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
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-onair-cyan animate-spin" />
            <p className="text-onair-muted">{t("auth.verify.loading")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-onair-green" />
            <h2 className="text-xl font-display font-bold mb-2">
              {t("auth.verify.success")}
            </h2>
            <p className="text-onair-muted mb-6">
              {t("auth.verify.successMsg")}
            </p>
            <Link to="/login" className="btn-primary inline-block">
              {t("auth.loginBtn")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-onair-red" />
            <h2 className="text-xl font-display font-bold mb-2">
              {t("auth.verify.error")}
            </h2>
            <p className="text-onair-muted mb-6">
              {t("auth.verify.errorMsg")}
            </p>
            <Link to="/login" className="btn-primary inline-block">
              {t("auth.loginBtn")}
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
