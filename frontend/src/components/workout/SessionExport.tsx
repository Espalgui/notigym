import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Download, Share2, Dumbbell, Clock, Flame, Trophy } from "lucide-react";
import html2canvas from "html2canvas";

interface SessionExportProps {
  summary: {
    session_id: string;
    program_name?: string;
    day_name?: string;
    duration_minutes: number;
    exercise_count: number;
    total_volume: number;
    total_sets: number;
    feeling?: number;
    pr_count: number;
    started_at: string;
  };
  onClose: () => void;
}

export default function SessionExport({ summary, onClose }: SessionExportProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const feelingEmoji = summary.feeling ? ["", "\u{1F62B}", "\u{1F615}", "\u{1F610}", "\u{1F60A}", "\u{1F525}"][summary.feeling] : "";
  const dateStr = new Date(summary.started_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    weekday: "long", day: "numeric", month: "long",
  });

  const exportImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
      });
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) return;

      // Try native share (mobile), fallback to download
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "notigym-session.png")] })) {
        await navigator.share({
          files: [new File([blob], "notigym-session.png", { type: "image/png" })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notigym-session.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Exportable card */}
        <div ref={cardRef} className="rounded-2xl p-6 mb-4" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)" }}>
          <div className="text-center mb-4">
            <p className="text-xs text-[#8e8e93] uppercase tracking-widest mb-1">NotiGym</p>
            <p className="text-sm text-[#8e8e93]">{dateStr}</p>
          </div>

          {summary.program_name && (
            <p className="text-xs text-[#00d4ff] font-semibold text-center mb-1">{summary.program_name}</p>
          )}
          {summary.day_name && (
            <p className="text-lg font-bold text-white text-center mb-4">{summary.day_name}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" style={{ color: "#00d4ff" }} />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#8e8e93" }}>
                  {lang === "fr" ? "Durée" : "Duration"}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{summary.duration_minutes} min</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Dumbbell className="w-3.5 h-3.5" style={{ color: "#00d4ff" }} />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#8e8e93" }}>
                  {lang === "fr" ? "Exercices" : "Exercises"}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{summary.exercise_count}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5" style={{ color: "#ff9500" }} />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#8e8e93" }}>Volume</span>
              </div>
              <p className="text-lg font-bold text-white">{summary.total_volume} kg</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{feelingEmoji || "\u{1F4AA}"}</span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#8e8e93" }}>
                  {summary.total_sets} sets
                </span>
              </div>
              <p className="text-lg font-bold text-white">
                {summary.feeling ? `${summary.feeling}/5` : "—"}
              </p>
            </div>
          </div>

          {summary.pr_count > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3 py-2 rounded-xl" style={{ background: "rgba(255,179,0,0.1)" }}>
              <Trophy className="w-4 h-4" style={{ color: "#ffb300" }} />
              <span className="text-sm font-semibold" style={{ color: "#ffb300" }}>
                {summary.pr_count} PR{summary.pr_count > 1 ? "s" : ""} !
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={exportImage}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {"share" in navigator ? <Share2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {exporting
              ? (lang === "fr" ? "Export en cours..." : "Exporting...")
              : "share" in navigator
                ? (lang === "fr" ? "Partager l'image" : "Share image")
                : (lang === "fr" ? "Télécharger l'image" : "Download image")}
          </button>
          <button onClick={onClose} className="btn-ghost w-full">
            {lang === "fr" ? "Fermer" : "Close"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
