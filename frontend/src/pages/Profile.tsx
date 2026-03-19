import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Globe,
  Target,
  Shield,
  Save,
  Camera,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Cookie,
  ShieldCheck,
  Download,
  Mail,
  Info,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Lock,
  ExternalLink,
  Smartphone,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Tab = "personal" | "security" | "goals" | "privacy" | "legal";

const tabs: { key: Tab; icon: typeof User }[] = [
  { key: "personal", icon: User },
  { key: "security", icon: Shield },
  { key: "goals", icon: Target },
  { key: "privacy", icon: Lock },
  { key: "legal", icon: FileText },
];

type LegalSection = "terms" | "privacyPolicy" | "cookies" | "gdpr";

const legalSections: {
  key: LegalSection;
  icon: typeof FileText;
  contentKey: string;
}[] = [
  { key: "terms", icon: FileText, contentKey: "termsContent" },
  { key: "privacyPolicy", icon: ShieldCheck, contentKey: "privacyPolicyContent" },
  { key: "cookies", icon: Cookie, contentKey: "cookiesContent" },
  { key: "gdpr", icon: Shield, contentKey: "gdprContent" },
];

function renderLegalText(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-3" />;

    const isNumberedTitle = /^\d+\.\s/.test(trimmed);
    const isSectionTitle =
      isNumberedTitle &&
      !trimmed.includes("•") &&
      trimmed.length < 120 &&
      !trimmed.includes(":");

    if (isSectionTitle) {
      return (
        <h4 key={i} className="text-sm font-semibold text-onair-text mt-4 mb-1">
          {trimmed}
        </h4>
      );
    }

    if (trimmed.startsWith("•")) {
      return (
        <li key={i} className="text-sm text-onair-muted leading-relaxed ml-4 list-disc">
          {trimmed.replace(/^•\s?/, "")}
        </li>
      );
    }

    if (
      trimmed.startsWith("Droit ") ||
      trimmed.startsWith("Right ") ||
      trimmed.startsWith("Exercer ") ||
      trimmed.startsWith("Exercising ") ||
      trimmed.startsWith("Réclamation ") ||
      trimmed.startsWith("Complaint ") ||
      trimmed.startsWith("Cookies essentiels") ||
      trimmed.startsWith("Essential cookies") ||
      trimmed.startsWith("Cookies fonctionnels") ||
      trimmed.startsWith("Functional cookies") ||
      trimmed.startsWith("Droit de retirer") ||
      trimmed.startsWith("Right to withdraw")
    ) {
      return (
        <h4 key={i} className="text-sm font-semibold text-onair-text mt-3 mb-1">
          {trimmed}
        </h4>
      );
    }

    if (trimmed.startsWith("Dernière mise à jour") || trimmed.startsWith("Last updated")) {
      return (
        <p key={i} className="text-xs text-onair-muted/60 mt-4 pt-3 border-t border-onair-border italic">
          {trimmed}
        </p>
      );
    }

    return (
      <p key={i} className="text-sm text-onair-muted leading-relaxed">
        {trimmed}
      </p>
    );
  });
}

