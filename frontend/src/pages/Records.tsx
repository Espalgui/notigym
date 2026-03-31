import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronDown,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";

interface PREntry {
  exercise_id: string;
  name_fr: string;
  name_en: string;
  muscle_group: string;
  image_url: string | null;
  best_1rm: number;
  best_weight: number;
  best_reps: number;
  last_pr_date: string;
  pr_count: number;
}

interface PRHistory {
  date: string;
  weight_kg: number;
  reps: number;
  estimated_1rm: number;
}

const muscleGroups = [
  "all", "chest", "back", "shoulders", "quads", "hamstrings",
  "glutes", "biceps", "triceps", "abs", "calves", "full_body",
];

const muscleLabels: Record<string, { fr: string; en: string }> = {
  all: { fr: "Tous", en: "All" },
  chest: { fr: "Pectoraux", en: "Chest" },
  back: { fr: "Dos", en: "Back" },
  shoulders: { fr: "Épaules", en: "Shoulders" },
  quads: { fr: "Quadriceps", en: "Quads" },
  hamstrings: { fr: "Ischio", en: "Hamstrings" },
  glutes: { fr: "Fessiers", en: "Glutes" },
  biceps: { fr: "Biceps", en: "Biceps" },
  triceps: { fr: "Triceps", en: "Triceps" },
  abs: { fr: "Abdos", en: "Abs" },
  calves: { fr: "Mollets", en: "Calves" },
  full_body: { fr: "Full body", en: "Full body" },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Records() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const [prs, setPrs] = useState<PREntry[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [history, setHistory] = useState<PRHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workouts/records/wall")
      .then((r) => setPrs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? prs : prs.filter((p) => p.muscle_group === filter);

  const toggleExpand = async (exerciseId: string) => {
    if (expanded === exerciseId) {
      setExpanded(null);
      return;
    }
    setExpanded(exerciseId);
    setLoadingHistory(true);
    try {
      const r = await api.get(`/workouts/records/exercise/${exerciseId}/history`);
      setHistory(r.data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const chartColors = {
    grid: isDark ? "#2a2a3e" : "#e5e5ea",
    axis: isDark ? "#8e8e93" : "#86868b",
    line: isDark ? "#00f0ff" : "#0a84ff",
    tooltip: {
      bg: isDark ? "#1a1a2e" : "#ffffff",
      border: isDark ? "#2a2a3e" : "#e5e5ea",
      text: isDark ? "#e8e8ed" : "#1d1d1f",
    },
  };

  const fmtDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ delay: 0 }}>
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-onair-amber" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text">
              {t("records.title")}
            </h1>
            <p className="text-onair-muted mt-0.5 text-sm">
              {prs.length} {t("records.totalPrs")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Muscle group filter */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {muscleGroups.filter((mg) => mg === "all" || prs.some((p) => p.muscle_group === mg)).map((mg) => (
            <button
              key={mg}
              onClick={() => setFilter(mg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === mg
                  ? "bg-onair-amber/15 text-onair-amber"
                  : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
              }`}
            >
              {muscleLabels[mg]?.[lang] ?? mg}
            </button>
          ))}
        </div>
      </motion.div>

      {/* PR Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-onair-amber border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="card text-center py-16">
            <Trophy className="w-14 h-14 mx-auto text-onair-muted/30 mb-4" />
            <h3 className="text-lg font-semibold text-onair-text mb-2">
              {t("records.noRecords")}
            </h3>
            <p className="text-sm text-onair-muted max-w-sm mx-auto">
              {t("records.noRecordsHint")}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pr, idx) => {
            const isOpen = expanded === pr.exercise_id;
            return (
              <motion.div
                key={pr.exercise_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <div className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => toggleExpand(pr.exercise_id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-onair-surface/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-onair-amber/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-onair-amber" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-onair-text truncate">
                        {lang === "fr" ? pr.name_fr : pr.name_en}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-onair-muted mt-0.5">
                        <span>{muscleLabels[pr.muscle_group]?.[lang] ?? pr.muscle_group}</span>
                        <span>{pr.pr_count} PR{pr.pr_count > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-onair-text">
                        {pr.best_weight}kg × {pr.best_reps}
                      </p>
                      <p className="text-[10px] text-onair-amber">
                        1RM ~ {pr.best_1rm}kg
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-onair-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-onair-border"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-onair-cyan" />
                            <span className="text-xs font-semibold text-onair-text">
                              {t("records.progression")}
                            </span>
                          </div>
                          {loadingHistory ? (
                            <div className="flex justify-center py-8">
                              <div className="w-5 h-5 border-2 border-onair-cyan border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : history.length > 1 ? (
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={history.map((h) => ({ ...h, date: fmtDate(h.date) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis dataKey="date" stroke={chartColors.axis} fontSize={10} tickLine={false} />
                                <YAxis stroke={chartColors.axis} fontSize={10} tickLine={false} unit="kg" />
                                <Tooltip
                                  contentStyle={{
                                    background: chartColors.tooltip.bg,
                                    border: `1px solid ${chartColors.tooltip.border}`,
                                    borderRadius: "12px",
                                    color: chartColors.tooltip.text,
                                  }}
                                  formatter={(value: number) => [`${value} kg`, "1RM"]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="estimated_1rm"
                                  stroke={chartColors.line}
                                  strokeWidth={2}
                                  dot={{ fill: chartColors.line, r: 3 }}
                                  activeDot={{ fill: chartColors.line, r: 5 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-xs text-onair-muted text-center py-6">
                              {t("records.needMoreData")}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
