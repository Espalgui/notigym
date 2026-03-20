import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { Apple, Plus, Droplets, Target } from "lucide-react";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import toast from "react-hot-toast";
import { useHydrationReminder } from "@/hooks/useHydrationReminder";

interface NutritionSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  goal: { calories: number; protein_g: number; carbs_g: number; fat_g: number; water_goal_ml?: number } | null;
  calories_remaining: number | null;
  entries: any[];
}

interface WaterSummary {
  date: string;
  total_ml: number;
  goal_ml: number;
  entries: { id: string; amount_ml: number; created_at: string }[];
}

export default function Nutrition() {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [waterSummary, setWaterSummary] = useState<WaterSummary | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [entryForm, setEntryForm] = useState({
    meal_type: "lunch", food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", quantity: "", unit: "g",
  });
  const [goalForm, setGoalForm] = useState({ calories: "2000", protein_g: "150", carbs_g: "250", fat_g: "70", water_goal_ml: "2000" });
  const [customWater, setCustomWater] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(
    () => parseInt(localStorage.getItem("hydration_reminder_interval") || "45", 10)
  );
  const { setReminderInterval } = useHydrationReminder();

  const fetchSummary = () => {
    api.get(`/nutrition/summary?date=${date}`).then((r) => setSummary(r.data)).catch(() => {});
  };

  const fetchWater = () => {
    api.get(`/nutrition/water?date=${date}`).then((r) => setWaterSummary(r.data)).catch(() => {});
  };

  useEffect(() => { fetchSummary(); fetchWater(); }, [date]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { date, meal_type: entryForm.meal_type, food_name: entryForm.food_name };
      if (entryForm.calories) payload.calories = +entryForm.calories;
      if (entryForm.protein_g) payload.protein_g = +entryForm.protein_g;
      if (entryForm.carbs_g) payload.carbs_g = +entryForm.carbs_g;
      if (entryForm.fat_g) payload.fat_g = +entryForm.fat_g;
      if (entryForm.quantity) payload.quantity = +entryForm.quantity;
      if (entryForm.unit) payload.unit = entryForm.unit;
      await api.post("/nutrition/entries", payload);
      toast.success(t("common.success"));
      setShowAddEntry(false);
      setEntryForm({ meal_type: "lunch", food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", quantity: "", unit: "g" });
      fetchSummary();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSetGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/nutrition/goals", {
        calories: +goalForm.calories,
        protein_g: +goalForm.protein_g,
        carbs_g: +goalForm.carbs_g,
        fat_g: +goalForm.fat_g,
        water_goal_ml: +goalForm.water_goal_ml,
      });
      toast.success(t("common.success"));
      setShowGoalForm(false);
      fetchSummary();
      fetchWater();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleAddWater = async (ml: number) => {
    if (!ml || ml <= 0) return;
    try {
      await api.post("/nutrition/water", { date, amount_ml: ml });
      fetchWater();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const macroData = summary ? [
    { name: t("nutrition.protein"), value: summary.total_protein_g, color: isDark ? "#00f0ff" : "#0a84ff" },
    { name: t("nutrition.carbs"), value: summary.total_carbs_g, color: isDark ? "#ffb800" : "#ff9f0a" },
    { name: t("nutrition.fat"), value: summary.total_fat_g, color: isDark ? "#ff2d55" : "#ff375f" },
  ] : [];

  const calProgress = summary?.goal
    ? Math.min(100, Math.round((summary.total_calories / summary.goal.calories) * 100))
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t("nutrition.title")}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowGoalForm(true)} className="btn-secondary flex items-center gap-2">
            <Target className="w-4 h-4" /> {t("nutrition.setGoals")}
          </button>
          <button onClick={() => setShowAddEntry(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> <span>{t("nutrition.addEntry")}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calories card */}
        <div className="card lg:col-span-1">
          <h3 className="text-sm font-medium text-onair-muted mb-4">{t("nutrition.calories")}</h3>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-onair-amber">
              {summary?.total_calories ?? 0}
            </p>
            <p className="text-sm text-onair-muted">
              {summary?.goal ? `/ ${summary.goal.calories} ${t("nutrition.remaining")}: ${summary.calories_remaining}` : ""}
            </p>
            {summary?.goal && (
              <div className="mt-4 h-2 bg-onair-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-onair-amber to-onair-red rounded-full transition-all duration-500"
                  style={{ width: `${calProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Macros chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-medium text-onair-muted mb-4">Macronutriments</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="40%" height={150}>
              <PieChart>
                <Pie data={macroData} innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                  {macroData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {macroData.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                    <span className="text-sm">{m.name}</span>
                  </div>
                  <span className="font-mono text-sm">{m.value.toFixed(1)}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meal entries */}
      <div className="card">
        <h3 className="font-display font-semibold mb-4">{t("nutrition.log")}</h3>
        {!summary?.entries?.length ? (
          <p className="text-center text-onair-muted py-8">{t("common.noData")}</p>
        ) : (
          <div className="space-y-2">
            {summary.entries.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-onair-surface rounded-lg">
                <div>
                  <p className="text-sm font-medium">{entry.food_name}</p>
                  <p className="text-xs text-onair-muted">
                    {t(`nutrition.mealTypes.${entry.meal_type}` as any)}
                    {entry.quantity && ` - ${entry.quantity}${entry.unit || "g"}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-onair-amber">{entry.calories || 0} kcal</p>
                  <p className="text-xs text-onair-muted">
                    P: {entry.protein_g || 0}g / C: {entry.carbs_g || 0}g / F: {entry.fat_g || 0}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Water section */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-onair-cyan" />
          <h3 className="font-display font-semibold">{t("nutrition.water")}</h3>
          {waterSummary && (
            <span className="ml-auto text-sm text-onair-muted font-mono">
              {waterSummary.total_ml} / {waterSummary.goal_ml} ml
            </span>
          )}
        </div>

        {waterSummary && (
          <div className="h-2 bg-onair-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-onair-cyan to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((waterSummary.total_ml / waterSummary.goal_ml) * 100))}%` }}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[150, 250, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => handleAddWater(ml)}
              className="btn-secondary text-sm"
            >
              +{ml} ml
            </button>
          ))}
          <div className="flex gap-2 flex-1 min-w-[160px]">
            <input
              type="number"
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              placeholder="ml"
              className="flex-1 text-sm"
            />
            <button
              onClick={() => { handleAddWater(+customWater); setCustomWater(""); }}
              className="btn-primary text-sm px-3"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-onair-muted whitespace-nowrap">
            {t("hydration.reminderEvery")}
          </label>
          <input
            type="number"
            value={reminderMinutes}
            onChange={(e) => {
              const v = +e.target.value;
              setReminderMinutes(v);
              setReminderInterval(v);
            }}
            className="w-20 text-sm"
            min={1}
          />
          <span className="text-xs text-onair-muted">{t("common.min")}</span>
        </div>

        {waterSummary && waterSummary.entries.length > 0 && (
          <div className="space-y-1">
            {waterSummary.entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm px-2 py-1.5 bg-onair-surface rounded-lg">
                <span className="text-onair-muted text-xs">
                  {new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-mono text-onair-cyan">+{e.amount_ml} ml</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleAddEntry} className="card w-full max-w-md">
            <h2 className="text-lg font-display font-bold mb-4">{t("nutrition.addEntry")}</h2>
            <div className="space-y-3">
              <select value={entryForm.meal_type} onChange={(e) => setEntryForm({ ...entryForm, meal_type: e.target.value })} className="w-full">
                {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                  <option key={m} value={m}>{t(`nutrition.mealTypes.${m}` as any)}</option>
                ))}
              </select>
              <input value={entryForm.food_name} onChange={(e) => setEntryForm({ ...entryForm, food_name: e.target.value })} placeholder="Aliment" required className="w-full" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={entryForm.calories} onChange={(e) => setEntryForm({ ...entryForm, calories: e.target.value })} placeholder={t("nutrition.calories")} className="w-full" />
                <input type="number" value={entryForm.protein_g} onChange={(e) => setEntryForm({ ...entryForm, protein_g: e.target.value })} placeholder={`${t("nutrition.protein")} (g)`} className="w-full" />
                <input type="number" value={entryForm.carbs_g} onChange={(e) => setEntryForm({ ...entryForm, carbs_g: e.target.value })} placeholder={`${t("nutrition.carbs")} (g)`} className="w-full" />
                <input type="number" value={entryForm.fat_g} onChange={(e) => setEntryForm({ ...entryForm, fat_g: e.target.value })} placeholder={`${t("nutrition.fat")} (g)`} className="w-full" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAddEntry(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
              <button type="submit" className="btn-primary flex-1"><span>{t("common.save")}</span></button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSetGoal} className="card w-full max-w-md">
            <h2 className="text-lg font-display font-bold mb-4">{t("nutrition.setGoals")}</h2>
            <div className="space-y-3">
              <div><label className="text-sm text-onair-muted">{t("nutrition.calories")}</label><input type="number" value={goalForm.calories} onChange={(e) => setGoalForm({ ...goalForm, calories: e.target.value })} required className="w-full" /></div>
              <div><label className="text-sm text-onair-muted">{t("nutrition.protein")} (g)</label><input type="number" value={goalForm.protein_g} onChange={(e) => setGoalForm({ ...goalForm, protein_g: e.target.value })} required className="w-full" /></div>
              <div><label className="text-sm text-onair-muted">{t("nutrition.carbs")} (g)</label><input type="number" value={goalForm.carbs_g} onChange={(e) => setGoalForm({ ...goalForm, carbs_g: e.target.value })} required className="w-full" /></div>
              <div><label className="text-sm text-onair-muted">{t("nutrition.fat")} (g)</label><input type="number" value={goalForm.fat_g} onChange={(e) => setGoalForm({ ...goalForm, fat_g: e.target.value })} required className="w-full" /></div>
              <div><label className="text-sm text-onair-muted">{t("nutrition.water")} ({t("common.ml")})</label><input type="number" value={goalForm.water_goal_ml} onChange={(e) => setGoalForm({ ...goalForm, water_goal_ml: e.target.value })} required className="w-full" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowGoalForm(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
              <button type="submit" className="btn-primary flex-1"><span>{t("common.save")}</span></button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
