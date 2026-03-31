import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Bell,
  CheckCheck,
  Dumbbell,
  Heart,
  MessageCircle,
  Gift,
  ChevronRight,
  Zap,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

interface NavbarProps {
  onMenuToggle: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  welcome: Gift,
  workout_completed: Dumbbell,
  like: Heart,
  comment: MessageCircle,
  whey_reminder: Zap,
  new_post: Users,
};

function timeAgo(dateStr: string, t: (k: string, opts?: any) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notifications.justNow");
  if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  return t("notifications.daysAgo", { count: days });
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "program" | "community">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    api
      .get("/notifications?limit=20")
      .then((r) => setNotifications(r.data))
      .catch(() => {});
    api
      .get("/notifications/count")
      .then((r) => setUnreadCount(r.data.unread))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const programTypes = new Set(["workout_completed", "whey_reminder"]);
  const filteredNotifications = notifTab === "all"
    ? notifications
    : notifTab === "program"
      ? notifications.filter((n) => programTypes.has(n.type))
      : notifications.filter((n) => !programTypes.has(n.type));

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 glass border-b border-onair-border/50 px-4 lg:px-6 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setOpen(!open);
                if (!open) fetchNotifications();
              }}
              className="relative p-2.5 rounded-xl text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-onair-red rounded-full px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-onair-border">
                    <h3 className="font-display font-semibold text-sm text-onair-text">
                      {t("notifications.title")}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-onair-cyan hover:underline"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {t("notifications.markAllRead")}
                      </button>
                    )}
                  </div>

                  {/* Category tabs */}
                  <div className="flex border-b border-onair-border">
                    {(["all", "program", "community"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setNotifTab(tab)}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                          notifTab === tab
                            ? "text-onair-cyan border-b-2 border-onair-cyan"
                            : "text-onair-muted hover:text-onair-text"
                        }`}
                      >
                        {t(`notifications.tabs.${tab}`)}
                      </button>
                    ))}
                  </div>

                  {/* List */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 mx-auto text-onair-muted opacity-30 mb-2" />
                        <p className="text-sm text-onair-muted">
                          {t("notifications.empty")}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => {
                        const Icon = typeIcons[notif.type] || Bell;
                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-onair-surface/50 transition-colors border-b border-onair-border/50 last:border-b-0"
                          >
                            <div
                              className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                                notif.is_read
                                  ? "bg-onair-surface text-onair-muted"
                                  : "bg-onair-red/10 text-onair-red"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    notif.is_read
                                      ? "text-onair-muted"
                                      : "text-onair-text"
                                  }`}
                                >
                                  {notif.title}
                                </p>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-onair-cyan flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-onair-muted mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-onair-muted/70 mt-1">
                                {timeAgo(notif.created_at, t)}
                              </p>
                            </div>
                            {notif.link && (
                              <ChevronRight className="w-4 h-4 text-onair-muted flex-shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Link */}
          {user && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 pl-3 border-l border-onair-border hover:bg-onair-surface/50 rounded-xl py-1.5 pr-3 transition-colors cursor-pointer"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-onair-cyan/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-onair-red to-onair-purple flex items-center justify-center text-sm font-bold text-white">
                  {user.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-onair-text">
                {user.username}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
