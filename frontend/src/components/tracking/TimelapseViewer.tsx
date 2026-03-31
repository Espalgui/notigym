import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from "lucide-react";

interface Photo {
  id: string;
  photo_url: string;
  category: string;
  taken_at: string;
}

interface TimelapseViewerProps {
  photos: Photo[];
  onClose: () => void;
}

export default function TimelapseViewer({ photos, onClose }: TimelapseViewerProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const sorted = [...photos].sort(
    (a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(2);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % sorted.length);
  }, [sorted.length]);

  const prev = () => {
    setIndex((i) => (i - 1 + sorted.length) % sorted.length);
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(next, speed * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, next]);

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));

  const photo = sorted[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.photo_url.startsWith("/") ? photo.photo_url : `/${photo.photo_url}`}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-h-full max-w-full object-contain"
          />
        </AnimatePresence>

        {/* Date overlay */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl">
          <p className="text-white text-sm font-semibold">{fmtDate(photo.taken_at)}</p>
          <p className="text-white/50 text-xs text-center">
            {index + 1} / {sorted.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-12 left-4 right-4">
          <div className="flex gap-1">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIndex(i); setPlaying(false); }}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i === index ? "bg-onair-cyan" : i < index ? "bg-white/40" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); setPlaying(false); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); setPlaying(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Controls bar */}
      <div
        className="flex items-center justify-center gap-4 py-4 bg-black/90"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setPlaying(!playing)}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-white/50" />
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                speed === s
                  ? "bg-onair-cyan text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