function LegalTab() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<LegalSection | null>(null);

  const toggle = (key: LegalSection) =>
    setExpanded((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-display font-bold text-onair-text">
          {t("profile.legal.title")}
        </h2>
        <p className="text-sm text-onair-muted mt-1">
          {t("profile.legal.subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {legalSections.map(({ key, icon: Icon, contentKey }) => {
          const isOpen = expanded === key;
          return (
            <div key={key} className="card !p-0 overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full text-left flex items-center gap-4 p-5 hover:bg-onair-surface/30 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-onair-surface flex-shrink-0">
                  <Icon className="w-5 h-5 text-onair-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-onair-text">
                    {t(`profile.legal.${key}`)}
                  </p>
                  <p className="text-xs text-onair-muted mt-0.5">
                    {t(`profile.legal.${key}Desc`)}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-onair-muted" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-onair-border">
                      <div className="pt-4 space-y-0.5">
                        {renderLegalText(
                          t(`profile.legal.${contentKey}`)
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Export, Contact, Version */}
      <div className="card space-y-4">
        <button className="flex items-center gap-4 w-full text-left hover:text-onair-cyan transition-colors group">
          <div className="p-2.5 rounded-xl bg-onair-surface flex-shrink-0">
            <Download className="w-5 h-5 text-onair-muted group-hover:text-onair-cyan transition-colors" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-onair-text group-hover:text-onair-cyan transition-colors">
              {t("profile.legal.exportData")}
            </p>
            <p className="text-xs text-onair-muted">
              {t("profile.legal.exportDataDesc")}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-onair-muted flex-shrink-0" />
        </button>

        <div className="border-t border-onair-border pt-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-onair-surface flex-shrink-0">
              <Mail className="w-5 h-5 text-onair-muted" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-onair-text">
                {t("profile.legal.contact")}
              </p>
              <a
                href={`mailto:${t("profile.legal.contactEmail")}`}
                className="text-xs text-onair-cyan hover:underline inline-flex items-center gap-1"
              >
                {t("profile.legal.contactEmail")}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-onair-border pt-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-onair-surface flex-shrink-0">
              <Info className="w-5 h-5 text-onair-muted" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-onair-text">
                {t("profile.legal.version")}
              </p>
              <p className="text-xs text-onair-muted">NotiGym v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    height_cm: user?.height_cm?.toString() || "",
    gender: user?.gender || "",
    goal: user?.goal || "",
    privacy: user?.privacy || "private",
    language: user?.language || "fr",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [twoFAStep, setTwoFAStep] = useState<"idle" | "setup" | "verify">("idle");
  const [twoFAData, setTwoFAData] = useState<{
    secret: string;
    qr_code: string;
    backup_codes: string[];
  } | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [disableForm, setDisableForm] = useState({ password: "", code: "" });
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    try {
      const { data } = await api.post("/auth/2fa/setup");
      setTwoFAData(data);
      setTwoFAStep("setup");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFACode.trim()) return;
    setTwoFALoading(true);
    try {
      await api.post("/auth/2fa/verify", { code: twoFACode });
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, is_2fa_enabled: true } : null,
      }));
      toast.success(t("profile.security.twoFA.enabled"));
      setTwoFAStep("idle");
      setTwoFACode("");
    } catch {
      toast.error(t("profile.security.twoFA.invalidCode"));
      setTwoFACode("");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFALoading(true);
    try {
      await api.post("/auth/2fa/disable", {
        password: disableForm.password,
        code: disableForm.code,
      });
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, is_2fa_enabled: false } : null,
      }));
      toast.success(t("profile.security.twoFA.disabled"));
      setShowDisable2FA(false);
      setDisableForm({ password: "", code: "" });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Invalid password") {
        toast.error(t("profile.security.wrongPassword"));
      } else if (detail === "Invalid code") {
        toast.error(t("profile.security.twoFA.invalidCode"));
      } else {
        toast.error(t("common.error"));
      }
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleShowBackupCodes = async () => {
    try {
      const { data } = await api.get("/auth/2fa/backup-codes");
      setBackupCodes(data.codes);
      setShowBackupCodes(true);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      const { data } = await api.post("/auth/2fa/backup-codes/regenerate");
      setBackupCodes(data.codes);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format : JPEG, PNG ou WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.put("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      useAuthStore.setState({ user: data });
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender || null,
        goal: form.goal || null,
        privacy: form.privacy,
        language: form.language,
      };
      if (form.height_cm) payload.height_cm = parseFloat(form.height_cm);
      await updateUser(payload);
      i18n.changeLanguage(form.language);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error(t("profile.security.passwordMismatch"));
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error(t("profile.security.passwordTooShort"));
      return;
    }
    setChangingPassword(true);
    try {
      await api.put("/users/me/password", {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      });
      toast.success(t("profile.security.passwordUpdated"));
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Current password is incorrect") {
        toast.error(t("profile.security.wrongPassword"));
      } else {
        toast.error(t("common.error"));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/users/me", { data: { password: deletePassword } });
      logout();
      navigate("/login");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Password is incorrect") {
        toast.error(t("profile.security.wrongPassword"));
      } else {
        toast.error(t("common.error"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(form.language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderPasswordField = (
    field: "current" | "new" | "confirm",
    label: string
  ) => (
    <div>
      <label className="text-sm text-onair-muted mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          value={passwordForm[field]}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, [field]: e.target.value })
          }
          className="w-full pr-10"
        />
        <button
          type="button"
          onClick={() =>
            setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-onair-muted hover:text-onair-text transition-colors"
        >
          {showPasswords[field] ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with avatar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col sm:flex-row items-center gap-5"
      >
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-onair-cyan/30 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-onair-red to-onair-purple flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg disabled:opacity-50 transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Camera
              className={`w-3.5 h-3.5 ${
                uploading ? "animate-pulse text-onair-cyan" : "text-onair-muted"
              }`}
            />
          </button>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-display font-bold text-onair-text">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-sm text-onair-muted">{user?.email}</p>
          {user?.created_at && (
            <p className="text-xs text-onair-muted/70 mt-1">
              {t("profile.personal.memberSince")} {formatDate(user.created_at)}
            </p>
          )}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:w-56 flex-shrink-0"
        >
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === key
                    ? "bg-onair-red/10 text-onair-red shadow-sm"
                    : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(`profile.tabs.${key}`)}</span>
                {activeTab === key && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-onair-red hidden lg:block" />
                )}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* ==================== PERSONAL ==================== */}
              {activeTab === "personal" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-onair-text">
                      {t("profile.personal.title")}
                    </h2>
                    <p className="text-sm text-onair-muted mt-1">
                      {t("profile.personal.subtitle")}
                    </p>
                  </div>

                  <div className="card space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-onair-muted mb-2 block">
                          {t("auth.firstName")}
                        </label>
                        <input
                          value={form.first_name}
                          onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-onair-muted mb-2 block">
                          {t("auth.lastName")}
                        </label>
                        <input
                          value={form.last_name}
                          onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-onair-muted mb-2 block">
                          {t("profile.personal.height")}
                        </label>
                        <input
                          type="number"
                          value={form.height_cm}
                          onChange={(e) =>
                            setForm({ ...form, height_cm: e.target.value })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-onair-muted mb-2 block">
                          {t("profile.personal.gender")}
                        </label>
                        <select
                          value={form.gender}
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                          className="w-full"
                        >
                          <option value="">—</option>
                          <option value="male">
                            {t("profile.personal.genders.male")}
                          </option>
                          <option value="female">
                            {t("profile.personal.genders.female")}
                          </option>
                          <option value="other">
                            {t("profile.personal.genders.other")}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-onair-muted mb-2 block flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        {t("profile.personal.language")}
                      </label>
                      <select
                        value={form.language}
                        onChange={(e) =>
                          setForm({ ...form, language: e.target.value })
                        }
                        className="w-full"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving ? t("common.loading") : t("common.save")}
                    </span>
                  </button>
                </div>
              )}

              {/* ==================== SECURITY ==================== */}
              {activeTab === "security" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-onair-text">
                      {t("profile.security.title")}
                    </h2>
                    <p className="text-sm text-onair-muted mt-1">
                      {t("profile.security.subtitle")}
                    </p>
                  </div>

                  {/* Change password */}
                  <div className="card space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-onair-text">
                      <KeyRound className="w-4 h-4 text-onair-cyan" />
                      {t("profile.security.changePassword")}
                    </h3>

                    {renderPasswordField(
                      "current",
                      t("profile.security.currentPassword")
                    )}
                    {renderPasswordField(
                      "new",
                      t("profile.security.newPassword")
                    )}
                    {renderPasswordField(
                      "confirm",
                      t("profile.security.confirmNewPassword")
                    )}

                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        changingPassword ||
                        !passwordForm.current ||
                        !passwordForm.new ||
                        !passwordForm.confirm
                      }
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>
                        {changingPassword
                          ? t("common.loading")
                          : t("profile.security.changePassword")}
                      </span>
                    </button>
                  </div>

                  {/* 2FA Section */}
                  <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-onair-text">
                        <ShieldCheck className="w-4 h-4 text-onair-green" />
                        {t("profile.security.twoFA.title")}
                      </h3>
                      {user?.is_2fa_enabled && (
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-onair-green/10 text-onair-green rounded-full font-bold">
                          {t("profile.security.twoFA.active")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-onair-muted">
                      {t("profile.security.twoFA.description")}
                    </p>

                    {!user?.is_2fa_enabled && twoFAStep === "idle" && (
                      <button
                        onClick={handleSetup2FA}
                        disabled={twoFALoading}
                        className="btn-primary flex items-center gap-2 w-full sm:w-auto disabled:opacity-50"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>
                          {twoFALoading
                            ? t("common.loading")
                            : t("profile.security.twoFA.enable")}
                        </span>
                      </button>
                    )}

                    {twoFAStep === "setup" && twoFAData && (
                      <div className="space-y-5">
                        <div className="p-4 rounded-xl border border-onair-border space-y-4">
                          <p className="text-sm font-medium text-onair-text">
                            {t("profile.security.twoFA.scanQR")}
                          </p>
                          <div className="flex justify-center">
                            <img
                              src={twoFAData.qr_code}
                              alt="QR Code"
                              className="rounded-xl bg-white p-2"
                              width={200}
                              height={200}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-onair-muted mb-1">
                              {t("profile.security.twoFA.manualKey")}
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs font-mono bg-onair-surface px-3 py-2 rounded-lg break-all text-onair-cyan">
                                {twoFAData.secret}
                              </code>
                              <button
                                onClick={() => copyToClipboard(twoFAData.secret)}
                                className="p-2 rounded-lg hover:bg-onair-surface text-onair-muted hover:text-onair-cyan transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-onair-amber/30 bg-onair-amber/5 space-y-2">
                          <p className="text-sm font-semibold text-onair-amber">
                            {t("profile.security.twoFA.backupTitle")}
                          </p>
                          <p className="text-xs text-onair-muted">
                            {t("profile.security.twoFA.backupDesc")}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 mt-2">
                            {twoFAData.backup_codes.map((code) => (
                              <code
                                key={code}
                                className="text-xs font-mono text-center py-1.5 rounded-lg bg-onair-surface text-onair-text"
                              >
                                {code}
                              </code>
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(twoFAData.backup_codes.join("\n"))
                            }
                            className="text-xs text-onair-cyan hover:underline flex items-center gap-1 mt-1"
                          >
                            <Copy className="w-3 h-3" />
                            {t("profile.security.twoFA.copyAll")}
                          </button>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-onair-text mb-2">
                            {t("profile.security.twoFA.enterVerify")}
                          </p>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={twoFACode}
                              onChange={(e) =>
                                setTwoFACode(
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              placeholder="000000"
                              className="flex-1 text-center text-lg font-mono tracking-[0.2em]"
                            />
                            <button
                              onClick={handleVerify2FA}
                              disabled={
                                twoFALoading || twoFACode.length < 6
                              }
                              className="btn-primary disabled:opacity-50"
                            >
                              <span>
                                {twoFALoading
                                  ? t("common.loading")
                                  : t("profile.security.twoFA.verify")}
                              </span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setTwoFAStep("idle");
                            setTwoFAData(null);
                            setTwoFACode("");
                          }}
                          className="btn-ghost text-sm w-full"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    )}

                    {user?.is_2fa_enabled && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleShowBackupCodes}
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t("profile.security.twoFA.viewBackup")}
                          </button>
                          <button
                            onClick={() => setShowDisable2FA(true)}
                            className="btn-secondary text-sm text-onair-red border-onair-red/30 hover:bg-onair-red/5 hover:border-onair-red/50 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t("profile.security.twoFA.disable")}
                          </button>
                        </div>

                        {showBackupCodes && backupCodes.length > 0 && (
                          <div className="p-4 rounded-xl border border-onair-border space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-onair-text">
                                {t("profile.security.twoFA.backupTitle")}
                              </p>
                              <button
                                onClick={() => setShowBackupCodes(false)}
                                className="text-xs text-onair-muted hover:text-onair-text"
                              >
                                {t("common.cancel")}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {backupCodes.map((code) => (
                                <code
                                  key={code}
                                  className="text-xs font-mono text-center py-1.5 rounded-lg bg-onair-surface text-onair-text"
                                >
                                  {code}
                                </code>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  copyToClipboard(backupCodes.join("\n"))
                                }
                                className="text-xs text-onair-cyan hover:underline flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {t("profile.security.twoFA.copyAll")}
                              </button>
                              <button
                                onClick={handleRegenerateBackupCodes}
                                className="text-xs text-onair-amber hover:underline flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                {t("profile.security.twoFA.regenerate")}
                              </button>
                            </div>
                          </div>
                        )}

                        {showDisable2FA && (
                          <div className="p-4 rounded-xl border border-onair-red/30 bg-onair-red/5 space-y-3">
                            <p className="text-sm font-semibold text-onair-red">
                              {t("profile.security.twoFA.disableTitle")}
                            </p>
                            <div>
                              <label className="text-sm text-onair-muted mb-1 block">
                                {t("auth.password")}
                              </label>
                              <input
                                type="password"
                                value={disableForm.password}
                                onChange={(e) =>
                                  setDisableForm({
                                    ...disableForm,
                                    password: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-onair-muted mb-1 block">
                                {t("profile.security.twoFA.codeOrBackup")}
                              </label>
                              <input
                                type="text"
                                value={disableForm.code}
                                onChange={(e) =>
                                  setDisableForm({
                                    ...disableForm,
                                    code: e.target.value,
                                  })
                                }
                                className="w-full"
                                placeholder="000000"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setShowDisable2FA(false);
                                  setDisableForm({ password: "", code: "" });
                                }}
                                className="btn-secondary flex-1"
                              >
                                {t("common.cancel")}
                              </button>
                              <button
                                onClick={handleDisable2FA}
                                disabled={
                                  twoFALoading ||
                                  !disableForm.password ||
                                  !disableForm.code
                                }
                                className="flex-1 px-6 py-2.5 text-white font-semibold rounded-xl bg-onair-red hover:bg-onair-red/90 transition-colors disabled:opacity-50"
                              >
                                <span>
                                  {twoFALoading
                                    ? t("common.loading")
                                    : t("profile.security.twoFA.disable")}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete account */}
                  <div className="card border-onair-red/20 space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-onair-red">
                      <AlertTriangle className="w-4 h-4" />
                      {t("profile.security.deleteAccount")}
                    </h3>
                    <p className="text-sm text-onair-muted">
                      {t("profile.security.deleteWarning")}
                    </p>

                    {showDeleteConfirm ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-onair-muted mb-2 block">
                            {t("profile.security.confirmDelete")}
                          </label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword("");
                            }}
                            className="btn-secondary flex-1"
                          >
                            {t("common.cancel")}
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleting || !deletePassword}
                            className="flex-1 px-6 py-2.5 text-white font-semibold rounded-xl bg-onair-red hover:bg-onair-red/90 transition-colors disabled:opacity-50"
                          >
                            <span>
                              {deleting
                                ? t("common.loading")
                                : t("profile.security.deleteBtn")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn-secondary text-onair-red border-onair-red/30 hover:bg-onair-red/5 hover:border-onair-red/50"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        {t("profile.security.deleteAccount")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== GOALS ==================== */}
              {activeTab === "goals" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-onair-text">
                      {t("profile.goals.title")}
                    </h2>
                    <p className="text-sm text-onair-muted mt-1">
                      {t("profile.goals.subtitle")}
                    </p>
                  </div>

                  <div className="card space-y-5">
                    <div>
                      <label className="text-sm text-onair-muted mb-2 block">
                        {t("profile.goals.fitnessGoal")}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "bulk",
                          "cut",
                          "maintain",
                          "recomp",
                          "strength",
                          "endurance",
                        ].map((g) => (
                          <button
                            key={g}
                            onClick={() => setForm({ ...form, goal: g })}
                            className={cn(
                              "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                              form.goal === g
                                ? "bg-onair-green/10 text-onair-green border border-onair-green/30 shadow-sm"
                                : "text-onair-muted hover:text-onair-text border border-onair-border hover:border-onair-green/30"
                            )}
                          >
                            {t(`profile.goals.goalTypes.${g}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving ? t("common.loading") : t("common.save")}
                    </span>
                  </button>
                </div>
              )}

              {/* ==================== PRIVACY ==================== */}
              {activeTab === "privacy" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-display font-bold text-onair-text">
                      {t("profile.privacy.title")}
                    </h2>
                    <p className="text-sm text-onair-muted mt-1">
                      {t("profile.privacy.subtitle")}
                    </p>
                  </div>

                  <div className="card space-y-5">
                    <div>
                      <label className="text-sm text-onair-muted mb-3 block">
                        {t("profile.privacy.profileVisibility")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(["public", "private"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setForm({ ...form, privacy: v })}
                            className={cn(
                              "p-4 rounded-xl text-left transition-all duration-200 border",
                              form.privacy === v
                                ? "bg-onair-purple/10 border-onair-purple/30 shadow-sm"
                                : "border-onair-border hover:border-onair-purple/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {v === "public" ? (
                                <Eye className="w-4 h-4 text-onair-purple" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-onair-purple" />
                              )}
                              <span
                                className={cn(
                                  "font-medium text-sm",
                                  form.privacy === v
                                    ? "text-onair-purple"
                                    : "text-onair-text"
                                )}
                              >
                                {t(`profile.privacy.${v}`)}
                              </span>
                            </div>
                            <p className="text-xs text-onair-muted">
                              {t(`profile.privacy.${v}Desc`)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving ? t("common.loading") : t("common.save")}
                    </span>
                  </button>
                </div>
              )}

              {/* ==================== LEGAL ==================== */}
              {activeTab === "legal" && (
                <LegalTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
