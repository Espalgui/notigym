import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Plus, Search, Clock, Users, Flame, Trash2, ArrowLeft, X, Star, Share2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

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
  goals?: string | string[];
  tags?: string | string[];
  prep_time_min?: number | null;
  cook_time_min?: number | null;
  servings?: number;
  ingredients_fr?: string | null;
  ingredients_en?: string | null;
  steps_fr?: string | null;
  steps_en?: string | null;
  is_official?: boolean;
  is_favorite?: boolean;
}

function parseJson(val: string | string[] | null | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

export default function Recipes() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const { user } = useAuthStore();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<"all" | "favorites">("all");
  const [mealFilter, setMealFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareForm, setShareForm] = useState({
    name_fr: "", name_en: "", description_fr: "", description_en: "",
    meal_type: "lunch", calories: "", protein_g: "", carbs_g: "", fat_g: "",
    prep_time_min: "", cook_time_min: "", servings: "1",
    ingredients_fr: "", ingredients_en: "", steps_fr: "", steps_en: "",
    tags: "",
  });

  useEffect(() => {
    api.get("/recipes").then((r) => setRecipes(r.data)).catch(() => {});
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/recipes/${recipeId}/favorite`);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, is_favorite: data.is_favorite } : r))
      );
    } catch { toast.error("Error"); }
  };

  const baseRecipes = tab === "favorites" ? recipes.filter((r) => r.is_favorite) : recipes;
  const filtered = baseRecipes.filter((r) => {
    if (mealFilter && r.meal_type !== mealFilter) return false;
    if (tagFilter && !parseJson(r.tags).includes(tagFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (lang === "fr" ? r.name_fr : r.name_en).toLowerCase();
      if (!name.includes(q)) return false;
    }
    return true;
  });

  const handleAddToJournal = async (r: Recipe) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await api.post("/nutrition/entries", {
        date: today,
        meal_type: r.meal_type,
        food_name: lang === "fr" ? r.name_fr : r.name_en,
        calories: r.calories, protein_g: r.protein_g, carbs_g: r.carbs_g, fat_g: r.fat_g,
      });
      toast.success(lang === "fr" ? "Ajouté au journal !" : "Added to journal!");
    } catch { toast.error("Error"); }
  };

  const handleShare = async (e: React.FormEvent) => {
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
      toast.success(lang === "fr" ? "Recette partagée !" : "Recipe shared!");
      setShowShareForm(false);
      setShareForm({ name_fr: "", name_en: "", description_fr: "", description_en: "", meal_type: "lunch", calories: "", protein_g: "", carbs_g: "", fat_g: "", prep_time_min: "", cook_time_min: "", servings: "1", ingredients_fr: "", ingredients_en: "", steps_fr: "", steps_en: "", tags: "" });
      api.get("/recipes").then((r) => setRecipes(r.data)).catch(() => {});
    } catch { toast.error("Error"); }
  };

  const handleShareToFeed = async (r: Recipe) => {
    const name = lang === "fr" ? r.name_fr : r.name_en;
    try {
      await api.post("/community/posts", {
        post_type: "recipe",
        content: lang === "fr"
          ? `Je partage ma recette : ${name} — ${r.calories} kcal, ${r.protein_g}g protéines`
          : `Sharing my recipe: ${name} — ${r.calories} kcal, ${r.protein_g}g protein`,
        reference_id: r.id,
      });
      toast.success(lang === "fr" ? "Partagée sur le fil !" : "Shared to feed!");
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setSelectedRecipe(null);
      toast.success(lang === "fr" ? "Recette supprimée" : "Recipe deleted");
    } catch { toast.error("Error"); }
  };

  // ── Recipe Detail View ──
  if (selectedRecipe) {
    const r = selectedRecipe;
    const ingredients = parseJson(lang === "fr" ? r.ingredients_fr : r.ingredients_en);
    const steps = parseJson(lang === "fr" ? r.steps_fr : r.steps_en);
    const tags = parseJson(r.tags);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-sm text-onair-muted hover:text-onair-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {lang === "fr" ? "Retour aux recettes" : "Back to recipes"}
        </button>

        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-display font-bold">{lang === "fr" ? r.name_fr : r.name_en}</h1>
          <button
            onClick={(e) => {
              toggleFavorite(e, r.id);
              setSelectedRecipe({ ...r, is_favorite: !r.is_favorite });
            }}
            className={`p-2 rounded-lg transition-colors ${
              r.is_favorite ? "bg-onair-amber/20 text-onair-amber" : "text-onair-muted hover:text-onair-amber hover:bg-onair-amber/10"
            }`}
          >
            <Star className={`w-5 h-5 ${r.is_favorite ? "fill-current" : ""}`} />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-onair-cyan/10 text-onair-cyan font-medium">
              {t(`nutrition.mealTypes.${r.meal_type}` as any)}
            </span>
            {r.creator_name && (
              <span className="text-xs text-onair-muted">
                {lang === "fr" ? "par" : "by"} {r.creator_name}
              </span>
            )}
            {r.is_official && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-onair-amber/10 text-onair-amber font-medium">Officielle</span>
            )}
          </div>
        </div>

        {r.description_fr && (
          <p className="text-sm text-onair-muted">{lang === "fr" ? r.description_fr : r.description_en}</p>
        )}

        {/* Macros */}
        <div className="grid grid-cols-4 gap-2">
          <div className="card text-center !py-3">
            <p className="text-xl font-bold text-onair-amber">{r.calories}</p>
            <p className="text-[10px] text-onair-muted">kcal</p>
          </div>
          <div className="card text-center !py-3">
            <p className="text-xl font-bold text-onair-red">{r.protein_g}g</p>
            <p className="text-[10px] text-onair-muted">{t("nutrition.protein")}</p>
          </div>
          <div className="card text-center !py-3">
            <p className="text-xl font-bold text-onair-cyan">{r.carbs_g}g</p>
            <p className="text-[10px] text-onair-muted">{t("nutrition.carbs")}</p>
          </div>
          <div className="card text-center !py-3">
            <p className="text-xl font-bold text-purple-400">{r.fat_g}g</p>
            <p className="text-[10px] text-onair-muted">{t("nutrition.fat")}</p>
          </div>
        </div>

        {/* Time & servings */}
        {(r.prep_time_min || r.cook_time_min || (r.servings && r.servings > 1)) && (
          <div className="flex items-center gap-4 text-sm text-onair-muted">
            {r.prep_time_min != null && r.prep_time_min > 0 && (
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Prep: {r.prep_time_min} min</span>
            )}
            {r.cook_time_min != null && r.cook_time_min > 0 && (
              <span className="flex items-center gap-1.5"><Flame className="w-4 h-4" /> {lang === "fr" ? "Cuisson" : "Cook"}: {r.cook_time_min} min</span>
            )}
            {r.servings != null && r.servings > 1 && (
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {r.servings} {lang === "fr" ? "portions" : "servings"}</span>
            )}
          </div>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="card">
            <h2 className="font-display font-semibold mb-3">{lang === "fr" ? "Ingrédients" : "Ingredients"}</h2>
            <ul className="space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-onair-cyan flex-shrink-0 mt-1.5" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div className="card">
            <h2 className="font-display font-semibold mb-3">{lang === "fr" ? "Préparation" : "Instructions"}</h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-onair-cyan/15 text-onair-cyan text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-onair-surface text-onair-muted">{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => handleAddToJournal(r)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "fr" ? "Ajouter au journal" : "Add to journal"}
          </button>
          <button onClick={() => handleShareToFeed(r)} className="btn-secondary flex items-center gap-2">
            <Share2 className="w-4 h-4" />
          </button>
          {r.created_by === (user as any)?.id && !r.is_official && (
            <button onClick={() => handleDelete(r.id)} className="btn-secondary text-onair-red flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Recipe List View ──
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{lang === "fr" ? "Recettes" : "Recipes"}</h1>
        <button onClick={() => setShowShareForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{lang === "fr" ? "Partager" : "Share"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-onair-surface rounded-xl w-fit">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "all" ? "bg-onair-card text-onair-text shadow-sm" : "text-onair-muted hover:text-onair-text"
          }`}
        >
          <ChefHat className="w-4 h-4" />
          {lang === "fr" ? "Toutes" : "All"}
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "favorites" ? "bg-onair-card text-onair-text shadow-sm" : "text-onair-muted hover:text-onair-text"
          }`}
        >
          <Star className="w-4 h-4" />
          {lang === "fr" ? "Favoris" : "Favorites"}
          {recipes.filter((r) => r.is_favorite).length > 0 && (
            <span className="text-[10px] bg-onair-amber/20 text-onair-amber px-1.5 py-0.5 rounded-full">
              {recipes.filter((r) => r.is_favorite).length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-onair-muted" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "fr" ? "Rechercher une recette..." : "Search recipes..."}
          className="w-full pl-9"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "", label: lang === "fr" ? "Tous" : "All" },
            { key: "breakfast", label: lang === "fr" ? "Petit-déj" : "Breakfast" },
            { key: "lunch", label: lang === "fr" ? "Déjeuner" : "Lunch" },
            { key: "dinner", label: lang === "fr" ? "Dîner" : "Dinner" },
            { key: "snack", label: lang === "fr" ? "Collation" : "Snack" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setMealFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                mealFilter === f.key ? "bg-onair-cyan text-white" : "bg-onair-surface text-onair-muted hover:text-onair-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "", label: lang === "fr" ? "Tous" : "All" },
            { key: "high-protein", label: "High Protein" },
            { key: "keto", label: "Keto" },
            { key: "low-carb", label: "Low Carb" },
            { key: "high-carb", label: "High Carb" },
            { key: "vegan", label: "Vegan" },
            { key: "vegetarian", label: lang === "fr" ? "Végé" : "Veggie" },
            { key: "quick", label: lang === "fr" ? "Rapide" : "Quick" },
            { key: "meal-prep", label: "Meal Prep" },
            { key: "budget", label: "Budget" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setTagFilter(f.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                tagFilter === f.key ? "bg-onair-amber text-white" : "bg-onair-surface text-onair-muted hover:text-onair-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-onair-muted">{filtered.length} {lang === "fr" ? "recettes" : "recipes"}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r, i) => {
          const rTags = parseJson(r.tags);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="card p-4 space-y-2 cursor-pointer hover:border-onair-cyan/30 transition-colors"
              onClick={() => setSelectedRecipe(r)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm line-clamp-1 flex-1">{lang === "fr" ? r.name_fr : r.name_en}</h3>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => toggleFavorite(e, r.id)}
                    className={`p-1 rounded transition-colors ${
                      r.is_favorite ? "text-onair-amber" : "text-onair-muted/30 hover:text-onair-amber"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${r.is_favorite ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-[10px] text-onair-muted px-2 py-0.5 bg-onair-surface rounded-full">
                    {t(`nutrition.mealTypes.${r.meal_type}` as any)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-onair-muted line-clamp-2">{lang === "fr" ? r.description_fr : r.description_en}</p>
              {rTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rTags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-onair-surface text-onair-muted">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-onair-amber">{r.calories} kcal</span>
                <span className="text-onair-muted">P:{r.protein_g} C:{r.carbs_g} F:{r.fat_g}</span>
              </div>
              {(r.prep_time_min || r.cook_time_min) && (
                <div className="flex items-center gap-2 text-[10px] text-onair-muted">
                  {r.prep_time_min != null && r.prep_time_min > 0 && <span>{r.prep_time_min}min prep</span>}
                  {r.cook_time_min != null && r.cook_time_min > 0 && <span>{r.cook_time_min}min cook</span>}
                </div>
              )}
              {r.creator_name && <p className="text-[10px] text-onair-muted/50">par {r.creator_name}</p>}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <ChefHat className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
          <p className="text-onair-muted">{lang === "fr" ? "Aucune recette trouvée" : "No recipes found"}</p>
        </div>
      )}

      {/* Share Recipe Modal */}
      <AnimatePresence>
        {showShareForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleShare}
              className="card w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold">{lang === "fr" ? "Partager une recette" : "Share a recipe"}</h2>
                <button type="button" onClick={() => setShowShareForm(false)} className="text-onair-muted hover:text-onair-text"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <input value={shareForm.name_fr} onChange={(e) => setShareForm({ ...shareForm, name_fr: e.target.value })} placeholder={lang === "fr" ? "Nom de la recette *" : "Recipe name *"} required className="w-full" />
                <input value={shareForm.name_en} onChange={(e) => setShareForm({ ...shareForm, name_en: e.target.value })} placeholder={lang === "fr" ? "Nom (anglais)" : "Name (English)"} className="w-full" />
                <select value={shareForm.meal_type} onChange={(e) => setShareForm({ ...shareForm, meal_type: e.target.value })} className="w-full">
                  {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                    <option key={m} value={m}>{t(`nutrition.mealTypes.${m}` as any)}</option>
                  ))}
                </select>
                <textarea value={shareForm.description_fr} onChange={(e) => setShareForm({ ...shareForm, description_fr: e.target.value })} placeholder={lang === "fr" ? "Description courte" : "Short description"} rows={2} className="w-full text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={shareForm.calories} onChange={(e) => setShareForm({ ...shareForm, calories: e.target.value })} placeholder="Calories *" className="w-full" />
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
                  <label className="text-xs text-onair-muted mb-1 block">{lang === "fr" ? "Ingrédients (un par ligne) *" : "Ingredients (one per line) *"}</label>
                  <textarea value={shareForm.ingredients_fr} onChange={(e) => setShareForm({ ...shareForm, ingredients_fr: e.target.value })} rows={5} className="w-full text-sm" placeholder={"200g de poulet\n1 avocat\n100g de riz\n1 c. à soupe d'huile d'olive"} />
                </div>
                <div>
                  <label className="text-xs text-onair-muted mb-1 block">{lang === "fr" ? "Étapes de préparation (une par ligne) *" : "Preparation steps (one per line) *"}</label>
                  <textarea value={shareForm.steps_fr} onChange={(e) => setShareForm({ ...shareForm, steps_fr: e.target.value })} rows={5} className="w-full text-sm" placeholder={"Couper le poulet en dés.\nFaire chauffer l'huile dans une poêle.\nCuire le poulet 5 min à feu vif.\nServir avec le riz et l'avocat."} />
                </div>
                <input value={shareForm.tags} onChange={(e) => setShareForm({ ...shareForm, tags: e.target.value })} placeholder="Tags : high-protein, quick, vegan..." className="w-full text-sm" />
              </div>
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowShareForm(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
                <button type="submit" className="btn-primary flex-1"><span>{lang === "fr" ? "Partager" : "Share"}</span></button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
