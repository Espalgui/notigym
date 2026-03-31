import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  Coffee,
  Dumbbell,
  Settings2,
  X,
  Trash2,
} from "lucide-react";
import { addWeeks, format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface ScheduleSlot {
  id: string;
  program_id: string;
  program_day_id: string | null;
  weekday: number | null;
  is_rest_day: boolean;
  program_day_name: string | null;
  exercises_count: number;
}

interface Session {
  id: string;
  started_at: string;
  finished_at: string | null;
  duration_minutes: number | null;
  feeling: number | null;
  is_completed: boolean;
  program_day_id: string | null;
  sets: { weight_kg: number | null; reps: number | null }[];
}

interface Program {
  id: string;
  name: string;
  is_favorite: boolean;
  days: { id: string; name: string; exercises: any[] }[];
}

interface WeekData {
  schedule: ScheduleSlot[];
  sessions: Session[];
  program_name: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Planning() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const locale = lang === "fr" ? fr : enUS;

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const weekdays = t("planning.weekdays", { returnObjects: true }) as string[];

  // Fetch week data
  useEffect(() => {
    setLoading(true);
    const dateStr = format(weekStart, "yyyy-MM-dd");
    api
      .get(`/planning/week?date=${dateStr}`)
      .then((r) => setWeekData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [weekStart]);

  // Fetch programs for setup
  useEffect(() => {
    if (showSetup) {
      api.get("/workouts/programs").then((r) => setPrograms(r.data)).catch(() => {});
    }
  }, [showSetup]);

  const prevWeek = () => setWeekStart((w) => addWeeks(w, -1));
  const nextWeek = () => setWeekStart((w) => addWeeks(w, 1));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const hasSchedule = weekData && weekData.schedule.length > 0;

  const toggleDay = (d: number) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSave = async () => {
    if (!selectedProgram || selectedDays.length === 0) return;
    setSaving(true);
    try {
      await api.post("/planning/schedule/bulk", {
        program_id: selectedProgram,
        weekdays: selectedDays,
      });
      toast.success(t("planning.saved"));
      setShowSetup(false);
      // Refresh
      const dateStr = format(weekStart, "yyyy-MM-dd");
      const r = await api.get(`/planning/week?date=${dateStr}`);
      setWeekData(r.data);
    } catch {
      toast.error("Error");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.delete("/planning/schedule");
      toast.success(t("planning.cleared"));
      setWeekData({ schedule: [], sessions: [], program_name: null });
    } catch {
      toast.error("Error");
    }
  };

  // Pre-fill setup modal from existing schedule
  const openSetup = () => {
    if (weekData && weekData.schedule.length > 0) {
      setSelectedProgram(weekData.schedule[0].program_id);
      setSelectedDays(
        weekData.schedule
          .filter((s) => !s.is_rest_day && s.weekday != null)
          .map((s) => s.weekday!)
      );
    } else {
      setSelectedProgram(null);
      setSelectedDays([]);
    }
    setShowSetup(true);
  };

  // Build day cards
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const slot = weekData?.schedule.find((s) => s.weekday === i);
    const session = weekData?.sessions.find((s) =>
      isSameDay(new Date(s.started_at), date)
    );
    return { date, weekdayIdx: i, slot, session };
  });

  const totalVolume = (session: Session) =>
    session.sets.reduce(
      (sum, s) => sum + (s.weight_kg || 0) * (s.reps || 0),
      0
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ delay: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text flex items-center gap-3">
              <CalendarDays className="w-7 h-7 text-onair-cyan" />
              {t("planning.title")}
            </h1>
            <p className="text-onair-muted mt-1">{t("planning.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasSchedule && (
              <button
                onClick={handleClear}
                className="p-2 rounded-xl text-onair-muted hover:text-onair-red hover:bg-onair-red/10 transition-colors"
                title={t("planning.clearSchedule")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={openSetup}
              className="btn-ghost text-sm flex items-center gap-1.5"
            >
              <Settings2 className="w-4 h-4" />
              {hasSchedule ? t("planning.changeSchedule") : t("planning.configure")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Week navigation */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-onair-surface transition-colors">
            <ChevronLeft className="w-5 h-5 text-onair-muted" />
          </button>
          <div className="text-center">
            <button onClick={goToday} className="text-sm font-semibold text-onair-text hover:text-onair-cyan transition-colors">
              {t("planning.weekOf", {
                date: format(weekStart, "d MMMM yyyy", { locale }),
              })}
            </button>
            {weekData?.program_name && (
              <p className="text-xs text-onair-muted mt-0.5">{weekData.program_name}</p>
            )}
          </div>
          <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-onair-surface transition-colors">
            <ChevronRight className="w-5 h-5 text-onair-muted" />
          </button>
        </div>
      </motion.div>

      {/* Calendar grid or empty state */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-onair-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasSchedule ? (
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="card text-center py-16">
            <CalendarDays className="w-14 h-14 mx-auto text-onair-muted/30 mb-4" />
            <h3 className="text-lg font-semibold text-onair-text mb-2">
              {t("planning.noSchedule")}
            </h3>
            <p className="text-sm text-onair-muted mb-6 max-w-sm mx-auto">
              {t("planning.noScheduleHint")}
            </p>
            <button onClick={openSetup} className="btn-primary">
              {t("planning.configure")}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {days.map(({ date, weekdayIdx, slot, session }) => {
              const isDone = !!session;
              const isRest = slot?.is_rest_day;
              const isPlanned = slot && !isRest && !isDone;
              const today = isToday(date);

              return (
                <motion.div
                  key={weekdayIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * weekdayIdx }}
                  className={`card relative overflow-hidden transition-all ${
                    today ? "ring-2 ring-onair-cyan/50" : ""
                  } ${isPlanned ? "cursor-pointer hover:scale-[1.02]" : ""}`}
                  onClick={() => {
                    if (isPlanned && slot?.program_day_id) {
                      navigate(`/workouts/session?dayId=${slot.program_day_id}`);
                    }
                  }}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        today ? "text-onair-cyan" : "text-onair-muted"
                      }`}>
                        {weekdays[weekdayIdx]}
                      </span>
                      <p className={`text-lg font-display font-bold ${
                        today ? "text-onair-cyan" : "text-onair-text"
                      }`}>
                        {format(date, "d", { locale })}
                      </p>
                    </div>
                    {today && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-onair-cyan/15 text-onair-cyan">
                        {t("planning.today")}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  {isDone ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-onair-green">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">{t("planning.completed")}</span>
                      </div>
                      <p className="text-[11px] text-onair-muted truncate">
                        {slot?.program_day_name}
                      </p>
                      <div className="text-[11px] text-onair-muted space-y-0.5">
                        {session.duration_minutes && (
                          <p>{session.duration_minutes} min</p>
                        )}
                        {totalVolume(session) > 0 && (
                          <p>{Math.round(totalVolume(session))} kg</p>
                        )}
                        {session.feeling && (
                          <p>{["", "\ud83d\ude2b", "\ud83d\ude15", "\ud83d\ude10", "\ud83d\ude0a", "\ud83d\udd25"][session.feeling]}</p>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-onair-green/5 pointer-events-none" />
                    </div>
                  ) : isRest ? (
                    <div className="flex flex-col items-center justify-center py-3 opacity-50">
                      <Coffee className="w-5 h-5 text-onair-muted mb-1" />
                      <span className="text-xs text-onair-muted">{t("planning.rest")}</span>
                    </div>
                  ) : isPlanned ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-onair-cyan">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium truncate">
                          {slot?.program_day_name}
                        </span>
                      </div>
                      <p className="text-[10px] text-onair-muted">
                        {t("planning.exercises", { count: slot?.exercises_count || 0 })}
                      </p>
                      <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-onair-cyan/10 text-onair-cyan hover:bg-onair-cyan/20 transition-colors">
                        <Play className="w-3 h-3" />
                        {t("planning.startSession")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3 opacity-30">
                      <span className="text-xs text-onair-muted">—</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => setShowSetup(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="card w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">
                  {t("planning.configureTitle")}
                </h3>
                <button
                  onClick={() => setShowSetup(false)}
                  className="p-1.5 rounded-lg hover:bg-onair-surface text-onair-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Program selection */}
              <p className="text-sm font-medium text-onair-text mb-2">
                {t("planning.selectProgram")}
              </p>
              <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
                {programs.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => {
                      setSelectedProgram(prog.id);
                      // Auto-suggest weekdays based on number of days
                      if (selectedDays.length === 0) {
                        const days = prog.days.length;
                        if (days <= 5) {
                          setSelectedDays(Array.from({ length: days }, (_, i) => i));
                        } else {
                          setSelectedDays([0, 1, 2, 3, 4, 5]);
                        }
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      selectedProgram === prog.id
                        ? "border-onair-cyan bg-onair-cyan/10"
                        : "border-onair-border/50 hover:bg-onair-surface/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-onair-text">{prog.name}</p>
                    <p className="text-xs text-onair-muted">
                      {prog.days.length} {lang === "fr" ? "jours" : "days"}
                    </p>
                  </button>
                ))}
              </div>

              {/* Weekday selection */}
              <p className="text-sm font-medium text-onair-text mb-2">
                {t("planning.selectDays")}
              </p>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekdays.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedDays.includes(idx)
                        ? "bg-onair-cyan text-white shadow-lg shadow-onair-cyan/20"
                        : "bg-onair-surface text-onair-muted hover:bg-onair-surface/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!selectedProgram || selectedDays.length === 0 || saving}
                className="btn-primary w-full disabled:opacity-40"
              >
                {saving ? "..." : t("planning.saved").replace("!", "")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
