import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, RotateCcw, Trash2, ShieldCheck, ShieldOff, Copy, Check, Search } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_admin: boolean;
  is_2fa_enabled: boolean;
  gender: string | null;
  goal: string | null;
  training_type: string | null;
  created_at: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => toast.error(t("common.error")));
  }, []);

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = async (userId: string) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: data.is_active } : u)));
      toast.success(data.is_active ? t("admin.activated") : t("admin.deactivated"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-password`);
      setTempPasswords((prev) => ({ ...prev, [userId]: data.temp_password }));
      toast.success(t("admin.passwordReset"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const copyPassword = (userId: string) => {
    const pwd = tempPasswords[userId];
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopied(userId);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDelete(null);
      toast.success(t("admin.userDeleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-onair-cyan" />
        <h1 className="text-2xl font-display font-bold">{t("admin.title")}</h1>
        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-onair-cyan/10 text-onair-cyan rounded-full">
          {users.length} {t("admin.users")}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onair-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search")}
          className="w-full pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`card ${!user.is_active ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-onair-red to-onair-purple flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {user.first_name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.is_admin && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-onair-cyan/10 text-onair-cyan">
                      Admin
                    </span>
                  )}
                  {!user.is_active && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-onair-red/10 text-onair-red">
                      {t("admin.inactive")}
                    </span>
                  )}
                  {user.is_2fa_enabled && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-onair-green/10 text-onair-green">
                      2FA
                    </span>
                  )}
                </div>
                <p className="text-sm text-onair-muted truncate">{user.email}</p>
                <p className="text-xs text-onair-muted/60 mt-0.5">
                  {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  {user.goal && ` · ${user.goal}`}
                  {user.training_type && ` · ${user.training_type}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mot de passe temporaire */}
                {tempPasswords[user.id] && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-onair-amber/10 border border-onair-amber/20">
                    <code className="text-xs font-mono text-onair-amber">{tempPasswords[user.id]}</code>
                    <button onClick={() => copyPassword(user.id)} className="text-onair-amber hover:text-onair-text transition-colors">
                      {copied === user.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Reset mdp */}
                {!user.is_admin && (
                  <button
                    onClick={() => resetPassword(user.id)}
                    title={t("admin.resetPassword")}
                    className="p-2 rounded-lg text-onair-muted hover:text-onair-amber hover:bg-onair-amber/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* Activer / Désactiver */}
                {!user.is_admin && (
                  <button
                    onClick={() => toggleActive(user.id)}
                    title={user.is_active ? t("admin.deactivate") : t("admin.activate")}
                    className={`p-2 rounded-lg transition-colors ${
                      user.is_active
                        ? "text-onair-muted hover:text-onair-red hover:bg-onair-red/10"
                        : "text-onair-muted hover:text-onair-green hover:bg-onair-green/10"
                    }`}
                  >
                    {user.is_active ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </button>
                )}

                {/* Supprimer */}
                {!user.is_admin && (
                  confirmDelete === user.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-2 py-1 text-xs rounded-lg bg-onair-red text-white hover:bg-onair-red/80 transition-colors"
                      >
                        {t("common.confirm")}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 text-xs rounded-lg bg-onair-surface text-onair-muted hover:text-onair-text transition-colors"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      title={t("admin.deleteUser")}
                      className="p-2 rounded-lg text-onair-muted hover:text-onair-red hover:bg-onair-red/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="card text-center py-10">
            <Users className="w-10 h-10 mx-auto text-onair-muted/30 mb-3" />
            <p className="text-onair-muted">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
