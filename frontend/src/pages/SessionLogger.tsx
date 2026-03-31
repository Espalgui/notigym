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
  Link2,
  TrendingUp,
  Share2,
  Trophy,
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
  rest_seconds?: number;
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
  const [autoRestTrigger, setAutoRestTrigger] = useState<{ seconds: number; ts: number } | undefined>();
  const [autoRestEnabled, setAutoRestEnabled] = useState(() =>
    localStorage.getItem("notigym_auto_rest_timer") !== "false"
  );
  const [supersetLinks, setSupersetLinks] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Record<string, { weight: number; reps: number; suggested: number } | null>>({});
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

  // Disable pull-to-refresh while session is active (html for Chrome, body for Safari)
  useEffect(() => {
    if (!sessionId) return;
    document.documentElement.style.overscrollBehavior = "contain";
    document.body.style.overscrollBehavior = "contain";
    return () => {
      document.documentElement.style.overscrollBehavior = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [sessionId]);

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
                  rest_seconds: pe.rest_seconds,
                });
              }
            }
            if (prefillSets.length > 0) {
              setSets(prefillSets);
              setPrefilled(true);
              // Fetch overload suggestions
              const uniqueExIds = [...new Set(prefillSets.map((s) => s.exercise_id))];
              Promise.all(
                uniqueExIds.map((exId) =>
                  api.get(`/workouts/exercises/${exId}/last-performance`).then((r) => ({ exId, data: r.data })).catch(() => null)
                )
              ).then((results) => {
                const sugg: Record<string, { weight: number; reps: number; suggested: number } | null> = {};
                for (const r of results) {
                  if (!r || !r.data.sets || r.data.sets.length === 0) continue;
                  const lastSets = r.data.sets.filter((s: any) => s.weight_kg > 0);
                  if (lastSets.length === 0) continue;
                  const avgWeight = lastSets.reduce((sum: number, s: any) => sum + s.weight_kg, 0) / lastSets.length;
                  const avgReps = Math.round(lastSets.reduce((sum: number, s: any) => sum + (s.reps || 0), 0) / lastSets.length);
                  const suggested = Math.round((avgWeight * 1.025) * 2) / 2; // +2.5%, round to 0.5kg
                  sugg[r.exId] = { weight: avgWeight, reps: avgReps, suggested };
                }
                setSuggestions(sugg);
              });
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

  const updateSet = (idx: number, field: string, value: number | boolean | null) => {
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
      // Fetch summary and show share modal
      try {
        const summaryRes = await api.get(`/workouts/sessions/${sessionId}/summary`);
        setSessionSummary(summaryRes.data);
        setShowShareModal(true);
      } catch {
        navigate("/workouts");
      }
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

  // Superset helpers
  const ssKey = (a: string, b: string) => `${a}|${b}`;
  const isLinked = (a: string, b: string) => supersetLinks.has(ssKey(a, b));
  const toggleLink = (a: string, b: string) => {
    setSupersetLinks((prev) => {
      const next = new Set(prev);
      const k = ssKey(a, b);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };
  // Get superset color for a group (based on chain of links)
  const ssColors = ["border-onair-cyan", "border-onair-amber", "border-onair-purple", "border-onair-red"];
  const getSupersetColor = (groupIdx: number): string | null => {
    if (groupIdx > 0 && isLinked(groupedSets[groupIdx - 1].exerciseId, groupedSets[groupIdx].exerciseId)) {
      // Find the start of the chain
      let start = groupIdx;
      while (start > 0 && isLinked(groupedSets[start - 1].exerciseId, groupedSets[start].exerciseId)) start--;
      return ssColors[start % ssColors.length];
    }
    if (groupIdx < groupedSets.length - 1 && isLinked(groupedSets[groupIdx].exerciseId, groupedSets[groupIdx + 1].exerciseId)) {
      let start = groupIdx;
      while (start > 0 && isLinked(groupedSets[start - 1].exerciseId, groupedSets[start].exerciseId)) start--;
      return ssColors[start % ssColors.length];
    }
    return null;
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-onair-cyan font-mono text-lg">
            <Timer className="w-5 h-5" />
            {formatDuration(elapsed)}
          </div>
          <button
            onClick={() => {
              const next = !autoRestEnabled;
              setAutoRestEnabled(next);
              localStorage.setItem("notigym_auto_rest_timer", String(next));
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              autoRestEnabled
                ? "bg-onair-cyan/15 text-onair-cyan"
                : "bg-onair-surface text-onair-muted"
            }`}
            title={autoRestEnabled ? "Auto timer ON" : "Auto timer OFF"}
          >
            Auto
          </button>
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
          {groupedSets.map((group, groupIdx) => {
            const ssColor = getSupersetColor(groupIdx);
            const showLinkAfter = groupIdx < groupedSets.length - 1;
            return (
            <div key={group.exerciseId}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card !p-0 overflow-hidden ${ssColor ? `border-l-4 ${ssColor}` : ""}`}
            >
              <div className="px-4 py-3 border-b border-onair-border flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-onair-cyan" />
                <span className="font-semibold text-sm text-onair-text">
                  {group.exerciseName}
                </span>
                {ssColor && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-onair-surface text-onair-muted">
                    SS
                  </span>
                )}
                <span className="text-xs text-onair-muted ml-auto">
                  {group.entries.length} {t("workouts.sets").toLowerCase()}
                </span>
              </div>
              {/* Overload suggestion */}
              {suggestions[group.exerciseId] && suggestions[group.exerciseId]!.suggested !== suggestions[group.exerciseId]!.weight && (
                <div className="px-4 py-1.5 bg-onair-amber/5 flex items-center gap-2 text-xs text-onair-amber">
                  <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {lang === "fr" ? "Dernière" : "Last"}: {suggestions[group.exerciseId]!.weight}kg × {suggestions[group.exerciseId]!.reps} →{" "}
                    <span className="font-semibold">{suggestions[group.exerciseId]!.suggested}kg</span>
                  </span>
                </div>
              )}
              <div className="divide-y divide-onair-border/50">
                {/* Column headers */}
                <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem_2rem_2rem] gap-2 px-4 py-2 text-[10px] uppercase tracking-wider text-onair-muted font-medium">
                  <span className="text-center">#</span>
                  <span className="text-center">Kg</span>
                  <span className="text-center">Reps</span>
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
                      className={`grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem_2rem_2rem] gap-2 px-4 py-2.5 items-center transition-colors ${
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
                                // Auto rest timer (skip if mid-superset)
                                if (autoRestEnabled && entry.rest_seconds) {
                                  const nextGroup = groupedSets[groupIdx + 1];
                                  const inSuperset = nextGroup && isLinked(group.exerciseId, nextGroup.exerciseId);
                                  if (!inSuperset) {
                                    setAutoRestTrigger({ seconds: entry.rest_seconds, ts: Date.now() });
                                  }
                                }
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
                        className="text-center text-xs p-1 rounded-lg w-full"
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
                        className="text-center text-xs p-1 rounded-lg w-full"
                        placeholder={s.target_reps ? `${s.target_reps}` : "reps"}
                        min={0}
                      />
                      <input
                        type="number"
                        value={s.duration_seconds || ""}
                        onChange={(e) =>
                          updateSet(globalIdx, "duration_seconds", +e.target.value)
                        }
                        className="text-center text-xs p-1 rounded-lg w-full"
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
                        className="text-center text-xs p-1 rounded-lg w-full"
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
            {/* Superset link button */}
            {showLinkAfter && (
              <div className="flex justify-center -my-1.5 relative z-10">
                <button
                  onClick={() => toggleLink(group.exerciseId, groupedSets[groupIdx + 1].exerciseId)}
                  className={`p-1.5 rounded-full border-2 transition-all ${
                    isLinked(group.exerciseId, groupedSets[groupIdx + 1].exerciseId)
                      ? "bg-onair-cyan/20 border-onair-cyan text-onair-cyan"
                      : "bg-onair-bg border-onair-border text-onair-muted hover:border-onair-cyan hover:text-onair-cyan"
                  }`}
                  title="Superset"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            </div>
          );
          })}
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
      <SessionTimers autoRestTrigger={autoRestTrigger} />

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

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && sessionSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => { setShowShareModal(false); navigate("/workouts"); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-display font-bold text-xl text-onair-text">
                  {t("workouts.session.sessionComplete")}
                </h3>
              </div>

              {/* Summary card */}
              <div className="bg-onair-surface/50 rounded-xl p-4 mb-5 space-y-2">
                {sessionSummary.program_name && (
                  <p className="text-xs text-onair-cyan font-semibold">{sessionSummary.program_name}</p>
                )}
                {sessionSummary.day_name && (
                  <p className="text-sm font-semibold text-onair-text">{sessionSummary.day_name}</p>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="text-[10px] text-onair-muted uppercase">{lang === "fr" ? "Durée" : "Duration"}</p>
                    <p className="text-sm font-bold text-onair-text">{sessionSummary.duration_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-onair-muted uppercase">{lang === "fr" ? "Exercices" : "Exercises"}</p>
                    <p className="text-sm font-bold text-onair-text">{sessionSummary.exercise_count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-onair-muted uppercase">Volume</p>
                    <p className="text-sm font-bold text-onair-text">{sessionSummary.total_volume} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-onair-muted uppercase">
                      {sessionSummary.feeling ? ["", "😫", "😕", "😐", "😊", "🔥"][sessionSummary.feeling] : ""} {lang === "fr" ? "Ressenti" : "Feeling"}
                    </p>
                    <p className="text-sm font-bold text-onair-text">{sessionSummary.total_sets} sets</p>
                  </div>
                </div>
                {sessionSummary.pr_count > 0 && (
                  <div className="flex items-center gap-2 pt-2 text-onair-amber">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      {sessionSummary.pr_count} PR{sessionSummary.pr_count > 1 ? "s" : ""} !
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      const label = sessionSummary.day_name || sessionSummary.program_name || (lang === "fr" ? "Séance" : "Session");
                      await api.post("/community/posts", {
                        post_type: "workout",
                        content: `${label} — ${sessionSummary.duration_minutes} min, ${sessionSummary.exercise_count} ${lang === "fr" ? "exercices" : "exercises"}, ${sessionSummary.total_volume} kg`,
                        reference_id: String(sessionSummary.session_id),
                      });
                      toast.success(lang === "fr" ? "Publié !" : "Shared!");
                    } catch {
                      toast.error(t("common.error"));
                    }
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {lang === "fr" ? "Partager sur le fil" : "Share to feed"}
                </button>
                <button
                  onClick={() => { setShowShareModal(false); navigate("/workouts"); }}
                  className="btn-ghost w-full"
                >
                  {lang === "fr" ? "Fermer" : "Close"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
