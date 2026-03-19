import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Footprints,
  Flame,
  Moon,
  Route,
  Building2,
  Timer,
  Heart,
  Plus,
  CalendarDays,
  Trash2,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import toast from "react-hot-toast";

interface ActivityEntry {
  id: string;
  date: string;
  steps: number | null;
  active_calories: number | null;
  total_calories: number | null;
  distance_km: number | null;
  floors_climbed: number | null;
  active_minutes: number | null;
  resting_heart_rate: number | null;
  sleep_hours: number | null;
  notes: string | null;
  source: string;
}

interface Summary {
  avg_steps: number;
  avg_active_calories: number;
  avg_distance_km: number;
  avg_sleep_hours: number;
  total_active_minutes: number;
  days_recorded: number;
}

const fields = [
  { key: "steps", icon: Footprints, type: "int", color: "text-blue-400" },
  { key: "activeCalories", field: "active_calories", icon: Flame, type: "int", color: "text-orange-400" },
  { key: "totalCalories", field: "total_calories", icon: Flame, type: "int", color: "text-red-400" },
  { key: "distance", field: "distance_km", icon: Route, type: "float", color: "text-green-400", suffix: "km" },
  { key: "floorsClimbed", field: "floors_climbed", icon: Building2, type: "int", color: "text-purple-400" },
  { key: "activeMinutes", field: "active_minutes", icon: Timer, type: "int", color: "text-cyan-400", suffix: "min" },
  { key: "restingHeartRate", field: "resting_heart_rate", icon: Heart, type: "int", color: "text-red-500", suffix: "bpm" },
  { key: "sleepHours", field: "sleep_hours", icon: Moon, type: "float", color: "text-indigo-400", suffix: "h" },
] as const;

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Activity() {
  const { t, i18n } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [entry, setEntry] = useState<ActivityEntry | null>(null);
  const [history, setHistory] = useState<ActivityEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"today" | "history">("today");

  const [form, setForm] = useState<Record<string, string>>({
    steps: "",
    active_calories: "",
    total_calories: "",
    distance_km: "",
    floors_climbed: "",
    active_minutes: "",
    resting_heart_rate: "",
    sleep_hours: "",
    notes: "",
  });

  const locale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

  const fetchDayData = useCallback(async (date: string) => {
    try {
      const { data: list } = await api.get(`/activity/?date_from=${date}&date_to=${date}&limit=1`);
      const existing = list.length > 0 ? list[0] : null;
      setEntry(existing);

      if (existing) {
        const newForm: Record<string, string> = { notes: existing.notes || "" };
        fields.forEach((f) => {
          const fieldName = f.field || f.key;
          const val = existing[fieldName as keyof ActivityEntry];
          newForm[fieldName] = val != null ? String(val) : "";
        });
        setForm(newForm);
      } else {
        setForm({
          steps: "", active_calories: "", total_calories: "",
          distance_km: "", floors_climbed: "", active_minutes: "",
          resting_heart_rate: "", sleep_hours: "", notes: "",
        });
      }
    } catch { /* ignore */ }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/activity/?limit=30");
      setHistory(data);
    } catch { /* ignore */ }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get("/activity/summary?days=7");
      setSummary(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchDayData(selectedDate);
  }, [selectedDate, fetchDayData]);

  useEffect(() => {
    fetchHistory();
    fetchSummary();
  }, [fetchHistory, fetchSummary]);

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) {
      setSelectedDate(toLocalDateString(d));
    }
  };

  const isToday = selectedDate === toLocalDateString(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { date: selectedDate };
      fields.forEach((f) => {
        const fieldName = f.field || f.key;
        const val = form[fieldName];
        if (val !== "") {
          payload[fieldName] = f.type === "float" ? parseFloat(val) : parseInt(val, 10);
        }
      });
      if (form.notes.trim()) payload.notes = form.notes.trim();

      await api.post("/activity/", payload);
      toast.success(entry ? t("activity.todayUpdated") : t("activity.todaySaved"));
      await fetchDayData(selectedDate);
      await fetchHistory();
      await fetchSummary();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/activity/${id}`);
      toast.success(t("activity.deleted"));
      setEntry(null);
      setForm({
        steps: "", active_calories: "", total_calories: "",
        distance_km: "", floors_climbed: "", active_minutes: "",
        resting_heart_rate: "", sleep_hours: "", notes: "",
      });
      await fetchHistory();
      await fetchSummary();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const formatDisplayDate = (date: string) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(date + "T12:00:00"));
  };

  const formatShortDate = (date: string) => {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(new Date(date + "T12:00:00"));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-onair-text flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Footprints className="w-6 h-6 text-blue-400" />
            </div>
            {t("activity.title")}
          </h1>
          <p className="text-sm text-onair-muted mt-1">{t("activity.subtitle")}</p>
        </div>

        <div className="flex gap-2">
          {(["today", "history"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === k
                  ? "bg-blue-500/15 text-blue-400 shadow-sm"
                  : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
              }`}
            >
              {t(`activity.${k}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && summary.days_recorded > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: t("activity.avgSteps"), value: summary.avg_steps.toLocaleString(), icon: Footprints, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: t("activity.avgCalories"), value: summary.avg_active_calories.toLocaleString(), icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: t("activity.avgSleep"), value: `${summary.avg_sleep_hours}h`, icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: t("activity.totalActive"), value: String(summary.total_active_minutes), icon: Timer, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: t("activity.daysRecorded"), value: String(summary.days_recorded), icon: CalendarDays, color: "text-green-400", bg: "bg-green-500/10" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-onair-text">{card.value}</p>
              <p className="text-xs text-onair-muted mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === "today" ? (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Date Selector */}
            <div className="card p-4 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 rounded-xl hover:bg-onair-surface text-onair-muted hover:text-onair-text transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-lg font-semibold text-onair-text capitalize">
                    {isToday ? t("activity.today") : formatDisplayDate(selectedDate)}
                  </p>
                  {isToday && (
                    <p className="text-xs text-onair-muted">{formatDisplayDate(selectedDate)}</p>
                  )}
                  <input
                    type="date"
                    value={selectedDate}
                    max={toLocalDateString(new Date())}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 text-xs bg-transparent text-onair-muted cursor-pointer border-none outline-none text-center"
                  />
                </div>

                <button
                  onClick={() => changeDate(1)}
                  disabled={isToday}
                  className="p-2 rounded-xl hover:bg-onair-surface text-onair-muted hover:text-onair-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {fields.map((f) => {
                  const fieldName = (f.field || f.key) as string;
                  const Icon = f.icon;
                  return (
                    <div key={fieldName} className="card p-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-onair-muted mb-2">
                        <Icon className={`w-4 h-4 ${f.color}`} />
                        {t(`activity.${f.key}`)}
                        {f.suffix && <span className="text-xs opacity-60">({f.suffix})</span>}
                      </label>
                      <input
                        type="number"
                        step={f.type === "float" ? "0.1" : "1"}
                        min="0"
                        value={form[fieldName]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [fieldName]: e.target.value }))}
                        placeholder="—"
                        className="w-full text-lg font-semibold bg-transparent border-none outline-none
                                   text-onair-text placeholder:text-onair-border focus:ring-0 p-0"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="card p-4 mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-onair-muted mb-2">
                  <StickyNote className="w-4 h-4 text-yellow-400" />
                  {t("activity.notes")}
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={t("activity.notesPlaceholder")}
                  rows={2}
                  className="w-full bg-transparent border-none outline-none text-onair-text
                             placeholder:text-onair-border focus:ring-0 p-0 resize-none text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {entry ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      {loading ? t("common.loading") : t("activity.updateActivity")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {loading ? t("common.loading") : t("activity.saveActivity")}
                    </>
                  )}
                </button>
                {entry && (
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {history.length === 0 ? (
              <div className="card p-12 text-center">
                <Footprints className="w-12 h-12 text-onair-border mx-auto mb-4" />
                <p className="text-onair-muted font-medium">{t("activity.noData")}</p>
                <p className="text-sm text-onair-muted mt-1">{t("activity.noDataHint")}</p>
              </div>
            ) : (
              history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-4 flex items-center gap-4 cursor-pointer hover:ring-1 hover:ring-onair-border transition-all"
                  onClick={() => {
                    setSelectedDate(item.date);
                    setTab("today");
                  }}
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-onair-text">
                      {new Date(item.date + "T12:00:00").getDate()}
                    </p>
                    <p className="text-xs text-onair-muted uppercase">
                      {formatShortDate(item.date).split(" ").slice(1).join(" ")}
                    </p>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                    {item.steps != null && (
                      <div className="flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-onair-text font-medium">{item.steps.toLocaleString()}</span>
                      </div>
                    )}
                    {item.active_calories != null && (
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-onair-text font-medium">{item.active_calories} kcal</span>
                      </div>
                    )}
                    {item.sleep_hours != null && (
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-onair-text font-medium">{item.sleep_hours}h</span>
                      </div>
                    )}
                    {item.distance_km != null && (
                      <div className="flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-onair-text font-medium">{item.distance_km} km</span>
                      </div>
                    )}
                    {item.active_minutes != null && (
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-onair-text font-medium">{item.active_minutes} min</span>
                      </div>
                    )}
                    {item.resting_heart_rate != null && (
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-onair-text font-medium">{item.resting_heart_rate} bpm</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 rounded-lg text-onair-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
