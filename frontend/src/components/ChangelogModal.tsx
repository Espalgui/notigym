import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title_fr: string;
  title_en: string;
  changes_fr: string[];
  changes_en: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.2.0",
    date: "2026-03-31",
    title_fr: "Mise à jour majeure",
    title_en: "Major Update",
    changes_fr: [
      "Succès & Streaks : 18 badges à débloquer, compteur de jours consécutifs",
      "Mur des Records : visualisez tous vos PRs avec graphe de progression 1RM",
      "Timer auto : le repos démarre automatiquement après validation d'une série",
      "Supersets : liez vos exercices pour enchaîner sans repos",
      "Surcharge progressive : suggestion de poids +2.5% basée sur la dernière séance",
      "Partage de séance : résumé complet et publication sur le fil communautaire",
      "Scanner code-barres : scannez un produit pour remplir les macros automatiquement",
      "Widget hydratation : suivi d'eau avec anneau de progression sur le dashboard",
      "Timelapse corporel : slideshow animé de vos photos de progression",
      "Mode auto : le thème suit automatiquement votre système (clair/sombre)",
    ],
    changes_en: [
      "Achievements & Streaks: 18 badges to unlock, consecutive days counter",
      "PR Wall: view all your personal records with 1RM progression chart",
      "Auto rest timer: rest countdown starts automatically after validating a set",
      "Supersets: link exercises to chain them without rest",
      "Progressive overload: +2.5% weight suggestion based on last session",
      "Session sharing: full summary and share to community feed",
      "Barcode scanner: scan a product to auto-fill nutrition macros",
      "Hydration widget: water tracking with progress ring on dashboard",
      "Body timelapse: animated slideshow of your progress photos",
      "Auto mode: theme automatically follows your system (light/dark)",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-03-31",
    title_fr: "Nouveautés",
    title_en: "What's New",
    changes_fr: [
      "Planning hebdomadaire : visualisez et planifiez vos séances de la semaine",
      "Dashboard interactif : cliquez sur les stats pour accéder directement à l'historique",
      "RPE (ressenti) : notez chaque série de 0 à 10 pendant vos séances",
      "Programmes personnalisés ajoutés pour les membres coaching",
    ],
    changes_en: [
      "Weekly planner: visualize and schedule your training week",
      "Interactive dashboard: click stats to jump straight to history",
      "RPE (perceived exertion): rate each set from 0 to 10 during sessions",
      "Custom programs added for coaching members",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-03-26",
    title_fr: "Mise à jour majeure",
    title_en: "Major Update",
    changes_fr: [
      "78 programmes Street Workout avec images Madbarz",
      "157 recettes complètes avec ingrédients et étapes de préparation",
      "Page Recettes dédiée avec favoris et partage de recettes",
      "Recherche aliments OpenFoodFacts avec calcul automatique des macros",
      "Page Timers unifiée : timer classique + Tabata avec presets sauvegardés",
      "Intégration Strava : synchronisation automatique des activités",
      "Navigation repensée avec sections collapsibles",
      "Onglet Favoris pour les programmes et les recettes",
      "Cibles reps/temps avec validation en un clic pendant les séances",
      "Image de la routine visible pendant l'entraînement (cliquable en plein écran)",
    ],
    changes_en: [
      "78 Street Workout programs with Madbarz images",
      "157 complete recipes with ingredients and preparation steps",
      "Dedicated Recipes page with favorites and recipe sharing",
      "OpenFoodFacts food search with automatic macro calculation",
      "Unified Timers page: classic timer + Tabata with saved presets",
      "Strava integration: automatic activity sync",
      "Redesigned navigation with collapsible sections",
      "Favorites tab for programs and recipes",
      "Target reps/duration with one-click validation during sessions",
      "Routine image visible during workout (clickable fullscreen)",
    ],
  },
];

const CURRENT_VERSION = CHANGELOG[0].version;
const STORAGE_KEY = "notigym_last_seen_version";

export default function ChangelogModal() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const storedLang = localStorage.getItem("i18nextLng") || "fr";
    setLang(storedLang.startsWith("fr") ? "fr" : "en");

    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== CURRENT_VERSION) {
      // Small delay so the app loads first
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setShow(false);
  };

  const entry = CHANGELOG[0];

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-onair-cyan/10">
                  <Sparkles className="w-5 h-5 text-onair-cyan" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold">
                    {lang === "fr" ? entry.title_fr : entry.title_en}
                  </h2>
                  <p className="text-xs text-onair-muted">v{entry.version} — {entry.date}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-onair-muted hover:text-onair-text p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-2.5">
              {(lang === "fr" ? entry.changes_fr : entry.changes_en).map((change, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-onair-cyan flex-shrink-0 mt-2" />
                  {change}
                </motion.li>
              ))}
            </ul>

            <button
              onClick={handleClose}
              className="btn-primary w-full mt-5"
            >
              {lang === "fr" ? "C'est noté !" : "Got it!"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
