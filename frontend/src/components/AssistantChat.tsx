import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HelpCircle, X, Send, ChevronRight } from "lucide-react";

interface QA {
  keywords: string[];
  answer: string;
  link?: string;
  linkLabel?: string;
}

interface Message {
  from: "user" | "bot";
  text: string;
  link?: string;
  linkLabel?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function findBestMatch(input: string, qa: QA[]): QA | null {
  const words = normalize(input).split(/\s+/);
  let best: QA | null = null;
  let bestScore = 0;

  for (const item of qa) {
    let score = 0;
    for (const kw of item.keywords) {
      const nkw = normalize(kw);
      if (words.some((w) => nkw.includes(w) || w.includes(nkw))) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
}

export default function AssistantChat({ externalOpen, onExternalClose }: { externalOpen?: boolean; onExternalClose?: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  const handleClose = () => {
    setOpen(false);
    onExternalClose?.();
  };

  const qa: QA[] = lang === "fr" ? [
    { keywords: ["séance", "entraînement", "commencer", "lancer", "workout"], answer: "Pour démarrer une séance, va dans Entraînements et clique sur le bouton \"Démarrer\". Tu peux choisir un programme ou faire une séance libre.", link: "/workouts", linkLabel: "Entraînements" },
    { keywords: ["programme", "créer", "nouveau", "template"], answer: "Tu peux créer ton propre programme dans Entraînements → \"Créer un programme\". Tu peux aussi importer un template recommandé depuis l'onglet Recommandés.", link: "/workouts", linkLabel: "Entraînements" },
    { keywords: ["nutrition", "repas", "aliment", "manger", "calorie"], answer: "Va dans Nutrition pour logger tes repas. Tu peux chercher des aliments, scanner un code-barres, ou utiliser un repas type sauvegardé.", link: "/nutrition", linkLabel: "Nutrition" },
    { keywords: ["eau", "hydratation", "boire", "water"], answer: "Tu peux suivre ton hydratation depuis le Dashboard (widget eau) ou depuis la page Nutrition. Ajoute de l'eau avec les boutons rapides ou un montant personnalisé.", link: "/nutrition", linkLabel: "Nutrition" },
    { keywords: ["poids", "pesée", "peser", "mesure", "corporel"], answer: "Va dans Suivi Corporel pour enregistrer ton poids, tes mensurations et tes photos de progression.", link: "/body", linkLabel: "Suivi corporel" },
    { keywords: ["photo", "progression", "timelapse", "avant", "après"], answer: "Dans Suivi Corporel, tu peux ajouter des photos de progression (face, côté, dos) et les comparer avec le timelapse.", link: "/body", linkLabel: "Suivi corporel" },
    { keywords: ["communauté", "partager", "post", "fil", "social"], answer: "La Communauté te permet de partager tes séances, records et recettes. Tu peux aussi liker et commenter les posts des autres.", link: "/community", linkLabel: "Communauté" },
    { keywords: ["recette", "cuisine", "plat", "ingrédient"], answer: "Va dans Recettes pour découvrir des recettes avec macros détaillées. Tu peux les ajouter à ton journal nutrition ou les partager sur le fil.", link: "/recipes", linkLabel: "Recettes" },
    { keywords: ["record", "pr", "performance", "max"], answer: "Tes records personnels sont détectés automatiquement. Consulte-les dans la page Records avec les graphiques de progression 1RM.", link: "/records", linkLabel: "Records" },
    { keywords: ["planning", "planifier", "semaine", "calendrier"], answer: "Configure ton planning hebdomadaire dans Planning. Assigne un programme à tes jours d'entraînement pour ne rien oublier.", link: "/planning", linkLabel: "Planning" },
    { keywords: ["statistiques", "stats", "graphique", "progression", "comparer"], answer: "La page Statistiques montre tes graphiques de progression (volume, nutrition, poids...). Tu peux aussi comparer deux mois entre eux.", link: "/statistics", linkLabel: "Statistiques" },
    { keywords: ["objectif", "goal", "macro", "cible"], answer: "Définis tes objectifs nutritionnels dans Nutrition → bouton objectifs. Pour l'objectif de séances hebdo, va dans Profil.", link: "/profile", linkLabel: "Profil" },
    { keywords: ["thème", "sombre", "clair", "dark", "light", "mode"], answer: "Change le thème (sombre/clair/auto) depuis la sidebar, en bas à gauche." },
    { keywords: ["timer", "repos", "chrono", "tabata"], answer: "Les timers sont disponibles dans la page Timers. En séance, le timer de repos se lance automatiquement après chaque série si l'option Auto est activée.", link: "/timers", linkLabel: "Timers" },
    { keywords: ["badge", "succès", "achievement", "streak"], answer: "Consulte tes badges et ton streak dans la page Succès. Les badges se débloquent automatiquement quand tu atteins certains objectifs.", link: "/achievements", linkLabel: "Succès" },
    { keywords: ["profil", "compte", "paramètre", "réglage"], answer: "Modifie ton profil, tes objectifs, la langue et la sécurité (2FA) dans la page Profil.", link: "/profile", linkLabel: "Profil" },
    { keywords: ["notification", "push", "alerte"], answer: "Active les notifications push dans Profil → Notifications. Tu seras notifié des likes, commentaires et nouveaux posts.", link: "/profile", linkLabel: "Profil" },
    { keywords: ["strava", "connecter", "sync", "course", "vélo"], answer: "Connecte Strava dans la page Activité pour synchroniser tes activités de course et vélo.", link: "/activity", linkLabel: "Activité" },
    { keywords: ["export", "csv", "télécharger", "données"], answer: "Tu peux exporter ton historique de séances en CSV depuis Entraînements → onglet Historique → bouton \"Exporter CSV\".", link: "/workouts?tab=history", linkLabel: "Historique" },
  ] : [
    { keywords: ["session", "workout", "start", "begin", "train"], answer: "To start a session, go to Workouts and click \"Start\". You can choose a program or do a free session.", link: "/workouts", linkLabel: "Workouts" },
    { keywords: ["program", "create", "new", "template"], answer: "Create your own program in Workouts → \"Create program\". You can also import recommended templates from the Recommended tab.", link: "/workouts", linkLabel: "Workouts" },
    { keywords: ["nutrition", "meal", "food", "eat", "calorie"], answer: "Go to Nutrition to log your meals. You can search foods, scan barcodes, or use saved meal templates.", link: "/nutrition", linkLabel: "Nutrition" },
    { keywords: ["water", "hydration", "drink"], answer: "Track hydration from the Dashboard (water widget) or the Nutrition page. Add water with quick buttons or a custom amount.", link: "/nutrition", linkLabel: "Nutrition" },
    { keywords: ["weight", "weigh", "measure", "body"], answer: "Go to Body Tracking to log your weight, measurements and progress photos.", link: "/body", linkLabel: "Body Tracking" },
    { keywords: ["photo", "progress", "timelapse", "before", "after"], answer: "In Body Tracking, add progress photos (front, side, back) and compare them with the timelapse feature.", link: "/body", linkLabel: "Body Tracking" },
    { keywords: ["community", "share", "post", "feed", "social"], answer: "The Community lets you share sessions, records and recipes. You can also like and comment on others' posts.", link: "/community", linkLabel: "Community" },
    { keywords: ["recipe", "cook", "ingredient"], answer: "Go to Recipes to discover recipes with detailed macros. Add them to your nutrition log or share them on the feed.", link: "/recipes", linkLabel: "Recipes" },
    { keywords: ["record", "pr", "performance", "max"], answer: "Personal records are detected automatically. Check them in the Records page with 1RM progression charts.", link: "/records", linkLabel: "Records" },
    { keywords: ["planning", "plan", "schedule", "week", "calendar"], answer: "Set up your weekly plan in Planning. Assign a program to your training days so you never miss a session.", link: "/planning", linkLabel: "Planning" },
    { keywords: ["statistics", "stats", "chart", "progress", "compare"], answer: "The Statistics page shows your progression charts (volume, nutrition, weight...). You can also compare two months.", link: "/statistics", linkLabel: "Statistics" },
    { keywords: ["goal", "target", "macro", "objective"], answer: "Set your nutrition goals in Nutrition → goals button. For weekly session goals, go to Profile.", link: "/profile", linkLabel: "Profile" },
    { keywords: ["theme", "dark", "light", "mode"], answer: "Change the theme (dark/light/auto) from the sidebar, bottom left." },
    { keywords: ["timer", "rest", "tabata", "chrono"], answer: "Timers are available in the Timers page. During sessions, the rest timer auto-starts after each set if Auto is enabled.", link: "/timers", linkLabel: "Timers" },
    { keywords: ["badge", "achievement", "streak"], answer: "Check your badges and streak in the Achievements page. Badges unlock automatically when you reach certain goals.", link: "/achievements", linkLabel: "Achievements" },
    { keywords: ["profile", "account", "settings"], answer: "Edit your profile, goals, language and security (2FA) in the Profile page.", link: "/profile", linkLabel: "Profile" },
    { keywords: ["notification", "push", "alert"], answer: "Enable push notifications in Profile → Notifications. You'll be notified of likes, comments and new posts.", link: "/profile", linkLabel: "Profile" },
    { keywords: ["strava", "connect", "sync", "run", "cycle"], answer: "Connect Strava in the Activity page to sync your running and cycling activities.", link: "/activity", linkLabel: "Activity" },
    { keywords: ["export", "csv", "download", "data"], answer: "Export your session history as CSV from Workouts → History tab → \"Export CSV\" button.", link: "/workouts?tab=history", linkLabel: "History" },
  ];

  const suggestions = lang === "fr"
    ? ["Comment démarrer une séance ?", "Comment suivre mon eau ?", "Comment partager une recette ?", "Comment voir mes records ?", "Comment exporter mes données ?"]
    : ["How to start a workout?", "How to track water?", "How to share a recipe?", "How to see my records?", "How to export my data?"];

  const handleSend = (text?: string) => {
    const q = text || input.trim();
    if (!q) return;

    const userMsg: Message = { from: "user", text: q };
    const match = findBestMatch(q, qa);

    const botMsg: Message = match
      ? { from: "bot", text: match.answer, link: match.link, linkLabel: match.linkLabel }
      : {
          from: "bot",
          text: lang === "fr"
            ? "Je n'ai pas trouvé de réponse. Essaie une de ces questions :"
            : "I couldn't find an answer. Try one of these questions:",
        };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 left-6 lg:left-[17rem] z-50 w-[340px] max-h-[500px] rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-onair-border">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-onair-cyan" />
              <h3 className="font-display font-semibold text-sm">{lang === "fr" ? "Aide" : "Help"}</h3>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-onair-muted hover:text-onair-text hover:bg-onair-surface">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-onair-muted text-center mb-3">
                  {lang === "fr" ? "Pose-moi une question !" : "Ask me a question!"}
                </p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-onair-surface/50 text-xs text-onair-text hover:bg-onair-surface transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.from === "user"
                    ? "bg-onair-cyan text-white rounded-br-sm"
                    : "bg-onair-surface text-onair-text rounded-bl-sm"
                }`}>
                  <p>{msg.text}</p>
                  {msg.link && (
                    <button
                      onClick={() => { navigate(msg.link!); handleClose(); }}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-onair-cyan hover:underline"
                    >
                      {msg.linkLabel || msg.link} <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {messages.length > 0 && messages[messages.length - 1].from === "bot" && !messages[messages.length - 1].link && (
              <div className="space-y-1.5 pt-1">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-onair-surface/50 text-[11px] text-onair-muted hover:bg-onair-surface transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-onair-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={lang === "fr" ? "Pose une question..." : "Ask a question..."}
              className="flex-1 text-sm !py-2"
            />
            <button onClick={() => handleSend()} className="p-2 rounded-xl bg-onair-cyan text-white hover:bg-onair-cyan/80 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
