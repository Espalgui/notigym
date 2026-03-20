import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  Dumbbell, Scale, Apple, TrendingUp, Flame, Target, ChevronRight, Zap,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { formatWeight, formatDate, formatVolume } from "@/lib/utils";

interface WorkoutStats {
  total_sessions: number;
  total_sets: number;
  total_volume_kg: number;
  avg_session_duration_min: number | null;
  sessions_this_week: number;
  sessions_this_month: number;
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    api.get("/workouts/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/body/measurements?limit=30").then((r) => setMeasurements(r.data)).catch(() => {});
  }, []);

  const weightData = [...measurements]
    .reverse()
    .filter((m) => m.weight_kg)
    .map((m) => ({
      date: formatDate(m.measured_at),
      weight: m.weight_kg,
    }));

  const isDark = theme === "dark";
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

  const quickActions = [
    {
      icon: Dumbbell,
      label: t("dashboard.startSession"),
      color: "text-onair-red",
      bg: "from-onair-red/10 to-onair-pink/5",
      href: "/workouts/session",
    },
    {
      icon: Scale,
      label: t("dashboard.logWeight"),
      color: "text-onair-cyan",
      bg: "from-onair-cyan/10 to-onair-purple/5",
      href: "/body",
    },
    {
      icon: Apple,
      label: t("dashboard.logMeal"),
      color: "text-onair-green",
      bg: "from-onair-green/10 to-onair-amber/5",
      href: "/nutrition",
    },
  ];

  const statCards = [
    {
      icon: Flame,
      label: t("dashboard.sessionsWeek"),
      value: stats?.sessions_this_week ?? 0,
      color: "text-onair-amber",
      gradient: "from-onair-amber/15 to-transparent",
    },
    {
      icon: Target,
      label: t("dashboard.sessionsMonth"),
      value: stats?.sessions_this_month ?? 0,
      color: "text-onair-purple",
      gradient: "from-onair-purple/15 to-transparent",
    },
    {
      icon: Zap,
      label: t("dashboard.totalVolume"),
      value: stats ? formatVolume(stats.total_volume_kg) : "0kg",
      color: "text-onair-cyan",
      gradient: "from-onair-cyan/15 to-transparent",
    },
    {
      icon: TrendingUp,
      label: t("dashboard.currentWeight"),
      value: measurements[0]?.weight_kg
        ? `${formatWeight(measurements[0].weight_kg)}kg`
        : "—",
      color: "text-onair-green",
      gradient: "from-onair-green/15 to-transparent",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ delay: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text">
              {t("dashboard.welcome", { name: user?.first_name || "" })}
            </h1>
            <p className="text-onair-muted mt-1">{t("dashboard.title")}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.href}
              onClick={() => navigate(action.href)}
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

      {/* Stats Grid */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="stat-label">{card.label}</span>
                </div>
                <p className={`stat-value ${card.color}`}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

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
    </div>
  );
}
