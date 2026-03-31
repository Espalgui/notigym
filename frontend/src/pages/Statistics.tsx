import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Trophy,
  Scale,
  Apple,
  Droplets,
  Footprints,
  Moon,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";

type Period = "week" | "month" | "year";

interface Summary {
  total_sessions: number;
  total_volume_kg: number;
  total_prs: number;
  avg_daily_calories: number;
  avg_daily_steps: number;
}

interface ActivityPoint {
  date: string;
  steps: number | null;
  active_calories: number | null;
  distance_km: number | null;
  active_minutes: number | null;
  sleep_hours: number | null;
  resting_heart_rate: number | null;
}

interface ProgressionData {
  period: Period;
  date_from: string;
  date_to: string;
  summary: Summary;
  workouts: { date: string; sessions: number; avg_duration: number; avg_feeling: number }[];
  volume: { date: string; volume: number; total_sets: number }[];
  body: { date: string; weight: number | null; body_fat: number | null }[];
  nutrition: { date: string; calories: number; protein: number; carbs: number; fat: number }[];
  water: { date: string; total_ml: number }[];
  personal_records: { date: string; count: number; best_1rm: number | null }[];
  activity: ActivityPoint[];
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function formatDateLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "year") {
    return d.toLocaleDateString("fr-FR", { month: "short" });
  }
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(0)}kg`;
}

export default function Statistics() {
  const { t } = useTranslation();
  const { resolvedTheme: theme } = useThemeStore();
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/stats/progression?period=${period}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const isDark = theme === "dark";

  const colors = {
    grid: isDark ? "#2a2a3e" : "#e5e5ea",
    axis: isDark ? "#6e6e73" : "#aeaeb2",
    tooltip: {
      bg: isDark ? "#1a1a2e" : "#ffffff",
      border: isDark ? "#2a2a3e" : "#e5e5ea",
      text: isDark ? "#e8e8ed" : "#1d1d1f",
    },
    red: isDark ? "#ff3b5c" : "#e8364d",
    cyan: isDark ? "#00f0ff" : "#0a84ff",
    green: isDark ? "#00e676" : "#34c759",
    amber: isDark ? "#ffab00" : "#ff9500",
    purple: isDark ? "#b388ff" : "#af52de",
    pink: isDark ? "#ff80ab" : "#ff2d55",
  };

  const tooltipStyle = {
    background: colors.tooltip.bg,
    border: `1px solid ${colors.tooltip.border}`,
    borderRadius: "12px",
    color: colors.tooltip.text,
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
    fontSize: "12px",
  };

  const periods: { key: Period; icon: typeof CalendarDays }[] = [
    { key: "week", icon: CalendarDays },
    { key: "month", icon: CalendarRange },
    { key: "year", icon: Calendar },
  ];

  const summaryCards = data
    ? [
        {
          icon: Dumbbell,
          label: t("stats.totalSessions"),
          value: data.summary.total_sessions,
          color: "text-onair-red",
          gradient: "from-onair-red/15 to-transparent",
        },
        {
          icon: Flame,
          label: t("stats.totalVolume"),
          value: formatVolume(data.summary.total_volume_kg),
          color: "text-onair-cyan",
          gradient: "from-onair-cyan/15 to-transparent",
        },
        {
          icon: Trophy,
          label: t("stats.personalRecords"),
          value: data.summary.total_prs,
          color: "text-onair-amber",
          gradient: "from-onair-amber/15 to-transparent",
        },
        {
          icon: Apple,
          label: t("stats.avgCalories"),
          value: data.summary.avg_daily_calories
            ? `${data.summary.avg_daily_calories} kcal`
            : "—",
          color: "text-onair-green",
          gradient: "from-onair-green/15 to-transparent",
        },
        {
          icon: TrendingUp,
          label: t("stats.avgSteps"),
          value: data.summary.avg_daily_steps
            ? data.summary.avg_daily_steps.toLocaleString()
            : "—",
          color: "text-blue-400",
          gradient: "from-blue-500/15 to-transparent",
        },
      ]
    : [];

  const hasWorkouts = data && data.workouts.length > 0;
  const hasVolume = data && data.volume.length > 0;
  const hasBody = data && data.body.length > 0;
  const hasNutrition = data && data.nutrition.length > 0;
  const hasWater = data && data.water.length > 0;
  const hasActivity = data && data.activity && data.activity.length > 0;
  const hasAnyData = hasWorkouts || hasVolume || hasBody || hasNutrition || hasWater || hasActivity;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeIn} transition={{ delay: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text">
              {t("stats.title")}
            </h1>
            <p className="text-onair-muted mt-1 text-sm">{t("stats.subtitle")}</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-onair-surface border border-onair-border">
            {periods.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === key
                    ? "text-onair-text"
                    : "text-onair-muted hover:text-onair-text"
                }`}
              >
                {period === key && (
                  <motion.div
                    layoutId="period-bg"
                    className="absolute inset-0 rounded-lg bg-onair-card border border-onair-border shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {t(`stats.${key}`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="live-dot scale-150" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {summaryCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="card relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                      <span className="stat-label">{card.label}</span>
                    </div>
                    <p className={`stat-value ${card.color}`}>{card.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {!hasAnyData && (
            <div className="card text-center py-16">
              <BarChart3 className="w-14 h-14 mx-auto text-onair-muted/20 mb-4" />
              <p className="text-lg font-medium text-onair-muted mb-2">
                {t("stats.noData")}
              </p>
              <p className="text-sm text-onair-muted/60">
                {t("stats.noDataHint")}
              </p>
            </div>
          )}

          {/* Workout Sessions - Area Chart */}
          {hasWorkouts && (
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-onair-red/10">
                    <Dumbbell className="w-5 h-5 text-onair-red" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.workoutProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.sessionsAndDuration")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data!.workouts}>
                    <defs>
                      <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.red} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.red} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.cyan} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="min"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      name={t("stats.sessions")}
                      stroke={colors.red}
                      strokeWidth={2}
                      fill="url(#sessionsGrad)"
                      dot={{ fill: colors.red, r: 3, strokeWidth: 0 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="avg_duration"
                      name={t("stats.avgDuration")}
                      stroke={colors.cyan}
                      strokeWidth={2}
                      fill="url(#durationGrad)"
                      dot={{ fill: colors.cyan, r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Volume Progression - Line Chart */}
          {hasVolume && (
            <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-onair-cyan/10">
                    <TrendingUp className="w-5 h-5 text-onair-cyan" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.volumeProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.volumeDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data!.volume}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="kg"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="volume"
                      name={t("stats.volume")}
                      stroke={colors.cyan}
                      strokeWidth={2.5}
                      dot={{ fill: colors.cyan, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? "#0a0a0f" : "#fff" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="total_sets"
                      name={t("stats.totalSets")}
                      stroke={colors.purple}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: colors.purple, r: 3, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Body Weight & Fat - Line Chart */}
          {hasBody && (
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-onair-green/10">
                    <Scale className="w-5 h-5 text-onair-green" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.bodyProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.bodyDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data!.body}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="kg"
                      domain={["auto", "auto"]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="%"
                      domain={["auto", "auto"]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      name={t("stats.weight")}
                      stroke={colors.green}
                      strokeWidth={2.5}
                      dot={{ fill: colors.green, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? "#0a0a0f" : "#fff" }}
                      connectNulls
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="body_fat"
                      name={t("stats.bodyFat")}
                      stroke={colors.amber}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: colors.amber, r: 3, strokeWidth: 0 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Nutrition - Area Chart */}
          {hasNutrition && (
            <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-onair-amber/10">
                    <Apple className="w-5 h-5 text-onair-amber" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.nutritionProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.nutritionDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={data!.nutrition}>
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.amber} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={colors.amber} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="protGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.red} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={colors.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit=" kcal"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="g"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="calories"
                      name={t("nutrition.calories")}
                      stroke={colors.amber}
                      strokeWidth={2}
                      fill="url(#calGrad)"
                      dot={{ fill: colors.amber, r: 3, strokeWidth: 0 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="protein"
                      name={t("nutrition.protein")}
                      stroke={colors.red}
                      strokeWidth={1.5}
                      fill="url(#protGrad)"
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="carbs"
                      name={t("nutrition.carbs")}
                      stroke={colors.cyan}
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="fat"
                      name={t("nutrition.fat")}
                      stroke={colors.purple}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Hydration - Area Chart */}
          {hasWater && (
            <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-onair-cyan/10">
                    <Droplets className="w-5 h-5 text-onair-cyan" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.hydration")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.hydrationDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data!.water}>
                    <defs>
                      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.cyan} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="ml"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="total_ml"
                      name={t("stats.waterMl")}
                      stroke={colors.cyan}
                      strokeWidth={2}
                      fill="url(#waterGrad)"
                      dot={{ fill: colors.cyan, r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Activity Steps + Calories Chart */}
          {hasActivity && (
            <motion.div {...fadeIn} transition={{ delay: 0.55 }}>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Footprints className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.activityProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.activityDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data!.activity}>
                    <defs>
                      <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="steps"
                      name={t("stats.stepsLabel")}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#stepsGrad)"
                      dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="active_calories"
                      name={t("stats.activeCalLabel")}
                      stroke={colors.amber}
                      strokeWidth={2}
                      dot={{ fill: colors.amber, r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Sleep Chart */}
          {hasActivity && data!.activity.some((a) => a.sleep_hours != null) && (
            <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-onair-text">
                      {t("stats.sleepProgression")}
                    </h2>
                    <p className="text-xs text-onair-muted">
                      {t("stats.sleepDesc")}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data!.activity}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => formatDateLabel(v, period)}
                    />
                    <YAxis
                      stroke={colors.axis}
                      fontSize={11}
                      tickLine={false}
                      unit="h"
                      domain={[0, 12]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="sleep_hours"
                      name={t("stats.sleepLabel")}
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="url(#sleepGrad)"
                      dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
