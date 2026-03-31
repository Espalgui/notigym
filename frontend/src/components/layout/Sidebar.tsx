import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Footprints,
  Apple,
  Users,
  User,
  LogOut,
  X,
  Sun,
  Moon,
  BarChart3,
  Download,
  Timer,
  Radio,
  Bell,
  ChevronDown,
  ChefHat,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ShieldCheck } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navSections = [
  {
    items: [
      { to: "/", icon: LayoutDashboard, key: "nav.dashboard", accent: null },
    ],
  },
  {
    label: "nav.sectionSport",
    items: [
      { to: "/workouts", icon: Dumbbell, key: "nav.workouts", accent: null },
      { to: "/planning", icon: CalendarDays, key: "nav.planning", accent: null },
      { to: "/timers", icon: Timer, key: "nav.timers", accent: "amber" },
      { to: "/activity", icon: Footprints, key: "nav.activity", accent: null },
    ],
  },
  {
    label: "nav.sectionBody",
    items: [
      { to: "/body", icon: Activity, key: "nav.body", accent: null },
      { to: "/statistics", icon: BarChart3, key: "nav.statistics", accent: null },
    ],
  },
  {
    label: "nav.sectionNutrition",
    items: [
      { to: "/nutrition", icon: Apple, key: "nav.nutrition", accent: null },
      { to: "/recipes", icon: ChefHat, key: "nav.recipes", accent: null },
    ],
  },
  {
    label: "nav.sectionSocial",
    items: [
      { to: "/community", icon: Users, key: "nav.community", accent: null },
    ],
  },
  {
    label: "nav.sectionPersonal",
    items: [
      { to: "/notes", icon: StickyNote, key: "nav.notes", accent: "amber" },
    ],
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const isAdmin = user?.is_admin ?? false;
  const { theme, toggle } = useThemeStore();
  const { canInstall, install } = usePWAInstall();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <NavLink
        to="/"
        onClick={onClose}
        className="p-6 flex items-center gap-3 hover:bg-onair-surface/50 transition-colors cursor-pointer"
      >
        <Radio className="w-8 h-8 text-onair-red" />
        <div>
          <h1 className="text-xl font-display font-bold gradient-text">
            NotiGym
          </h1>
        </div>
      </NavLink>

      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        {navSections.map((section, sIdx) => {
          const isCollapsed = section.label ? collapsed[section.label] ?? false : false;
          return (
          <div key={sIdx}>
            {section.label && (
              <button
                onClick={() => toggleSection(section.label!)}
                className="flex items-center justify-between w-full px-4 mb-1 group"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-onair-muted/50 group-hover:text-onair-muted transition-colors">
                  {t(section.label)}
                </p>
                <ChevronDown className={cn(
                  "w-3 h-3 text-onair-muted/40 group-hover:text-onair-muted transition-all",
                  isCollapsed && "-rotate-90"
                )} />
              </button>
            )}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, key, accent }) => {
                const ACTIVE_CLASSES = {
                  amber: "bg-amber-500/10 text-amber-400 shadow-sm",
                  default: "bg-onair-red/10 text-onair-red shadow-sm",
                };
                const ACTIVE_ICON_CLASSES = {
                  amber: "bg-amber-500/15",
                  default: "bg-onair-red/15",
                };
                const ACTIVE_DOT_CLASSES = {
                  amber: "bg-amber-400",
                  default: "bg-onair-red",
                };
                const activeClass = accent === "amber" ? ACTIVE_CLASSES.amber : ACTIVE_CLASSES.default;
                const activeIconClass = accent === "amber" ? ACTIVE_ICON_CLASSES.amber : ACTIVE_ICON_CLASSES.default;
                const activeDotClass = accent === "amber" ? ACTIVE_DOT_CLASSES.amber : ACTIVE_DOT_CLASSES.default;

                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? activeClass
                          : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isActive ? activeIconClass : "group-hover:bg-onair-surface"
                          )}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span>{t(key)}</span>
                        {isActive && (
                          <div className={cn("ml-auto w-1.5 h-1.5 rounded-full", activeDotClass)} />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          );
        })}
      </nav>

      {/* Admin */}
      {isAdmin && (
        <div className="px-4 pb-1">
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-onair-cyan/10 text-onair-cyan"
                  : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
              }`
            }
          >
            <div className="p-1.5 rounded-lg bg-onair-cyan/10">
              <ShieldCheck className="w-4 h-4 text-onair-cyan" />
            </div>
            <span>{t("admin.title")}</span>
          </NavLink>
        </div>
      )}

      {/* Install PWA */}
      {canInstall && (
        <div className="px-4 pb-1">
          <button
            onClick={install}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm
                       text-onair-cyan hover:text-onair-text hover:bg-onair-surface
                       transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-onair-cyan/10 group-hover:bg-onair-surface">
              <Download className="w-4 h-4" />
            </div>
            <span>{t("nav.installApp")}</span>
          </button>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm
                     text-onair-muted hover:text-onair-text hover:bg-onair-surface
                     transition-all duration-200"
        >
          <div className="p-1.5 rounded-lg">
            {theme === "dark" ? (
              <Sun className="w-4.5 h-4.5" />
            ) : (
              <Moon className="w-4.5 h-4.5" />
            )}
          </div>
          <span>
            {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
          </span>
          <div className="ml-auto relative w-10 h-5 rounded-full bg-onair-border transition-colors">
            <motion.div
              layout
              className="absolute top-0.5 w-4 h-4 rounded-full bg-onair-text"
              animate={{ left: theme === "dark" ? 2 : 22 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </div>

      <div className="p-4 border-t border-onair-border">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-9 h-9 rounded-full object-cover border-2 border-onair-cyan/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-onair-red to-onair-purple flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {user.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.username}
              </p>
              <p className="text-xs text-onair-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm
                     text-onair-muted hover:text-onair-red hover:bg-onair-red/5
                     transition-all duration-200"
        >
          <div className="p-1.5 rounded-lg">
            <LogOut className="w-4.5 h-4.5" />
          </div>
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col bg-onair-surface border-r border-onair-border z-30 transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-onair-surface border-r border-onair-border z-50 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-onair-muted hover:text-onair-text hover:bg-onair-surface"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
