import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Plus,
  Timer,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Search,
  Info,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatDuration } from "@/lib/utils";
import SessionTimers from "@/components/workout/SessionTimers";

interface Exercise {
  id: string;
  name_fr: string;
  name_en: string;
  muscle_group: string;
  category: string;
  image_url?: string;
}

interface SetEntry {
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  duration_seconds: number;
  rpe: number | null;
  is_warmup: boolean;
  target_reps?: number;
  target_duration?: number;
  is_validated?: boolean;
}

function exName(ex: Exercise | undefined, lang: string): string {
  if (!ex) return "";
  return lang === "fr" ? ex.name_fr : ex.name_en;
}

interface ProgramDay {
  id: string;
  name: string;
  exercises: {
    exercise_id: string;
    exercise_order: number;
    sets: number;
    reps_min: number;
    reps_max: number;
    rest_seconds?: number;
    notes?: string;
    exercise?: Exercise;
  }[];
}

export default function SessionLogger() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get("dayId");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [feeling, setFeeling] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [programImageUrl, setProgramImageUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name_fr: "", name_en: "", muscle_group: "chest", category: "bodyweight",
  });
  const [creatingExercise, setCreatingExercise] = useState(false);

  useEffect(() => {
    api
      .get("/exercises?limit=500")
      .then((r) => setExercises(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 60000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const startSession = async () => {
    try {
      const { data } = await api.post("/workouts/sessions", {
        started_at: new Date().toISOString(),
        program_day_id: dayId || undefined,
      });
      setSessionId(data.id);
      setStartTime(new Date());
      toast.success(t("workouts.session.started"));

      // Pre-fill exercises from program day
      if (dayId && exercises.length > 0) {
        try {
          const programsRes = await api.get("/workouts/programs");
          const programs = programsRes.data;
          let day: ProgramDay | null = null;
          for (const p of programs) {
            const found = p.days.find((d: ProgramDay) => d.id === dayId);
            if (found) {
              day = found;
              if (p.image_url) setProgramImageUrl(p.image_url);
              break;
            }
          }
          if (day && day.exercises.length > 0) {
            const prefillSets: SetEntry[] = [];
            for (const pe of day.exercises.sort((a, b) => a.exercise_order - b.exercise_order)) {
              const ex = exercises.find((e) => e.id === pe.exercise_id) || pe.exercise;
              if (!ex) continue;
              const name = exName(ex, lang);
              const isDuration = pe.notes?.includes("secondes") || pe.notes?.includes("seconds") || pe.notes?.includes("maintien") || pe.notes?.includes("hold") || pe.notes?.includes("sec");
              for (let s = 1; s <= pe.sets; s++) {
                prefillSets.push({
                  exercise_id: pe.exercise_id,
                  exercise_name: name,
                  set_number: s,
                  reps: 0,
                  weight_kg: 0,
                  duration_seconds: 0,
                  rpe: null,
                  is_warmup: false,
                  target_reps: isDuration ? 0 : pe.reps_min,
                  target_duration: isDuration ? pe.reps_min : 0,
                  is_validated: false,
                });
              }
            }
            if (prefillSets.length > 0) {
              setSets(prefillSets);
              setPrefilled(true);
            }
          }
        } catch { /* ignore prefill errors */ }
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const addSet = useCallback(
    (exercise: Exercise) => {
      const existingSets = sets.filter((s) => s.exercise_id === exercise.id);
      setSets((prev) => [
        ...prev,
        {
          exercise_id: exercise.id,
          exercise_name: exName(exercise, lang),
          set_number: existingSets.length + 1,
          reps: 0,
          weight_kg: existingSets.length > 0 ? existingSets[existingSets.length - 1].weight_kg : 0,
          duration_seconds: 0,
          rpe: null,
          is_warmup: false,
        },
      ]);
      setShowExercisePicker(false);
      setSearchQuery("");
    },
    [sets, lang]
  );

  const updateSet = (idx: number, field: string, value: number | boolean) => {
    setSets((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      return updated;
    });
  };

  const removeSet = (idx: number) => {
    setSets((prev) => prev.filter((_, i) => i !== idx));
  };

  const validSets = sets.filter((s) => s.reps > 0 || s.duration_seconds > 0);
  const canSave = validSets.length > 0;

  const handleSave = () => {
    if (!canSave) {
      toast.error(t("workouts.session.noValidSets"));
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (!sessionId) return;
    setSaving(true);
    setShowConfirm(false);
    try {
      for (const s of validSets) {
        await api.post(`/workouts/sessions/${sessionId}/sets`, {
          exercise_id: s.exercise_id,
          set_number: s.set_number,
          reps: s.reps || null,
          weight_kg: s.weight_kg || null,
          duration_seconds: s.duration_seconds || null,
          rpe: s.rpe,
          is_warmup: s.is_warmup,
        });
      }
      await api.put(`/workouts/sessions/${sessionId}`, {
        finished_at: new Date().toISOString(),
        duration_minutes: elapsed,
        feeling,
        notes: notes || null,
        is_completed: true,
      });
      toast.success(t("workouts.session.saved"));
      navigate("/workouts");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (sets.length > 0) {
      setShowCancel(true);
    } else {
      confirmCancel();
    }
  };

  const confirmCancel = async () => {
    setShowCancel(false);
    if (sessionId) {
      try {
        await api.put(`/workouts/sessions/${sessionId}`, {
          finished_at: new Date().toISOString(),
          duration_minutes: elapsed,
          is_completed: false,
        });
      } catch {
        /* session stays as non-completed */
      }
    }
    navigate("/workouts");
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name_fr.trim() || !newExercise.name_en.trim()) return;
    setCreatingExercise(true);
    try {
      const { data } = await api.post("/exercises", newExercise);
      setExercises((prev) => [...prev, data]);
      setNewExercise({ name_fr: "", name_en: "", muscle_group: "chest", category: "bodyweight" });
      setShowCreateExercise(false);
      toast.success(t("workouts.exerciseCreated"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setCreatingExercise(false);
    }
  };

  const filteredExercises = exercises.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.name_fr.toLowerCase().includes(q) || e.name_en.toLowerCase().includes(q);
  });

  const groupedSets: { exerciseName: string; exerciseId: string; entries: { set: SetEntry; globalIdx: number }[] }[] = [];
  sets.forEach((s, idx) => {
    const existing = groupedSets.find((g) => g.exerciseId === s.exercise_id);
    if (existing) {
      existing.entries.push({ set: s, globalIdx: idx });
    } else {
      groupedSets.push({
        exerciseName: s.exercise_name,
        exerciseId: s.exercise_id,
        entries: [{ set: s, globalIdx: idx }],
      });
    }
  });

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-onair-red/10 flex items-center justify-center mx-auto mb-6 animate-glow">
            <Play className="w-10 h-10 text-onair-red" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">
            {t("workouts.startSession")}
          </h2>
          <p className="text-onair-muted mb-6">
            {t("workouts.session.description")}
          </p>
          <button onClick={startSession} className="btn-primary text-lg px-8 py-3">
            <span>{t("workouts.startSession")}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-28">
      {/* Header */}
      <div className="glass sticky top-16 z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="live-dot" />
          <span className="text-sm font-bold uppercase tracking-wider text-onair-red">
            {t("dashboard.onAir")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-onair-cyan font-mono text-lg">
          <Timer className="w-5 h-5" />
          {formatDuration(elapsed)}
        </div>
      </div>

      {/* Prefilled info banner */}
      {prefilled && (
        <div className="card !py-3 flex items-center gap-3 border-onair-cyan/30 bg-onair-cyan/5">
          <Info className="w-5 h-5 text-onair-cyan flex-shrink-0" />
          <span className="text-sm text-onair-cyan font-medium">
            {t("workouts.session.prefilled")}
          </span>
        </div>
      )}

      {/* Program routine image */}
      {programImageUrl && (
        <button
          onClick={() => setShowImageModal(true)}
          className="w-full rounded-2xl overflow-hidden border border-onair-border/30 hover:border-onair-cyan/50 transition-colors"
        >
          <img
            src={programImageUrl}
            alt="Routine"
            className="w-full h-44 object-cover"
          />
        </button>
      )}

      {/* Exercise list grouped */}
      {groupedSets.length > 0 ? (
        <div className="space-y-4">
          {groupedSets.map((group) => (
            <motion.div
              key={group.exerciseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card !p-0 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-onair-border flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-onair-cyan" />
                <span className="font-semibold text-sm text-onair-text">
                  {group.exerciseName}
                </span>
                <span className="text-xs text-onair-muted ml-auto">
                  {group.entries.length} {t("workouts.sets").toLowerCase()}
                </span>
              </div>
              <div className="divide-y divide-onair-border/50">
                {/* Column headers */}
                <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_3rem_2.5rem_2.5rem] gap-2 px-4 py-2 text-[10px] uppercase tracking-wider text-onair-muted font-medium">
                  <span className="text-center">#</span>
                  <span className="text-center">{t("workouts.weight")}</span>
                  <span className="text-center">{t("workouts.reps")}</span>
                  <span className="text-center">Sec</span>
                  <span className="text-center">RPE</span>
                  <span className="text-center">W</span>
                  <span />
                </div>
                {group.entries.map(({ set: s, globalIdx }) => {
                  const isValid = s.reps > 0 || s.duration_seconds > 0;
                  const hasTarget = (s.target_reps && s.target_reps > 0) || (s.target_duration && s.target_duration > 0);
                  return (
                    <div
                      key={globalIdx}
                      className={`grid grid-cols-[2.5rem_1fr_1fr_1fr_3rem_2.5rem_2.5rem] gap-2 px-4 py-2.5 items-center transition-colors ${
                        s.is_validated ? "bg-onair-green/10" : isValid ? "bg-onair-green/5" : ""
                      } ${s.is_warmup ? "border-l-2 border-onair-amber" : ""}`}
                    >
                      {/* Set number — tap to validate with targets */}
                      {hasTarget ? (
                        <button
                          onClick={() => {
                            setSets((prev) => {
                              const updated = [...prev];
                              const entry = updated[globalIdx];
                              if (entry.is_validated) {
                                entry.reps = 0;
                                entry.duration_seconds = 0;
                                entry.is_validated = false;
                              } else {
                                if (entry.target_reps) entry.reps = entry.target_reps;
                                if (entry.target_duration) entry.duration_seconds = entry.target_duration;
                                entry.is_validated = true;
                              }
                              return updated;
                            });
                          }}
                          className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs font-mono transition-colors ${
                            s.is_validated
                              ? "bg-onair-green text-white"
                              : "border border-onair-border text-onair-muted hover:border-onair-green hover:text-onair-green"
                          }`}
                          title={lang === "fr" ? "Valider avec la cible" : "Validate with target"}
                        >
                          {s.is_warmup && <span className="text-onair-amber text-[8px] absolute -top-0.5 -right-0.5">*</span>}
                          {s.is_validated ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.set_number}
                        </button>
                      ) : (
                        <span className="text-xs text-onair-muted text-center font-mono">
                          {s.is_warmup && <span className="text-onair-amber text-[8px] align-super">*</span>}
                          {s.set_number}
                        </span>
                      )}
                      <input
                        type="number"
                        value={s.weight_kg || ""}
                        onChange={(e) =>
                          updateSet(globalIdx, "weight_kg", +e.target.value)
                        }
                        className="text-center text-sm p-1.5 rounded-lg"
                        placeholder="kg"
                        min={0}
                        step={0.5}
                      />
                      <input
                        type="number"
                        value={s.reps || ""}
                        onChange={(e) =>
                          updateSet(globalIdx, "reps", +e.target.value)
                        }
                        className="text-center text-sm p-1.5 rounded-lg"
                        placeholder={s.target_reps ? `${s.target_reps}` : "reps"}
                        min={0}
                      />
                      <input
                        type="number"
                        value={s.duration_seconds || ""}
                        onChange={(e) =>
                          updateSet(globalIdx, "duration_seconds", +e.target.value)
                        }
                        className="text-center text-sm p-1.5 rounded-lg"
                        placeholder={s.target_duration ? `${s.target_duration}` : "sec"}
                        min={0}
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        value={s.rpe != null ? String(s.rpe).replace(".", ",") : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(",", ".");
                          if (raw === "") {
                            updateSet(globalIdx, "rpe", null);
                            return;
                          }
                          const val = parseFloat(raw);
                          if (!isNaN(val)) {
                            updateSet(globalIdx, "rpe", Math.min(10, Math.max(0, val)));
                          }
                        }}
                        className="text-center text-sm p-1.5 rounded-lg"
                        placeholder="RPE"
                      />
                      <button
                        onClick={() =>
                          updateSet(globalIdx, "is_warmup", !s.is_warmup)
                        }
                        className={`relative text-xs p-1.5 rounded-lg transition-colors group ${
                          s.is_warmup
                            ? "bg-onair-amber/20 text-onair-amber"
                            : "text-onair-muted hover:text-onair-amber hover:bg-onair-amber/10"
                        }`}
                      >
                        W
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onair-surface border border-onair-border text-[10px] text-onair-text px-2 py-1 rounded whitespace-nowrap opacity-0 group-active:opacity-100 transition-opacity pointer-events-none z-10">
                          {lang === "fr" ? "Série de chauffe" : "Warm-up set"}
                        </span>
                      </button>
                      <button
                        onClick={() => removeSet(globalIdx)}
                        className="p-1.5 rounded-lg text-onair-muted hover:text-onair-red hover:bg-onair-red/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  const ex = exercises.find((e) => e.id === group.exerciseId);
                  if (ex) addSet(ex);
                }}
                className="w-full px-4 py-2.5 text-xs font-medium text-onair-cyan hover:bg-onair-cyan/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("workouts.session.addSet")}
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10">
          <Dumbbell className="w-10 h-10 mx-auto text-onair-muted/30 mb-3" />
          <p className="text-sm text-onair-muted mb-1">
            {t("workouts.session.empty")}
          </p>
          <p className="text-xs text-onair-muted/60">
            {t("workouts.session.emptyHint")}
          </p>
        </div>
      )}

      {/* Add exercise button */}
      <button
        onClick={() => setShowExercisePicker(true)}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("workouts.addExercise")}
      </button>

      {/* Feeling & Notes */}
      <div className="card space-y-4">
        <h3 className="text-sm font-medium text-onair-muted">
          {t("workouts.feeling")}
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setFeeling(n)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                feeling === n
                  ? "bg-onair-cyan/20 text-onair-cyan border border-onair-cyan/30"
                  : "bg-onair-surface text-onair-muted hover:text-onair-text"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("workouts.notes")}
          className="w-full"
          rows={2}
        />
      </div>

      {/* Validation summary */}
      {sets.length > 0 && (
        <div
          className={`card !py-3 flex items-center gap-3 ${
            canSave
              ? "border-onair-green/30 bg-onair-green/5"
              : "border-onair-amber/30 bg-onair-amber/5"
          }`}
        >
          {canSave ? (
            <CheckCircle2 className="w-5 h-5 text-onair-green flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-onair-amber flex-shrink-0" />
          )}
          <div className="flex-1 text-sm">
            {canSave ? (
              <span className="text-onair-green font-medium">
                {t("workouts.session.readyToSave", { count: validSets.length })}
              </span>
            ) : (
              <span className="text-onair-amber font-medium">
                {t("workouts.session.noValidSets")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Session Timers (floating) */}
      <SessionTimers />

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 glass border-t border-onair-border">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleCancel}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 text-onair-muted"
          >
            <X className="w-4 h-4" />
            {t("workouts.session.abandon")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="btn-primary flex-[2] flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving ? t("common.loading") : t("workouts.session.saveSession")}
            </span>
          </button>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => {
              setShowExercisePicker(false);
              setSearchQuery("");
            }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="card w-full max-w-md max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">
                  {t("workouts.addExercise")}
                </h3>
                <button
                  onClick={() => {
                    setShowExercisePicker(false);
                    setSearchQuery("");
                  }}
                  className="p-1.5 rounded-lg hover:bg-onair-surface text-onair-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onair-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full pl-9"
                  autoFocus
                />
              </div>
              {showCreateExercise ? (
                <div className="space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-onair-muted">{t("workouts.customExercise.nameFr")}</label>
                      <input value={newExercise.name_fr} onChange={(e) => setNewExercise({ ...newExercise, name_fr: e.target.value })} className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-onair-muted">{t("workouts.customExercise.nameEn")}</label>
                      <input value={newExercise.name_en} onChange={(e) => setNewExercise({ ...newExercise, name_en: e.target.value })} className="w-full text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-onair-muted">{t("workouts.customExercise.muscleGroup")}</label>
                      <select value={newExercise.muscle_group} onChange={(e) => setNewExercise({ ...newExercise, muscle_group: e.target.value })} className="w-full text-sm">
                        {["chest","back","shoulders","biceps","triceps","quads","hamstrings","glutes","calves","abs","forearms","cardio","full_body"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-onair-muted">{t("workouts.customExercise.category")}</label>
                      <select value={newExercise.category} onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })} className="w-full text-sm">
                        {["barbell","dumbbell","cable","machine","bodyweight","cardio","stretching"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreateExercise(false)} className="btn-ghost text-sm flex-1">{t("common.cancel")}</button>
                    <button onClick={handleCreateExercise} disabled={creatingExercise} className="btn-primary text-sm flex-1">{t("common.save")}</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateExercise(true)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-onair-surface/50 hover:bg-onair-surface transition-colors flex items-center gap-2 text-onair-cyan text-sm font-medium mb-2"
                >
                  <Plus className="w-4 h-4" /> {t("workouts.customExercise.create")}
                </button>
              )}
              <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-1">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addSet(ex)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-onair-surface transition-colors flex items-center gap-3"
                  >
                    {ex.image_url && (
                      <img src={ex.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-onair-text">
                        {exName(ex, lang)}
                      </p>
                      <p className="text-xs text-onair-muted">
                        {ex.muscle_group}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-onair-cyan flex-shrink-0" />
                  </button>
                ))}
                {filteredExercises.length === 0 && (
                  <p className="text-center text-sm text-onair-muted py-8">
                    {t("common.noData")}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Save Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 rounded-2xl bg-onair-green/10 inline-flex mb-4">
                <CheckCircle2 className="w-8 h-8 text-onair-green" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t("workouts.session.confirmTitle")}
              </h3>
              <p className="text-sm text-onair-muted mb-1">
                {t("workouts.session.confirmSummary", {
                  exercises: groupedSets.length,
                  sets: validSets.length,
                  duration: formatDuration(elapsed),
                })}
              </p>
              <p className="text-xs text-onair-muted mb-6">
                {t("workouts.session.confirmHint")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-ghost flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={confirmSave}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t("workouts.session.saveSession")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Cancel Modal */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowCancel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 rounded-2xl bg-onair-red/10 inline-flex mb-4">
                <AlertTriangle className="w-8 h-8 text-onair-red" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t("workouts.session.abandonTitle")}
              </h3>
              <p className="text-sm text-onair-muted mb-6">
                {t("workouts.session.abandonDesc")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancel(false)}
                  className="btn-ghost flex-1"
                >
                  {t("workouts.session.continue")}
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-6 py-2.5 text-white font-semibold rounded-xl bg-onair-red hover:bg-onair-red/90 transition-colors"
                >
                  {t("workouts.session.abandon")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen image modal */}
      <AnimatePresence>
        {showImageModal && programImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={programImageUrl}
              alt="Routine"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
