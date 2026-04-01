import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  Dumbbell, Scale, Apple, TrendingUp, Flame, Target, ChevronRight, Clock, X, Play, Star, Droplets, Plus, Zap, CalendarDays,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { formatWeight, formatDate } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import OnboardingTour from "@/components/OnboardingTour";

interface Program {
  id: string;
  name: string;
  program_type: string;
  is_favorite: boolean;
  days: { id: string; name: string; exercises: any[] }[];
}

interface WorkoutStats {
  total_sessions: number;
  total_sets: number;
  total_volume_kg: number;
  avg_session_duration_min: number | null;
  sessions_this_week: number;
  sessions_this_month: number;
  total_duration_this_week: number;
}

interface Measurement {
  id: string;
  measured_at: string;
  weight_kg: number | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resolvedTheme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [customWater, setCustomWater] = useState("");
  const [streak, setStreak] = useState(0);
  const [nextSession, setNextSession] = useState<{ dayName: string; weekday: string; programName: string | null; date: string } | null>(null);
  const [hasPlanning, setHasPlanning] = useState(true); // assume true until checked
  const [macros, setMacros] = useState<{
    total_calories: number; total_protein_g: number; total_carbs_g: number; total_fat_g: number;
    goal?: { calories: number; protein_g: number; carbs_g: number; fat_g: number } | null;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    api.get("/workouts/stats").then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
    api.get("/body/measurements?limit=30").then((r) => setMeasurements(r.data)).catch(() => {});
    api.get("/workouts/programs").then((r) => setPrograms(r.data)).catch(() => {});
    api.get(`/nutrition/water?date=${today}`).then((r) => {
      setWaterTotal(r.data.total_ml || 0);
      setWaterGoal(r.data.goal_ml || 2000);
    }).catch(() => {});
    api.get("/achievements/streak").then((r) => setStreak(r.data.current_streak || 0)).catch(() => {});
    api.get("/planning/week").then((r) => {
      const allSlots = r.data.schedule || [];
      if (allSlots.length === 0) {
        setHasPlanning(false);
        return;
      }
      // Backend weekday: 0=Mon..6=Sun. JS getDay(): 0=Sun,1=Mon..6=Sat
      const jsDay = new Date().getDay();
      const todayBackend = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon..6=Sun
      const slots = allSlots.filter((s: any) => !s.is_rest_day);
      const completedBackendDays = new Set(
        (r.data.sessions || []).map((s: any) => {
          const d = new Date(s.started_at).getDay();
          return d === 0 ? 6 : d - 1;
        })
      );
      const weekdayNames: string[] = t("planning.weekdaysFull", { returnObjects: true }) as any;
      for (let offset = 0; offset < 7; offset++) {
        const day = (todayBackend + offset) % 7;
        const slot = slots.find((s: any) => s.weekday === day);
        if (slot && !completedBackendDays.has(day)) {
          const now = new Date();
          const jsToday = now.getDay() === 0 ? 6 : now.getDay() - 1;
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + ((day - jsToday + 7) % 7));
          setNextSession({
            dayName: slot.program_day_name || "",
            weekday: weekdayNames[day],
            programName: r.data.program_name || null,
            date: targetDate.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long" }),
          });
          break;
        }
      }
    }).catch(() => {});
    api.get(`/nutrition/summary?date=${today}`).then((r) => setMacros(r.data)).catch(() => {});
  }, []);

  const addWater = async (ml: number) => {
    try {
      await api.post("/nutrition/water", { date: today, amount_ml: ml });
      setWaterTotal((prev) => prev + ml);
    } catch {}
  };

  const weightData = [...measurements]
    .reverse()
    .filter((m) => m.weight_kg)
    .map((m) => ({
      date: formatDate(m.measured_at),
      weight: m.weight_kg,
    }));

  const isDark = resolvedTheme === "dark";
  const chartColors = {
    grid: isDark ? "#2a2a3e" : "#e5e5ea",
    axis: isDark ? "#8e8e93" : "#86868b",
    cyan: isDark ? "#00f0ff" : "#0a84ff",
    tooltip: {
      bg: isDark ? "#1a1a2e" : "#ffffff",
      border: isDark ? "#2a2a3e" : "#e5e5ea",
      text: isDark ? "#e8e8ed" : "#1d1d1f",
    },
  };

  const sortedPrograms = [...programs].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    return 0;
  });

  const handleStartSession = () => {
    if (programs.length === 0) {
      navigate("/workouts/session");
    } else {
      setShowProgramPicker(true);
    }
  };

  const quickActions = [
    {
      icon: Dumbbell,
      label: t("dashboard.startSession"),
      color: "text-onair-red",
      bg: "from-onair-red/10 to-onair-pink/5",
      onClick: handleStartSession,
    },
    {
      icon: Scale,
      label: t("dashboard.logWeight"),
      color: "text-onair-cyan",
      bg: "from-onair-cyan/10 to-onair-purple/5",
      onClick: () => navigate("/body"),
    },
    {
      icon: Apple,
      label: t("dashboard.logMeal"),
      color: "text-onair-green",
      bg: "from-onair-green/10 to-onair-amber/5",
      onClick: () => navigate("/nutrition"),
    },
  ];

  const statCards = [
    {
      icon: Flame,
      label: t("dashboard.sessionsWeek"),
      value: user?.weekly_sessions_goal
        ? `${stats?.sessions_this_week ?? 0}/${user.weekly_sessions_goal}`
        : (stats?.sessions_this_week ?? 0),
      color: "text-onair-amber",
      gradient: "from-onair-amber/15 to-transparent",
      to: "/workouts?tab=history",
      progress: user?.weekly_sessions_goal
        ? Math.min(1, (stats?.sessions_this_week ?? 0) / user.weekly_sessions_goal)
        : undefined,
    },
    {
      icon: Clock,
      label: t("dashboard.durationWeek"),
      value: stats ? `${Math.round(stats.total_duration_this_week)}min` : "0min",
      color: "text-onair-red",
      gradient: "from-onair-red/15 to-transparent",
      to: "/workouts?tab=history",
    },
    {
      icon: Target,
      label: t("dashboard.sessionsMonth"),
      value: stats?.sessions_this_month ?? 0,
      color: "text-onair-purple",
      gradient: "from-onair-purple/15 to-transparent",
      to: "/workouts?tab=history",
    },
    {
      icon: TrendingUp,
      label: t("dashboard.currentWeight"),
      value: measurements[0]?.weight_kg
        ? `${formatWeight(measurements[0].weight_kg)}kg`
        : "—",
      color: "text-onair-green",
      gradient: "from-onair-green/15 to-transparent",
      to: "/body",
    },
    {
      icon: Zap,
      label: t("dashboard.streak"),
      value: `${streak}j`,
      color: "text-onair-cyan",
      gradient: "from-onair-cyan/15 to-transparent",
      to: "/achievements",
    },
  ];

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && user && user.has_completed_onboarding === false) {
      setShowOnboarding(true);
    }
  }, [loading, user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ delay: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text">
              {t("dashboard.welcome", { name: user?.username || "" })}
            </h1>
            <p className="text-onair-muted mt-1">{t("dashboard.title")}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="card-hover flex flex-col items-center gap-3 py-5 cursor-pointer group"
            >
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${action.bg} group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-onair-text">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* No Planning Alert */}
      {!hasPlanning && (
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <div
            onClick={() => navigate("/planning")}
            className="card relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 border-onair-amber/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-onair-amber/10 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-onair-amber/10">
                <CalendarDays className="w-5 h-5 text-onair-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-onair-amber">{t("dashboard.noPlanningTitle")}</p>
                <p className="text-xs text-onair-muted">{t("dashboard.noPlanningDesc")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-onair-amber flex-shrink-0" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Session */}
      {nextSession && (
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <div
            onClick={() => navigate("/planning")}
            className="card relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-onair-red/10 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-onair-red/10">
                <CalendarDays className="w-5 h-5 text-onair-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-onair-muted">{t("dashboard.nextSession")}</p>
                <p className="text-sm font-semibold text-onair-text">{nextSession.weekday} {nextSession.date}</p>
                {(nextSession.programName || nextSession.dayName) && (
                  <p className="text-xs text-onair-muted truncate">
                    {[nextSession.programName, nextSession.dayName].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-onair-muted flex-shrink-0" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.to)}
              className="card relative overflow-hidden cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="stat-label">{card.label}</span>
                </div>
                <p className={`stat-value ${card.color}`}>{card.value}</p>
                {"progress" in card && card.progress !== undefined && (
                  <div className="mt-2 h-1.5 rounded-full bg-onair-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-onair-amber transition-all duration-500"
                      style={{ width: `${Math.round(card.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Water Widget */}
      <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-onair-cyan/10 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-5">
            {/* Circular progress ring */}
            <div className="relative flex-shrink-0">
              <svg width="90" height="90" viewBox="0 0 90 90" className="text-onair-cyan">
                <circle
                  cx="45" cy="45" r="38"
                  fill="none"
                  style={{ stroke: "var(--border)" }}
                  strokeWidth="7"
                  opacity="0.3"
                />
                <motion.circle
                  cx="45" cy="45" r="38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - Math.min(1, waterTotal / waterGoal)) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  transform="rotate(-90 45 45)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className="w-4 h-4 text-onair-cyan mb-0.5" />
                <span className="text-sm font-bold text-onair-text">
                  {Math.round((waterTotal / waterGoal) * 100)}%
                </span>
              </div>
            </div>
            {/* Info + buttons */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-semibold text-onair-text">
                  {t("dashboard.water.title")}
                </span>
              </div>
              <p className="text-sm text-onair-muted mb-3">
                <span className="text-onair-cyan font-semibold">{waterTotal}</span> / {waterGoal} ml
              </p>
              <div className="flex gap-2">
                {[250, 500, 1000].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => addWater(ml)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-onair-cyan/10 text-onair-cyan hover:bg-onair-cyan/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    {ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  value={customWater}
                  onChange={(e) => setCustomWater(e.target.value)}
                  placeholder="ml"
                  className="flex-1 text-xs text-center !py-2 !px-2 !ring-0"
                />
                <button
                  onClick={() => {
                    const ml = parseInt(customWater);
                    if (ml > 0) { addWater(ml); setCustomWater(""); }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-onair-cyan/10 text-onair-cyan hover:bg-onair-cyan/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Macros */}
      {macros?.goal && (
        <motion.div {...fadeInUp} transition={{ delay: 0.27 }}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-onair-text">{t("dashboard.dailyMacros")}</span>
              <button onClick={() => navigate("/nutrition")} className="btn-ghost text-xs flex items-center gap-1">
                {t("nav.nutrition")} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: t("nutrition.protein"), current: macros.total_protein_g, goal: macros.goal.protein_g, color: "bg-onair-red" },
                { label: t("nutrition.carbs"), current: macros.total_carbs_g, goal: macros.goal.carbs_g, color: "bg-onair-cyan" },
                { label: t("nutrition.fat"), current: macros.total_fat_g, goal: macros.goal.fat_g, color: "bg-purple-400" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-onair-muted">{m.label}</span>
                    <span className="text-xs font-mono text-onair-text">
                      {Math.round(m.current)}g / {Math.round(m.goal)}g
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-onair-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.round((m.current / m.goal) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-onair-border flex items-center justify-between">
                <span className="text-xs text-onair-muted">{t("nutrition.calories")}</span>
                <span className="text-sm font-bold text-onair-amber">
                  {macros.total_calories} / {macros.goal.calories} kcal
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weight Chart */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-onair-text">
              {t("dashboard.weightProgress")}
            </h2>
            <button
              onClick={() => navigate("/body")}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              {t("body.title")} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.cyan} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={chartColors.axis}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={chartColors.axis}
                  fontSize={11}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{
                    background: chartColors.tooltip.bg,
                    border: `1px solid ${chartColors.tooltip.border}`,
                    borderRadius: "12px",
                    color: chartColors.tooltip.text,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={chartColors.cyan}
                  strokeWidth={2}
                  fill="url(#weightGradient)"
                  dot={{ fill: chartColors.cyan, r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: chartColors.cyan, r: 5, strokeWidth: 2, stroke: isDark ? "#0a0a0f" : "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-onair-muted">
              <div className="text-center">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">{t("common.noData")}</p>
                <button
                  onClick={() => navigate("/body")}
                  className="btn-primary mt-4 text-sm"
                >
                  {t("dashboard.logWeight")}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Program Picker Modal */}
      <AnimatePresence>
        {showProgramPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => { setShowProgramPicker(false); setExpandedProgram(null); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="card w-full max-w-md max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg">{t("dashboard.chooseProgram")}</h3>
                  <p className="text-xs text-onair-muted mt-1">{t("dashboard.chooseProgramDesc")}</p>
                </div>
                <button
                  onClick={() => { setShowProgramPicker(false); setExpandedProgram(null); }}
                  className="p-1.5 rounded-lg hover:bg-onair-surface text-onair-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free session option */}
              <button
                onClick={() => {
                  setShowProgramPicker(false);
                  navigate("/workouts/session");
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-onair-surface/50 hover:bg-onair-surface transition-colors flex items-center gap-3 mb-3"
              >
                <div className="p-2 rounded-lg bg-onair-red/10">
                  <Play className="w-4 h-4 text-onair-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-onair-text">{t("dashboard.freeSession")}</p>
                  <p className="text-xs text-onair-muted">{t("dashboard.freeSessionDesc")}</p>
                </div>
              </button>

              {/* Programs list */}
              <div className="overflow-y-auto flex-1 space-y-2">
                {sortedPrograms.map((program) => (
                  <div key={program.id} className="rounded-xl border border-onair-border/50 overflow-hidden">
                    <button
                      onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-onair-surface/50 transition-colors"
                    >
                      {program.is_favorite && (
                        <Star className="w-3.5 h-3.5 text-onair-amber fill-current flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-onair-text truncate">{program.name}</p>
                        <p className="text-xs text-onair-muted">
                          {program.days.length} {t("workouts.days")}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-onair-muted transition-transform ${expandedProgram === program.id ? "rotate-90" : ""}`} />
                    </button>
                    {expandedProgram === program.id && (
                      <div className="border-t border-onair-border/50 bg-onair-surface/20">
                        {program.days.map((day) => (
                          <button
                            key={day.id}
                            onClick={() => {
                              setShowProgramPicker(false);
                              setExpandedProgram(null);
                              navigate(`/workouts/session?dayId=${day.id}`);
                            }}
                            className="w-full text-left px-6 py-2.5 flex items-center justify-between hover:bg-onair-surface/50 transition-colors group"
                          >
                            <div>
                              <p className="text-sm text-onair-text">{day.name}</p>
                              <p className="text-xs text-onair-muted">{day.exercises.length} {t("workouts.exercises")}</p>
                            </div>
                            <Play className="w-3.5 h-3.5 text-onair-red opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
