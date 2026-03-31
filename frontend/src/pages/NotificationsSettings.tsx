import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, VolumeX, Volume2, Dumbbell, Users, Smartphone } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface UserForNotification {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Preferences {
  notifications_enabled: boolean;
  notif_program_enabled: boolean;
  notif_community_enabled: boolean;
  muted_user_ids: string[];
}

export default function NotificationsSettings() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [users, setUsers] = useState<UserForNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [mutingId, setMutingId] = useState<string | null>(null);
  const { subscribed: pushSubscribed, loading: pushLoading, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe, checkSubscription } = usePushNotifications();

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    Promise.all([
      api.get<Preferences>("/notifications/preferences"),
      api.get<UserForNotification[]>("/notifications/users"),
    ])
      .then(([prefsRes, usersRes]) => {
        setPrefs(prefsRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const toggleGlobal = async () => {
    if (!prefs || togglingGlobal) return;
    setTogglingGlobal(true);
    try {
      const res = await api.put<Preferences>("/notifications/preferences", {
        notifications_enabled: !prefs.notifications_enabled,
      });
      setPrefs(res.data);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setTogglingGlobal(false);
    }
  };

  const toggleCategory = async (category: "notif_program_enabled" | "notif_community_enabled") => {
    if (!prefs) return;
    try {
      const res = await api.put<Preferences>("/notifications/preferences", {
        notifications_enabled: prefs.notifications_enabled,
        [category]: !prefs[category],
      });
      setPrefs(res.data);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const toggleMute = async (userId: string) => {
    if (!prefs || mutingId) return;
    setMutingId(userId);
    const isMuted = prefs.muted_user_ids.includes(userId);
    try {
      if (isMuted) {
        await api.delete(`/notifications/mute/${userId}`);
        setPrefs((p) =>
          p ? { ...p, muted_user_ids: p.muted_user_ids.filter((id) => id !== userId) } : p
        );
      } else {
        await api.post(`/notifications/mute/${userId}`);
        setPrefs((p) =>
          p ? { ...p, muted_user_ids: [...p.muted_user_ids, userId] } : p
        );
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setMutingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="live-dot scale-150" />
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-onair-text">
          {t("notifications.settings.title")}
        </h1>
        <p className="text-sm text-onair-muted mt-1">
          {t("notifications.settings.subtitle")}
        </p>
      </div>

      {/* Toggle global */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                prefs.notifications_enabled
                  ? "bg-onair-cyan/10 text-onair-cyan"
                  : "bg-onair-surface text-onair-muted"
              }`}
            >
              {prefs.notifications_enabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-onair-text">
                {t("notifications.settings.globalLabel")}
              </p>
              <p className="text-xs text-onair-muted mt-0.5">
                {prefs.notifications_enabled
                  ? t("notifications.settings.globalOn")
                  : t("notifications.settings.globalOff")}
              </p>
            </div>
          </div>
          <button
            onClick={toggleGlobal}
            disabled={togglingGlobal}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
              prefs.notifications_enabled ? "bg-onair-cyan" : "bg-onair-border"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                prefs.notifications_enabled ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Push notifications toggle */}
      {"PushManager" in window && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-onair-purple/10">
                <Smartphone className="w-5 h-5 text-onair-purple" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-onair-text">
                  {t("notifications.settings.push") || "Notifications push"}
                </h3>
                <p className="text-xs text-onair-muted">
                  {pushSubscribed
                    ? (t("notifications.settings.pushOn") || "Activées sur cet appareil")
                    : (t("notifications.settings.pushOff") || "Recevoir des alertes sur cet appareil")}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (pushSubscribed) {
                  await pushUnsubscribe();
                  toast.success("Push désactivé");
                } else {
                  const ok = await pushSubscribe();
                  if (ok) toast.success("Push activé !");
                  else toast.error("Impossible d'activer les push");
                }
              }}
              disabled={pushLoading}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                pushSubscribed ? "bg-onair-purple" : "bg-onair-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                  pushSubscribed ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Category toggles */}
      {prefs.notifications_enabled && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-onair-text">
            {t("notifications.settings.categories")}
          </h2>
          {([
            { key: "notif_program_enabled" as const, icon: Dumbbell, label: t("notifications.settings.programLabel"), desc: t("notifications.settings.programDesc") },
            { key: "notif_community_enabled" as const, icon: Users, label: t("notifications.settings.communityLabel"), desc: t("notifications.settings.communityDesc") },
          ]).map(({ key, icon: Icon, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${prefs[key] ? "bg-onair-cyan/10 text-onair-cyan" : "bg-onair-surface text-onair-muted"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-onair-text">{label}</p>
                  <p className="text-xs text-onair-muted mt-0.5">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleCategory(key)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  prefs[key] ? "bg-onair-cyan" : "bg-onair-border"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                  prefs[key] ? "left-6" : "left-0.5"
                }`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-onair-text">
            {t("notifications.settings.usersTitle")}
          </h2>
          <p className="text-xs text-onair-muted mt-0.5">
            {t("notifications.settings.usersSubtitle")}
          </p>
        </div>

        {users.length === 0 ? (
          <div className="card py-10 text-center text-sm text-onair-muted">
            {t("notifications.settings.noUsers")}
          </div>
        ) : (
          <div className="card !p-0 divide-y divide-onair-border">
            {users.map((user) => {
              const isMuted = prefs.muted_user_ids.includes(user.id);
              const isProcessing = mutingId === user.id;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-onair-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-onair-red to-onair-purple flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {user.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-onair-text truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-onair-muted mt-0.5">
                      {isMuted
                        ? t("notifications.settings.muted")
                        : t("notifications.settings.notMuted")}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleMute(user.id)}
                    disabled={isProcessing || !prefs.notifications_enabled}
                    title={
                      isMuted
                        ? t("notifications.settings.unmute")
                        : t("notifications.settings.mute")
                    }
                    className={`p-2 rounded-xl transition-colors flex-shrink-0 disabled:opacity-40 ${
                      isMuted
                        ? "bg-onair-red/10 text-onair-red hover:bg-onair-red/20"
                        : "bg-onair-surface text-onair-muted hover:text-onair-text hover:bg-onair-surface/80"
                    }`}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
