import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Search } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Exercise {
  id: string;
  name_fr: string;
  name_en: string;
  muscle_group: string;
  category: string;
}

interface ProgramExercise {
  id?: string;
  exercise_id: string;
  exercise_order: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  exercise?: Exercise;
}

interface Day {
  id?: string;
  name: string;
  day_order: number;
  exercises: ProgramExercise[];
}

export default function ProgramBuilder() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const [name, setName] = useState("");
  const [programType, setProgramType] = useState("custom");
  const [days, setDays] = useState<Day[]>([]);
  const [exerciseLib, setExerciseLib] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExerciseModal, setShowExerciseModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name_fr: "", name_en: "", muscle_group: "chest", category: "bodyweight",
  });
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [originalDays, setOriginalDays] = useState<Day[]>([]);

  useEffect(() => {
    api.get("/exercises?limit=500").then((r) => setExerciseLib(r.data)).catch(() => {});
    if (id) {
      api.get(`/workouts/programs/${id}`).then((r) => {
        const p = r.data;
        setName(p.name);
        setProgramType(p.program_type);
        const loadedDays = p.days.map((d: any) => ({
          id: d.id,
          name: d.name,
          day_order: d.day_order,
          exercises: d.exercises.map((e: any) => ({
            id: e.id,
            exercise_id: e.exercise_id,
            exercise_order: e.exercise_order,
            sets: e.sets,
            reps_min: e.reps_min,
            reps_max: e.reps_max,
            rest_seconds: e.rest_seconds,
            exercise: e.exercise,
          })),
        }));
        setDays(loadedDays);
        setOriginalDays(JSON.parse(JSON.stringify(loadedDays)));
      });
    }
  }, [id]);

  const addDay = () => {
    setDays([...days, { name: `Jour ${days.length + 1}`, day_order: days.length + 1, exercises: [] }]);
  };

  const removeDay = (idx: number) => {
    setDays(days.filter((_, i) => i !== idx));
  };

  const addExercise = (dayIdx: number, exercise: Exercise) => {
    const updated = [...days];
    updated[dayIdx].exercises.push({
      exercise_id: exercise.id,
      exercise_order: updated[dayIdx].exercises.length + 1,
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest_seconds: 90,
      exercise,
    });
    setDays(updated);
    setShowExerciseModal(null);
    setSearchTerm("");
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: string, value: number) => {
    const updated = [...days];
    (updated[dayIdx].exercises[exIdx] as any)[field] = value;
    setDays(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nom du programme requis"); return; }
    setSaving(true);
    try {
      let programId = id;
      if (!programId) {
        const { data } = await api.post("/workouts/programs", { name, program_type: programType });
        programId = data.id;
      } else {
        await api.put(`/workouts/programs/${programId}`, { name, program_type: programType });
      }

      // Delete removed days
      const currentDayIds = new Set(days.filter((d) => d.id).map((d) => d.id));
      for (const orig of originalDays) {
        if (orig.id && !currentDayIds.has(orig.id)) {
          await api.delete(`/workouts/programs/days/${orig.id}`);
        }
      }

      for (const [dayIdx, day] of days.entries()) {
        if (day.id) {
          // Update existing day
          await api.put(`/workouts/programs/days/${day.id}`, {
            name: day.name,
            day_order: dayIdx + 1,
          });

          // Delete removed exercises
          const currentExIds = new Set(day.exercises.filter((e) => e.id).map((e) => e.id));
          const origDay = originalDays.find((d) => d.id === day.id);
          if (origDay) {
            for (const origEx of origDay.exercises) {
              if (origEx.id && !currentExIds.has(origEx.id)) {
                await api.delete(`/workouts/programs/exercises/${origEx.id}`);
              }
            }
          }

          // Update or create exercises
          for (const [exIdx, ex] of day.exercises.entries()) {
            if (ex.id) {
              await api.put(`/workouts/programs/exercises/${ex.id}`, {
                exercise_order: exIdx + 1,
                sets: ex.sets,
                reps_min: ex.reps_min,
                reps_max: ex.reps_max,
                rest_seconds: ex.rest_seconds,
              });
            } else {
              await api.post(`/workouts/programs/days/${day.id}/exercises`, {
                exercise_id: ex.exercise_id,
                exercise_order: exIdx + 1,
                sets: ex.sets,
                reps_min: ex.reps_min,
                reps_max: ex.reps_max,
                rest_seconds: ex.rest_seconds,
              });
            }
          }
        } else {
          // Create new day
          const { data: prog } = await api.post(`/workouts/programs/${programId}/days`, {
            name: day.name,
            day_order: dayIdx + 1,
          });
          const createdDay = prog.days.find((d: any) => d.day_order === dayIdx + 1);
          if (createdDay) {
            for (const [exIdx, ex] of day.exercises.entries()) {
              await api.post(`/workouts/programs/days/${createdDay.id}/exercises`, {
                exercise_id: ex.exercise_id,
                exercise_order: exIdx + 1,
                sets: ex.sets,
                reps_min: ex.reps_min,
                reps_max: ex.reps_max,
                rest_seconds: ex.rest_seconds,
              });
            }
          }
        }
      }

      toast.success(t("common.success"));
      navigate("/workouts");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name_fr.trim() || !newExercise.name_en.trim()) return;
    setCreatingExercise(true);
    try {
      const { data } = await api.post("/exercises", newExercise);
      setExerciseLib((prev) => [...prev, data]);
      setNewExercise({ name_fr: "", name_en: "", muscle_group: "chest", category: "bodyweight" });
      setShowCreateExercise(false);
      toast.success(t("workouts.exerciseCreated"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setCreatingExercise(false);
    }
  };

  const filteredExercises = exerciseLib.filter((e) => {
    const term = searchTerm.toLowerCase();
    return e.name_fr.toLowerCase().includes(term) || e.name_en.toLowerCase().includes(term);
  });

  const exName = (e: Exercise) => (lang === "fr" ? e.name_fr : e.name_en);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/workouts")} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-display font-bold">{t("workouts.createProgram")}</h1>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-onair-muted mb-1.5">
              {t("workouts.programName")}
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-onair-muted mb-1.5">
              {t("workouts.programType")}
            </label>
            <select value={programType} onChange={(e) => setProgramType(e.target.value)} className="w-full">
              {["push_pull_legs", "upper_lower", "full_body", "bro_split", "custom"].map((type) => (
                <option key={type} value={type}>{t(`workouts.types.${type}` as any)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {days.map((day, dayIdx) => (
        <motion.div
          key={dayIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <input
              value={day.name}
              onChange={(e) => {
                const updated = [...days];
                updated[dayIdx].name = e.target.value;
                setDays(updated);
              }}
              className="bg-transparent border-none text-lg font-semibold p-0 focus:ring-0"
            />
            <button onClick={() => removeDay(dayIdx)} className="p-1 text-onair-muted hover:text-onair-red">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {day.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="flex items-center gap-3 p-3 bg-onair-surface rounded-lg">
                <GripVertical className="w-4 h-4 text-onair-muted flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">
                  {ex.exercise ? exName(ex.exercise) : ex.exercise_id}
                </span>
                <input
                  type="number"
                  value={ex.sets}
                  onChange={(e) => updateExercise(dayIdx, exIdx, "sets", +e.target.value)}
                  className="w-14 text-center text-sm p-1"
                  title={t("workouts.sets")}
                />
                <span className="text-onair-muted text-xs">x</span>
                <input
                  type="number"
                  value={ex.reps_min}
                  onChange={(e) => updateExercise(dayIdx, exIdx, "reps_min", +e.target.value)}
                  className="w-14 text-center text-sm p-1"
                />
                <span className="text-onair-muted text-xs">-</span>
                <input
                  type="number"
                  value={ex.reps_max}
                  onChange={(e) => updateExercise(dayIdx, exIdx, "reps_max", +e.target.value)}
                  className="w-14 text-center text-sm p-1"
                />
                <button onClick={() => removeExercise(dayIdx, exIdx)} className="text-onair-muted hover:text-onair-red">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowExerciseModal(dayIdx)}
            className="btn-ghost text-sm flex items-center gap-2 mt-3 text-onair-cyan"
          >
            <Plus className="w-4 h-4" /> {t("workouts.addExercise")}
          </button>
        </motion.div>
      ))}

      <div className="flex gap-3">
        <button onClick={addDay} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t("workouts.addDay")}
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 ml-auto">
          <Save className="w-4 h-4" />
          <span>{saving ? t("common.loading") : t("common.save")}</span>
        </button>
      </div>

      {/* Exercise picker modal */}
      {showExerciseModal !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg max-h-[70vh] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-onair-muted" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("common.search")}
                className="flex-1 bg-transparent border-none p-0 focus:ring-0"
                autoFocus
              />
              <button onClick={() => { setShowExerciseModal(null); setSearchTerm(""); }} className="btn-ghost text-sm">
                {t("common.cancel")}
              </button>
            </div>
            {showCreateExercise ? (
              <div className="space-y-3 p-2">
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
                className="w-full text-left p-3 rounded-lg bg-onair-surface/50 hover:bg-onair-surface transition-colors flex items-center gap-2 text-onair-cyan text-sm font-medium mb-2"
              >
                <Plus className="w-4 h-4" /> {t("workouts.customExercise.create")}
              </button>
            )}
            <div className="flex-1 overflow-auto space-y-1">
              {filteredExercises.slice(0, 50).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(showExerciseModal, ex)}
                  className="w-full text-left p-3 rounded-lg hover:bg-onair-surface transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{exName(ex)}</p>
                    <p className="text-xs text-onair-muted">{ex.muscle_group} / {ex.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
