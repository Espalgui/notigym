import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import api from "@/lib/api";

interface SessionCompareProps {
  sessionA: string;
  sessionB: string;
  exerciseMap: Record<string, { name_fr: string; name_en: string }>;
  onClose: () => void;
}

export default function SessionCompare({ sessionA, sessionB, exerciseMap, onClose }: SessionCompareProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workouts/sessions/compare?session_a=${sessionA}&session_b=${sessionB}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionA, sessionB]);

  const diff = (a: number, b: number) => {
    const d = b - a;
    if (d > 0) return <span className="text-onair-green flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{d}</span>;
    if (d < 0) return <span className="text-onair-red flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{d}</span>;
    return <span className="text-onair-muted flex items-center gap-0.5"><Minus className="w-3 h-3" />0</span>;
  };

  const exName = (id: string) => {
    const ex = exerciseMap[id];
    if (!ex) return id.slice(0, 8);
    return lang === "fr" ? ex.name_fr : ex.name_en;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">{lang === "fr" ? "Comparaison" : "Compare"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-onair-surface"><X className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <p className="text-center text-onair-muted py-8">{lang === "fr" ? "Chargement..." : "Loading..."}</p>
        ) : !data ? (
          <p className="text-center text-onair-muted py-8">{lang === "fr" ? "Erreur" : "Error"}</p>
        ) : (
          <>
            {/* Dates */}
            <div className="grid grid-cols-3 gap-2 text-xs text-onair-muted mb-3">
              <span />
              <span className="text-center">{new Date(data.a.started_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" })}</span>
              <span className="text-center">{new Date(data.b.started_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" })}</span>
            </div>

            {/* Global stats */}
            {[
              { label: "Volume", a: data.a.total_volume, b: data.b.total_volume, unit: "kg" },
              { label: lang === "fr" ? "Durée" : "Duration", a: data.a.duration_minutes ?? 0, b: data.b.duration_minutes ?? 0, unit: "min" },
              { label: "Sets", a: data.a.total_sets, b: data.b.total_sets, unit: "" },
              { label: "PRs", a: data.a.pr_count, b: data.b.pr_count, unit: "" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-3 gap-2 py-2 border-b border-onair-border/30 text-sm">
                <span className="text-onair-muted text-xs">{row.label}</span>
                <span className="text-center font-medium">{row.a} {row.unit}</span>
                <div className="text-center font-medium flex items-center justify-center gap-1.5">
                  {row.b} {row.unit} {diff(row.a, row.b)}
                </div>
              </div>
            ))}

            {/* Per exercise */}
            <p className="text-xs text-onair-muted mt-4 mb-2 uppercase tracking-wider">{lang === "fr" ? "Par exercice (volume)" : "Per exercise (volume)"}</p>
            {Object.keys({ ...data.a.exercises, ...data.b.exercises }).map((eid) => {
              const volA = data.a.exercises?.[eid]?.volume ?? 0;
              const volB = data.b.exercises?.[eid]?.volume ?? 0;
              return (
                <div key={eid} className="grid grid-cols-3 gap-2 py-1.5 text-xs">
                  <span className="text-onair-text truncate">{exName(eid)}</span>
                  <span className="text-center text-onair-muted">{volA ? `${Math.round(volA)} kg` : "—"}</span>
                  <div className="text-center text-onair-muted flex items-center justify-center gap-1">
                    {volB ? `${Math.round(volB)} kg` : "—"} {volA && volB ? diff(volA, volB) : null}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
