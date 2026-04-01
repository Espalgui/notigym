import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { Apple, Plus, Droplets, Target, ChefHat, Star, Search, Loader2, ScanLine, Bookmark, Trash2, PlayCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import BarcodeScanner from "@/components/nutrition/BarcodeScanner";
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

interface Recipe {
  id: string;
  created_by?: string | null;
  creator_name?: string | null;
  name_fr: string;
  name_en: string;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  description_fr: string;
  description_en: string;
  goals: string[] | string;
  tags?: string[] | string;
  prep_time_min?: number | null;
  cook_time_min?: number | null;
  servings?: number;
  ingredients_fr?: string | null;
  ingredients_en?: string | null;
  steps_fr?: string | null;
  steps_en?: string | null;
  is_official?: boolean;
}

function parseJsonField(val: string | string[] | null | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

export default function Nutrition() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useAuthStore();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [activeTab] = useState<"journal">("journal");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeFilter, setRecipeFilter] = useState<string>("");
  const [recipeTagFilter, setRecipeTagFilter] = useState<string>("");
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [waterSummary, setWaterSummary] = useState<WaterSummary | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [entryForm, setEntryForm] = useState({
    meal_type: "lunch", food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", quantity: "", unit: "g",
  });
  const [goalForm, setGoalForm] = useState({ calories: "2000", protein_g: "150", carbs_g: "250", fat_g: "70", water_goal_ml: "2000" });
  const [customWater, setCustomWater] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<{ name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; image_url?: string }[]>([]);
  const [searchingFood, setSearchingFood] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const searchTimeout = useState<ReturnType<typeof setTimeout> | null>(null);
  const [per100, setPer100] = useState<{ calories: number; protein_g: number; carbs_g: number; fat_g: number } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShareRecipe, setShowShareRecipe] = useState(false);
  const [shareForm, setShareForm] = useState({
    name_fr: "", name_en: "", description_fr: "", description_en: "",
    meal_type: "lunch", calories: "", protein_g: "", carbs_g: "", fat_g: "",
    prep_time_min: "", cook_time_min: "", servings: "1",
    ingredients_fr: "", ingredients_en: "", steps_fr: "", steps_en: "",
    tags: "",
  });
  const [reminderMinutes, setReminderMinutes] = useState(
    () => parseInt(localStorage.getItem("hydration_reminder_interval") || "45", 10)
  );
  const { setReminderInterval } = useHydrationReminder();
  const [mealTemplates, setMealTemplates] = useState<any[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateMealType, setTemplateMealType] = useState("lunch");

  const fetchTemplates = () => {
    api.get("/nutrition/templates").then((r) => setMealTemplates(r.data)).catch(() => {});
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim() || !summary?.entries?.length) return;
    const entries = summary.entries.filter((e: any) => e.meal_type === templateMealType);
    if (entries.length === 0) { toast.error(lang.startsWith("fr") ? "Aucune entrée pour ce repas" : "No entries for this meal"); return; }
    try {
      await api.post("/nutrition/templates", {
        name: templateName,
        meal_type: templateMealType,
        items: entries.map((e: any) => ({
          food_name: e.food_name,
          calories: e.calories || 0,
          protein_g: e.protein_g || 0,
          carbs_g: e.carbs_g || 0,
          fat_g: e.fat_g || 0,
          quantity: e.quantity,
          unit: e.unit,
        })),
      });
      toast.success(lang.startsWith("fr") ? "Template sauvegardé !" : "Template saved!");
      setShowSaveTemplate(false);
      setTemplateName("");
      fetchTemplates();
    } catch { toast.error(t("common.error")); }
  };

  const applyTemplate = async (templateId: string) => {
    try {
      await api.post(`/nutrition/templates/${templateId}/apply?date=${date}`);
      toast.success(lang.startsWith("fr") ? "Template appliqué !" : "Template applied!");
      fetchSummary();
    } catch { toast.error(t("common.error")); }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await api.delete(`/nutrition/templates/${templateId}`);
      setMealTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch { toast.error(t("common.error")); }
  };

  const fetchSummary = () => {
    api.get(`/nutrition/summary?date=${date}`).then((r) => setSummary(r.data)).catch(() => {});
  };

  const fetchWater = () => {
    api.get(`/nutrition/water?date=${date}`).then((r) => setWaterSummary(r.data)).catch(() => {});
  };

  useEffect(() => { fetchSummary(); fetchWater(); }, [date]);
  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    api.get("/recipes").then((r) => setRecipes(r.data)).catch(() => {});
  }, []);

  const handleFoodSearch = (query: string) => {
    setFoodSearch(query);
    if (searchTimeout[0]) clearTimeout(searchTimeout[0]);
    if (query.length < 2) { setFoodResults([]); return; }
    setSearchingFood(true);
    const t = setTimeout(() => {
      api.get(`/nutrition/search-food?q=${encodeURIComponent(query)}`)
        .then((r) => setFoodResults(r.data))
        .catch(() => setFoodResults([]))
        .finally(() => setSearchingFood(false));
    }, 400);
    searchTimeout[0] = t;
  };

  const selectFood = (food: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => {
    setPer100({ calories: food.calories, protein_g: food.protein_g, carbs_g: food.carbs_g, fat_g: food.fat_g });
    setEntryForm({
      ...entryForm,
      food_name: food.name,
      quantity: "100",
      unit: "g",
      calories: String(food.calories || ""),
      protein_g: String(food.protein_g || ""),
      carbs_g: String(food.carbs_g || ""),
      fat_g: String(food.fat_g || ""),
    });
    setFoodSearch("");
    setFoodResults([]);
  };

  const closeScanner = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    closeScanner();
    try {
      const { data } = await api.get(`/nutrition/product/${barcode}`);
      selectFood(data);
      toast.success(lang?.startsWith("fr") ? "Produit trouvé !" : "Product found!");
    } catch {
      toast.error(lang?.startsWith("fr") ? "Produit non trouvé" : "Product not found");
    }
  };

  const handleQuantityChange = (qty: string) => {
    const q = parseFloat(qty) || 0;
    if (per100 && q > 0) {
      const ratio = q / 100;
      setEntryForm((f) => ({
        ...f,
        quantity: qty,
        calories: String(Math.round(per100.calories * ratio)),
        protein_g: String(Math.round(per100.protein_g * ratio * 10) / 10),
        carbs_g: String(Math.round(per100.carbs_g * ratio * 10) / 10),
        fat_g: String(Math.round(per100.fat_g * ratio * 10) / 10),
      }));
    } else {
      setEntryForm((f) => ({ ...f, quantity: qty }));
    }
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    try {
      await api.post("/nutrition/entries", {
        date,
        meal_type: recipe.meal_type,
        food_name: lang === "fr" ? recipe.name_fr : recipe.name_en,
        calories: recipe.calories,
        protein_g: recipe.protein_g,
        carbs_g: recipe.carbs_g,
        fat_g: recipe.fat_g,
      });
      toast.success(t("common.success"));
      fetchSummary();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const userGoal = (user as any)?.goal || "";
  const recommendedRecipes = recipes.filter((r) => userGoal && parseJsonField(r.goals).includes(userGoal));
  const filteredRecipes = recipes.filter((r) => {
    if (recipeFilter && r.meal_type !== recipeFilter) return false;
    if (recipeTagFilter && !parseJsonField(r.tags).includes(recipeTagFilter)) return false;
    return true;
  });

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

  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

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
            <Target className="w-4 h-4" />
          </button>
          <button onClick={() => setShowApplyTemplate(true)} className="btn-secondary flex items-center gap-2">
            <Bookmark className="w-4 h-4" /> <span>{lang.startsWith("fr") ? "Repas type" : "Meal template"}</span>
          </button>
          <button onClick={() => { setShowAddEntry(true); setPer100(null); setFoodSearch(""); setFoodResults([]); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> <span>{lang.startsWith("fr") ? "Aliment" : "Food"}</span>
          </button>
        </div>
      </div>

      {activeTab === "journal" && (<>
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

      {/* Meal Templates */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-onair-purple" />
            <h3 className="font-display font-semibold">
              {lang.startsWith("fr") ? "Mes repas types" : "Meal Templates"}
            </h3>
          </div>
          {summary?.entries && summary.entries.length > 0 && (
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="text-xs text-onair-cyan hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {lang.startsWith("fr") ? "Sauvegarder" : "Save"}
            </button>
          )}
        </div>

        {mealTemplates.length === 0 ? (
          <p className="text-xs text-onair-muted text-center py-4">
            {lang.startsWith("fr") ? "Aucun repas type sauvegardé" : "No saved meal templates"}
          </p>
        ) : (
          <div className="space-y-2">
            {mealTemplates.map((tpl: any) => (
              <div key={tpl.id} className="flex items-center justify-between p-3 bg-onair-surface rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tpl.name}</p>
                  <p className="text-xs text-onair-muted">
                    {t(`nutrition.mealTypes.${tpl.meal_type}` as any)} · {tpl.items?.length || 0} {lang.startsWith("fr") ? "aliments" : "items"}
                    {tpl.items && ` · ${tpl.items.reduce((a: number, i: any) => a + (i.calories || 0), 0)} kcal`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => applyTemplate(tpl.id)}
                    className="p-2 rounded-lg text-onair-cyan hover:bg-onair-cyan/10 transition-colors"
                    title={lang.startsWith("fr") ? "Utiliser" : "Apply"}
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="p-2 rounded-lg text-onair-muted hover:text-onair-red hover:bg-onair-red/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm space-y-4">
            <h3 className="font-display font-bold text-lg">
              {lang.startsWith("fr") ? "Sauvegarder comme repas type" : "Save as meal template"}
            </h3>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={lang.startsWith("fr") ? "Nom du template" : "Template name"}
              className="w-full"
            />
            <select
              value={templateMealType}
              onChange={(e) => setTemplateMealType(e.target.value)}
              className="w-full"
            >
              {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                <option key={m} value={m}>{t(`nutrition.mealTypes.${m}` as any)}</option>
              ))}
            </select>
            <p className="text-xs text-onair-muted">
              {lang.startsWith("fr")
                ? `${(summary?.entries || []).filter((e: any) => e.meal_type === templateMealType).length} entrée(s) seront sauvegardées`
                : `${(summary?.entries || []).filter((e: any) => e.meal_type === templateMealType).length} entry(ies) will be saved`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSaveTemplate(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
              <button onClick={saveAsTemplate} className="btn-primary flex-1">
                <span>{lang.startsWith("fr") ? "Sauvegarder" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Modal */}
      {showApplyTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm space-y-4 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {lang.startsWith("fr") ? "Ajouter un repas type" : "Apply a meal template"}
              </h3>
              <button onClick={() => setShowApplyTemplate(false)} className="p-1.5 rounded-lg text-onair-muted hover:text-onair-text hover:bg-onair-surface">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            {mealTemplates.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-10 h-10 mx-auto text-onair-muted/30 mb-3" />
                <p className="text-sm text-onair-muted">
                  {lang.startsWith("fr") ? "Aucun repas type sauvegardé" : "No saved templates"}
                </p>
                <p className="text-xs text-onair-muted/60 mt-1">
                  {lang.startsWith("fr") ? "Ajoutez des aliments puis sauvegardez-les comme repas type" : "Add foods then save them as a meal template"}
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2">
                {mealTemplates.map((tpl: any) => (
                  <button
                    key={tpl.id}
                    onClick={async () => {
                      await applyTemplate(tpl.id);
                      setShowApplyTemplate(false);
                    }}
                    className="w-full text-left p-3 bg-onair-surface rounded-lg hover:bg-onair-surface/80 transition-colors"
                  >
                    <p className="text-sm font-medium">{tpl.name}</p>
                    <p className="text-xs text-onair-muted">
                      {t(`nutrition.mealTypes.${tpl.meal_type}` as any)} · {tpl.items?.length || 0} {lang.startsWith("fr") ? "aliments" : "items"} · {tpl.items?.reduce((a: number, i: any) => a + (i.calories || 0), 0)} kcal
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      </>)}

      {false && (
        <div className="space-y-6 hidden">
          {/* Recipes moved to /recipes page */}
          {recommendedRecipes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-onair-amber" />
                <h2 className="font-display font-semibold">{t("nutrition.recipes.recommended")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendedRecipes.slice(0, 4).map((r) => (
                  <div key={r.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{lang === "fr" ? r.name_fr : r.name_en}</h3>
                      <span className="text-xs text-onair-muted px-2 py-0.5 bg-onair-surface rounded-full">
                        {t(`nutrition.mealTypes.${r.meal_type}` as any)}
                      </span>
                    </div>
                    <p className="text-xs text-onair-muted">{lang === "fr" ? r.description_fr : r.description_en}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-onair-amber">{r.calories} kcal</span>
                      <span className="text-xs text-onair-muted">
                        P: {r.protein_g}g / C: {r.carbs_g}g / F: {r.fat_g}g
                      </span>
                    </div>
                    <button onClick={() => handleAddRecipe(r)} className="btn-primary text-xs w-full py-1.5">
                      <Plus className="w-3 h-3 inline mr-1" />{t("nutrition.recipes.addToLog")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ChefHat className="w-5 h-5 text-onair-cyan" />
              <h2 className="font-display font-semibold mr-2">{lang?.startsWith("fr") ? "Recettes" : "Recipes"}</h2>
              {["", "breakfast", "lunch", "dinner", "snack"].map((f) => (
                <button
                  key={f}
                  onClick={() => setRecipeFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    recipeFilter === f
                      ? "bg-onair-cyan text-white"
                      : "bg-onair-surface text-onair-muted hover:text-onair-text"
                  }`}
                >
                  {f ? t(`nutrition.mealTypes.${f}` as any) : t("common.all")}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "", label: lang?.startsWith("fr") ? "Tous" : "All" },
                { key: "high-protein", label: "High Protein" },
                { key: "keto", label: "Keto" },
                { key: "low-carb", label: "Low Carb" },
                { key: "high-carb", label: "High Carb" },
                { key: "vegan", label: "Vegan" },
                { key: "vegetarian", label: lang?.startsWith("fr") ? "Végé" : "Veggie" },
                { key: "quick", label: lang?.startsWith("fr") ? "Rapide" : "Quick" },
                { key: "meal-prep", label: "Meal Prep" },
                { key: "budget", label: "Budget" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setRecipeTagFilter(f.key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    recipeTagFilter === f.key
                      ? "bg-onair-amber text-white"
                      : "bg-onair-surface text-onair-muted hover:text-onair-text"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRecipes.map((r) => {
              const rTags = parseJsonField(r.tags);
              return (
              <div key={r.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{lang?.startsWith("fr") ? r.name_fr : r.name_en}</h3>
                  <span className="text-xs text-onair-muted px-2 py-0.5 bg-onair-surface rounded-full">
                    {t(`nutrition.mealTypes.${r.meal_type}` as any)}
                  </span>
                </div>
                <p className="text-xs text-onair-muted line-clamp-2">{lang?.startsWith("fr") ? r.description_fr : r.description_en}</p>
                {rTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rTags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-onair-surface text-onair-muted">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-onair-amber">{r.calories} kcal</span>
                  <span className="text-xs text-onair-muted">
                    P: {r.protein_g}g / C: {r.carbs_g}g / F: {r.fat_g}g
                  </span>
                </div>
                {(r.prep_time_min || r.cook_time_min) && (
                  <div className="flex items-center gap-3 text-[10px] text-onair-muted">
                    {r.prep_time_min && <span>Prep: {r.prep_time_min}min</span>}
                    {r.cook_time_min && <span>Cook: {r.cook_time_min}min</span>}
                    {r.servings && r.servings > 1 && <span>{r.servings} {lang?.startsWith("fr") ? "portions" : "servings"}</span>}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setSelectedRecipe(r)} className="btn-secondary text-xs flex-1 py-1.5">
                    {lang?.startsWith("fr") ? "Voir" : "View"}
                  </button>
                  <button onClick={() => handleAddRecipe(r)} className="btn-primary text-xs flex-1 py-1.5">
                    <Plus className="w-3 h-3 inline mr-1" />{t("nutrition.recipes.addToLog")}
                  </button>
                </div>
                {r.creator_name && (
                  <p className="text-[10px] text-onair-muted/50 text-right">par {r.creator_name}</p>
                )}
              </div>
              );
            })}
          </div>

          {/* Share recipe button */}
          <button
            onClick={() => setShowShareRecipe(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lang?.startsWith("fr") ? "Partager une recette" : "Share a recipe"}
          </button>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleAddEntry} className="card w-full max-w-md">
            <h2 className="text-lg font-display font-bold mb-4">{t("nutrition.addEntry")}</h2>
            <div className="space-y-3">
              {/* OpenFoodFacts search */}
              <div className="relative">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onair-muted" />
                    <input
                      value={foodSearch}
                      onChange={(e) => handleFoodSearch(e.target.value)}
                      placeholder={lang?.startsWith("fr") ? "Rechercher un aliment..." : "Search food..."}
                      className="w-full pl-9 pr-8"
                    />
                    {searchingFood && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onair-muted animate-spin" />}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                        setCameraStream(stream);
                      } catch {
                        toast.error(t("nutrition.cameraPermission"));
                      }
                    }}
                    className="px-3 rounded-xl bg-onair-cyan/10 text-onair-cyan hover:bg-onair-cyan/20 transition-colors flex items-center gap-1.5"
                    title={lang?.startsWith("fr") ? "Scanner un code-barres" : "Scan barcode"}
                  >
                    <ScanLine className="w-4 h-4" />
                  </button>
                </div>
                {foodResults.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-onair-surface border border-onair-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {foodResults.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectFood(f)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-onair-cyan/5 transition-colors border-b border-onair-border/30 last:border-0"
                      >
                        {f.image_url && <img src={f.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.name}</p>
                          <p className="text-[10px] text-onair-muted">
                            {f.calories} kcal · P {f.protein_g}g · C {f.carbs_g}g · F {f.fat_g}g
                            <span className="text-onair-muted/50"> /100g</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select value={entryForm.meal_type} onChange={(e) => setEntryForm({ ...entryForm, meal_type: e.target.value })} className="w-full">
                {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                  <option key={m} value={m}>{t(`nutrition.mealTypes.${m}` as any)}</option>
                ))}
              </select>
              <input value={entryForm.food_name} onChange={(e) => setEntryForm({ ...entryForm, food_name: e.target.value })} placeholder="Aliment" required className="w-full" />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={entryForm.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder={lang?.startsWith("fr") ? "Quantité" : "Quantity"}
                  min={0}
                  className="flex-1"
                />
                <span className="text-sm text-onair-muted">g</span>
                {per100 && (
                  <span className="text-[10px] text-onair-muted/50">
                    ({per100.calories} kcal/100g)
                  </span>
                )}
              </div>
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
      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecipe(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-display font-bold">{lang?.startsWith("fr") ? selectedRecipe.name_fr : selectedRecipe.name_en}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-onair-surface text-onair-muted">{t(`nutrition.mealTypes.${selectedRecipe.meal_type}` as any)}</span>
                  {selectedRecipe.creator_name && <span className="text-xs text-onair-muted">par {selectedRecipe.creator_name}</span>}
                </div>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="text-onair-muted hover:text-onair-text p-1">&times;</button>
            </div>

            <p className="text-sm text-onair-muted mb-4">{lang?.startsWith("fr") ? selectedRecipe.description_fr : selectedRecipe.description_en}</p>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-onair-amber/10">
                <p className="text-lg font-bold text-onair-amber">{selectedRecipe.calories}</p>
                <p className="text-[10px] text-onair-muted">kcal</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-onair-red/10">
                <p className="text-lg font-bold text-onair-red">{selectedRecipe.protein_g}g</p>
                <p className="text-[10px] text-onair-muted">{t("nutrition.protein")}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-onair-cyan/10">
                <p className="text-lg font-bold text-onair-cyan">{selectedRecipe.carbs_g}g</p>
                <p className="text-[10px] text-onair-muted">{t("nutrition.carbs")}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-500/10">
                <p className="text-lg font-bold text-purple-400">{selectedRecipe.fat_g}g</p>
                <p className="text-[10px] text-onair-muted">{t("nutrition.fat")}</p>
              </div>
            </div>

            {/* Time + servings */}
            {(selectedRecipe.prep_time_min || selectedRecipe.cook_time_min) && (
              <div className="flex items-center gap-4 text-xs text-onair-muted mb-4">
                {selectedRecipe.prep_time_min && <span>Prep: {selectedRecipe.prep_time_min} min</span>}
                {selectedRecipe.cook_time_min && <span>Cuisson: {selectedRecipe.cook_time_min} min</span>}
                {selectedRecipe.servings && selectedRecipe.servings > 1 && <span>{selectedRecipe.servings} portions</span>}
              </div>
            )}

            {/* Ingredients */}
            {(() => {
              const ingredients = parseJsonField(lang?.startsWith("fr") ? selectedRecipe.ingredients_fr : selectedRecipe.ingredients_en);
              return ingredients.length > 0 ? (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">{lang?.startsWith("fr") ? "Ingrédients" : "Ingredients"}</h3>
                  <ul className="space-y-1">
                    {ingredients.map((ing: string, i: number) => (
                      <li key={i} className="text-sm text-onair-muted flex items-start gap-2">
                        <span className="text-onair-cyan mt-0.5">-</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}

            {/* Steps */}
            {(() => {
              const steps = parseJsonField(lang?.startsWith("fr") ? selectedRecipe.steps_fr : selectedRecipe.steps_en);
              return steps.length > 0 ? (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">{lang?.startsWith("fr") ? "Préparation" : "Instructions"}</h3>
                  <ol className="space-y-2">
                    {steps.map((step: string, i: number) => (
                      <li key={i} className="text-sm text-onair-muted flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-onair-cyan/20 text-onair-cyan text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null;
            })()}

            {/* Tags */}
            {parseJsonField(selectedRecipe.tags).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {parseJsonField(selectedRecipe.tags).map((tag: string) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-onair-surface text-onair-muted">{tag}</span>
                ))}
              </div>
            )}

            <button onClick={() => { handleAddRecipe(selectedRecipe); setSelectedRecipe(null); }} className="btn-primary w-full">
              <Plus className="w-4 h-4 inline mr-1" />{t("nutrition.recipes.addToLog")}
            </button>
          </motion.div>
        </div>
      )}

      {/* Share Recipe Modal */}
      {showShareRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload: any = {
                  name_fr: shareForm.name_fr,
                  name_en: shareForm.name_en || shareForm.name_fr,
                  description_fr: shareForm.description_fr || null,
                  description_en: shareForm.description_en || shareForm.description_fr || null,
                  meal_type: shareForm.meal_type,
                  calories: +shareForm.calories || 0,
                  protein_g: +shareForm.protein_g || 0,
                  carbs_g: +shareForm.carbs_g || 0,
                  fat_g: +shareForm.fat_g || 0,
                  prep_time_min: +shareForm.prep_time_min || null,
                  cook_time_min: +shareForm.cook_time_min || null,
                  servings: +shareForm.servings || 1,
                };
                if (shareForm.ingredients_fr.trim()) payload.ingredients_fr = JSON.stringify(shareForm.ingredients_fr.split("\n").filter(Boolean));
                if (shareForm.ingredients_en.trim()) payload.ingredients_en = JSON.stringify(shareForm.ingredients_en.split("\n").filter(Boolean));
                if (shareForm.steps_fr.trim()) payload.steps_fr = JSON.stringify(shareForm.steps_fr.split("\n").filter(Boolean));
                if (shareForm.steps_en.trim()) payload.steps_en = JSON.stringify(shareForm.steps_en.split("\n").filter(Boolean));
                if (shareForm.tags.trim()) payload.tags = JSON.stringify(shareForm.tags.split(",").map((s: string) => s.trim()).filter(Boolean));
                await api.post("/recipes", payload);
                toast.success(lang?.startsWith("fr") ? "Recette partagée !" : "Recipe shared!");
                setShowShareRecipe(false);
                api.get("/recipes").then((r) => setRecipes(r.data)).catch(() => {});
              } catch { toast.error("Error"); }
            }}
            className="card w-full max-w-lg max-h-[85vh] overflow-y-auto"
          >
            <h2 className="text-lg font-display font-bold mb-4">{lang?.startsWith("fr") ? "Partager une recette" : "Share a recipe"}</h2>
            <div className="space-y-3">
              <input value={shareForm.name_fr} onChange={(e) => setShareForm({ ...shareForm, name_fr: e.target.value })} placeholder={lang?.startsWith("fr") ? "Nom (français) *" : "Name (French) *"} required className="w-full" />
              <input value={shareForm.name_en} onChange={(e) => setShareForm({ ...shareForm, name_en: e.target.value })} placeholder={lang?.startsWith("fr") ? "Nom (anglais)" : "Name (English)"} className="w-full" />
              <select value={shareForm.meal_type} onChange={(e) => setShareForm({ ...shareForm, meal_type: e.target.value })} className="w-full">
                {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                  <option key={m} value={m}>{t(`nutrition.mealTypes.${m}` as any)}</option>
                ))}
              </select>
              <textarea value={shareForm.description_fr} onChange={(e) => setShareForm({ ...shareForm, description_fr: e.target.value })} placeholder={lang?.startsWith("fr") ? "Description courte" : "Short description"} rows={2} className="w-full text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={shareForm.calories} onChange={(e) => setShareForm({ ...shareForm, calories: e.target.value })} placeholder="Calories" className="w-full" />
                <input type="number" value={shareForm.protein_g} onChange={(e) => setShareForm({ ...shareForm, protein_g: e.target.value })} placeholder="Protéines (g)" className="w-full" />
                <input type="number" value={shareForm.carbs_g} onChange={(e) => setShareForm({ ...shareForm, carbs_g: e.target.value })} placeholder="Glucides (g)" className="w-full" />
                <input type="number" value={shareForm.fat_g} onChange={(e) => setShareForm({ ...shareForm, fat_g: e.target.value })} placeholder="Lipides (g)" className="w-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={shareForm.prep_time_min} onChange={(e) => setShareForm({ ...shareForm, prep_time_min: e.target.value })} placeholder="Prep (min)" className="w-full" />
                <input type="number" value={shareForm.cook_time_min} onChange={(e) => setShareForm({ ...shareForm, cook_time_min: e.target.value })} placeholder="Cuisson (min)" className="w-full" />
                <input type="number" value={shareForm.servings} onChange={(e) => setShareForm({ ...shareForm, servings: e.target.value })} placeholder="Portions" className="w-full" />
              </div>
              <div>
                <label className="text-xs text-onair-muted mb-1 block">{lang?.startsWith("fr") ? "Ingrédients (un par ligne)" : "Ingredients (one per line)"}</label>
                <textarea value={shareForm.ingredients_fr} onChange={(e) => setShareForm({ ...shareForm, ingredients_fr: e.target.value })} rows={4} className="w-full text-sm" placeholder={"200g de poulet\n1 avocat\n100g de riz"} />
              </div>
              <div>
                <label className="text-xs text-onair-muted mb-1 block">{lang?.startsWith("fr") ? "Étapes (une par ligne)" : "Steps (one per line)"}</label>
                <textarea value={shareForm.steps_fr} onChange={(e) => setShareForm({ ...shareForm, steps_fr: e.target.value })} rows={4} className="w-full text-sm" placeholder={"Couper le poulet en dés.\nFaire revenir à feu vif.\nServir avec le riz."} />
              </div>
              <input value={shareForm.tags} onChange={(e) => setShareForm({ ...shareForm, tags: e.target.value })} placeholder="Tags (séparés par virgule): high-protein, quick, vegan..." className="w-full text-sm" />
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowShareRecipe(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
              <button type="submit" className="btn-primary flex-1"><span>{lang?.startsWith("fr") ? "Partager" : "Share"}</span></button>
            </div>
          </motion.form>
        </div>
      )}
      {/* Barcode Scanner */}
      <AnimatePresence>
        {cameraStream && (
          <BarcodeScanner
            stream={cameraStream}
            onScan={handleBarcodeScan}
            onClose={closeScanner}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
