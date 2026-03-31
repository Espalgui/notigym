import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Flame, Lock } from "lucide-react";
import api from "@/lib/api";

interface AchievementEntry {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

const categoryOrder = ["sessions", "streaks", "prs", "volume", "fun", "community"];
const categoryLabels: Record<string, { fr: string; en: string }> = {
  sessions: { fr: "Séances", en: "Sessions" },
  streaks: { fr: "Séries", en: "Streaks" },
  prs: { fr: "Records", en: "Records" },
  volume: { fr: "Volume", en: "Volume" },
  fun: { fr: "Fun", en: "Fun" },
  community: { fr: "Social", en: "Social" },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Achievements() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";

  const [achievements, setAchievements] = useState<AchievementEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/achievements").then((r) => setAchievements(r.data)),
      api.get("/achievements/streak").then((r) => setStreak(r.data.current_streak)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat]?.[lang] ?? cat,
      items: achievements.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const fmtDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ delay: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-onair-text">
              {t("achievements.title")}
            </h1>
            <p className="text-onair-muted mt-0.5 text-sm">
              {unlocked}/{achievements.length} {t("achievements.unlocked").toLowerCase()}
            </p>
          </div>
          <div className="card !py-3 !px-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-onair-red" />
            <div className="text-right">
              <p className="text-lg font-bold text-onair-text">{streak}</p>
              <p className="text-[10px] text-onair-muted uppercase tracking-wider">
                {t("achievements.streakDays")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-onair-amber border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <motion.div key={group.category} {...fadeInUp} transition={{ delay: 0.1 }}>
              <h2 className="text-sm font-semibold text-onair-muted uppercase tracking-wider mb-3">
                {group.label}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.items.map((ach, idx) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.03 * idx }}
                    className={`card text-center relative overflow-hidden transition-all ${
                      ach.unlocked
                        ? "ring-1 ring-onair-amber/30"
                        : "opacity-50 grayscale"
                    }`}
                  >
                    {!ach.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-3 h-3 text-onair-muted" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <p className="text-xs font-semibold text-onair-text mb-1 truncate">
                      {ach.name}
                    </p>
                    <p className="text-[10px] text-onair-muted leading-tight">
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.unlocked_at && (
                      <p className="text-[9px] text-onair-amber mt-2">
                        {fmtDate(ach.unlocked_at)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
