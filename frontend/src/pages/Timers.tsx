import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Pause,
  Save,
  Trash2,
  Timer,
  Flame,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ── Shared types ─────────────────────────────────────────────
interface DBPreset {
  id: string;
  name: string;
  preset_type: string;
  config: string;
}

// ── Audio hook ───────────────────────────────────────────────
function useTimerAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };
  const beep = (freq: number, duration: number, delay = 0) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  };
  return {
    playCountdown: () => beep(660, 0.1),
    playDone: () => { beep(880, 0.15, 0); beep(880, 0.15, 0.2); beep(1100, 0.3, 0.4); },
    playTransition: () => beep(880, 0.15),
    playRest: () => beep(440, 0.2),
  };
}

// ── Classic Timer ────────────────────────────────────────────
const CLASSIC_PRESETS = [30, 60, 90, 120, 180, 300];

function ClassicTimer({ presets, onSavePreset, onDeletePreset }: {
  presets: DBPreset[];
  onSavePreset: (name: string, type: string, config: string) => void;
  onDeletePreset: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const audio = useTimerAudio();

  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  const stop = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => () => stop(), []);

  const start = (secs?: number) => {
    const s = secs ?? duration;
    remainingRef.current = s;
    setRemaining(s);
    setDone(false);
    setRunning(true);
    stop();
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);
      if (remainingRef.current <= 3 && remainingRef.current > 0) audio.playCountdown();
      if (remainingRef.current <= 0) {
        stop();
        setRunning(false);
        setDone(true);
        audio.playDone();
      }
    }, 1000);
  };

  const pause = () => { stop(); setRunning(false); };
  const resume = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);
      if (remainingRef.current <= 3 && remainingRef.current > 0) audio.playCountdown();
      if (remainingRef.current <= 0) {
        stop();
        setRunning(false);
        setDone(true);
        audio.playDone();
      }
    }, 1000);
  };
  const reset = () => { stop(); setRunning(false); setDone(false); setRemaining(0); };

  const adjust = (delta: number) => {
    setDuration((d) => Math.max(5, d + delta));
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const RADIUS = 90;
  const CIRC = 2 * Math.PI * RADIUS;
  const progress = remaining > 0 ? 1 - remaining / duration : done ? 1 : 0;

  const classicPresets = presets.filter((p) => p.preset_type === "classic");

  const isActive = running || remaining > 0;

  return (
    <div className="space-y-6">
      {/* Quick presets */}
      {!isActive && !done && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CLASSIC_PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => { setDuration(s); start(s); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                  "bg-onair-surface border border-onair-border text-onair-muted hover:text-onair-cyan hover:border-onair-cyan/30"
                )}
              >
                {fmt(s)}
              </button>
            ))}
          </div>

          {/* Saved presets */}
          {classicPresets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {classicPresets.map((p) => {
                const cfg = JSON.parse(p.config);
                return (
                  <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-onair-surface border border-onair-border text-sm">
                    <button
                      onClick={() => { setDuration(cfg.seconds); start(cfg.seconds); }}
                      className="text-onair-text hover:text-onair-cyan transition-colors"
                    >
                      {p.name}
                    </button>
                    <button onClick={() => onDeletePreset(p.id)} className="text-onair-muted hover:text-onair-red transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom duration */}
          <div className="card flex items-center justify-center gap-4">
            <button onClick={() => adjust(-15)} className="p-2 rounded-lg bg-onair-surface hover:bg-onair-red/10 transition-colors">
              <Minus className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={Math.floor(duration / 60)}
                  onChange={(e) => setDuration(Math.max(5, +e.target.value * 60 + (duration % 60)))}
                  className="w-14 text-center font-mono text-4xl font-bold bg-transparent border-b-2 border-onair-border focus:border-onair-cyan p-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="font-mono text-4xl font-bold text-onair-muted">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={String(duration % 60).padStart(2, "0")}
                  onChange={(e) => {
                    const sec = Math.min(59, Math.max(0, +e.target.value));
                    setDuration(Math.max(5, Math.floor(duration / 60) * 60 + sec));
                  }}
                  className="w-14 text-center font-mono text-4xl font-bold bg-transparent border-b-2 border-onair-border focus:border-onair-cyan p-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <p className="text-xs text-onair-muted mt-1">{lang === "fr" ? "Durée (min:sec)" : "Duration (min:sec)"}</p>
            </div>
            <button onClick={() => adjust(15)} className="p-2 rounded-lg bg-onair-surface hover:bg-onair-cyan/10 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => start()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              {lang === "fr" ? "Démarrer" : "Start"}
            </button>
            <button
              onClick={() => {
                const name = prompt(lang === "fr" ? "Nom du preset :" : "Preset name:");
                if (name?.trim()) onSavePreset(name.trim(), "classic", JSON.stringify({ seconds: duration }));
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Timer ring */}
      {(isActive || done) && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="relative">
            <svg width="200" height="200" className="-rotate-90">
              <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="8" className="stroke-onair-border" />
              <circle
                cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
                className={cn("transition-all duration-1000", done ? "stroke-green-400" : "stroke-onair-cyan")}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("font-mono text-6xl font-bold tabular-nums", done ? "text-green-400" : "text-onair-cyan")}>
                {done ? "✓" : fmt(remaining)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {running && (
              <button onClick={pause} className="btn-secondary flex items-center gap-2">
                <Pause className="w-5 h-5" />
                {lang === "fr" ? "Pause" : "Pause"}
              </button>
            )}
            {!running && remaining > 0 && !done && (
              <button onClick={resume} className="btn-primary flex items-center gap-2">
                <Play className="w-5 h-5" />
                {lang === "fr" ? "Reprendre" : "Resume"}
              </button>
            )}
            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {lang === "fr" ? "Reset" : "Reset"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabata Timer ─────────────────────────────────────────────
interface TabataConfig {
  name: string;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  prepSeconds: number;
  exercises: string[];
}

type Phase = "idle" | "prepare" | "work" | "rest" | "done";

const DEFAULT_TABATA: TabataConfig = {
  name: "",
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  prepSeconds: 10,
  exercises: [],
};

const SUGGESTED_EXERCISES = [
  "Burpees", "Mountain Climbers", "Jumping Jacks", "Squats",
  "Push-Ups", "Planche", "High Knees", "Lunges",
  "Bicycle Crunches", "Jump Squats", "Wall Sit", "Pompes diamant",
];

const PHASE_COLORS: Record<Phase, string> = {
  idle: "text-onair-muted", prepare: "text-amber-400",
  work: "text-onair-red", rest: "text-onair-cyan", done: "text-green-400",
};
const RING_COLORS: Record<Phase, string> = {
  idle: "stroke-onair-border", prepare: "stroke-amber-400",
  work: "stroke-onair-red", rest: "stroke-onair-cyan", done: "stroke-green-400",
};
const BADGE_CLASSES: Record<Phase, string> = {
  idle: "bg-onair-surface text-onair-muted",
  prepare: "bg-amber-500/20 text-amber-400",
  work: "bg-onair-red/20 text-onair-red",
  rest: "bg-onair-cyan/20 text-onair-cyan",
  done: "bg-green-500/20 text-green-400",
};

function TabataTimer({ presets, onSavePreset, onDeletePreset }: {
  presets: DBPreset[];
  onSavePreset: (name: string, type: string, config: string) => void;
  onDeletePreset: (id: string) => void;
}) {
  const { t } = useTranslation();
  const audio = useTimerAudio();

  const [config, setConfig] = useState<TabataConfig>(DEFAULT_TABATA);
  const [exercisesText, setExercisesText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);

  const remainingRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const roundRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  // Wake lock
  useEffect(() => {
    let wakeLock: any = null;
    if (phase !== "idle" && phase !== "done")
      navigator.wakeLock?.request("screen").then((wl) => { wakeLock = wl; }).catch(() => {});
    return () => { wakeLock?.release().catch(() => {}); };
  }, [phase]);

  const stop = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  useEffect(() => () => stop(), []);

  const advance = useCallback(() => {
    const cur = phaseRef.current;
    const round = roundRef.current;
    const cfg = configRef.current;
    if (cur === "prepare") {
      phaseRef.current = "work"; roundRef.current = 1; remainingRef.current = cfg.workSeconds;
      setPhase("work"); setCurrentRound(1); setRemaining(cfg.workSeconds); audio.playTransition();
    } else if (cur === "work") {
      if (round >= cfg.rounds) {
        stop(); phaseRef.current = "done"; setPhase("done"); audio.playDone();
      } else {
        phaseRef.current = "rest"; remainingRef.current = cfg.restSeconds;
        setPhase("rest"); setRemaining(cfg.restSeconds); audio.playRest();
      }
    } else if (cur === "rest") {
      const next = round + 1;
      phaseRef.current = "work"; roundRef.current = next; remainingRef.current = cfg.workSeconds;
      setPhase("work"); setCurrentRound(next); setRemaining(cfg.workSeconds); audio.playTransition();
    }
  }, [audio]);

  const tick = useCallback(() => {
    remainingRef.current -= 1;
    setRemaining(remainingRef.current);
    if (remainingRef.current <= 3 && remainingRef.current > 0 && phaseRef.current !== "prepare") audio.playCountdown();
    if (remainingRef.current <= 0) advance();
  }, [advance, audio]);

  const handleStart = () => {
    setSettingsOpen(false);
    phaseRef.current = "prepare"; roundRef.current = 0; remainingRef.current = config.prepSeconds;
    setPhase("prepare"); setCurrentRound(0); setRemaining(config.prepSeconds);
    intervalRef.current = setInterval(tick, 1000);
  };
  const handlePause = () => { stop(); setPhase("idle"); phaseRef.current = "idle"; };
  const handleResume = () => { phaseRef.current = "work"; intervalRef.current = setInterval(tick, 1000); setPhase("work"); };
  const handleReset = () => {
    stop(); phaseRef.current = "idle"; roundRef.current = 0; remainingRef.current = 0;
    setPhase("idle"); setCurrentRound(0); setRemaining(0); setSettingsOpen(true);
  };

  const updateConfig = (key: keyof TabataConfig, value: any) => setConfig((c) => ({ ...c, [key]: value }));
  const handleExercisesChange = (text: string) => {
    setExercisesText(text);
    updateConfig("exercises", text.split("\n").map((s) => s.trim()).filter(Boolean));
  };

  const loadPreset = (p: DBPreset) => {
    const cfg = JSON.parse(p.config) as TabataConfig;
    setConfig(cfg);
    setExercisesText(cfg.exercises?.join("\n") || "");
  };

  const RADIUS = 90;
  const CIRC = 2 * Math.PI * RADIUS;
  const phaseDur = phase === "prepare" ? config.prepSeconds : phase === "work" ? config.workSeconds : phase === "rest" ? config.restSeconds : 1;
  const progress = phase === "done" ? 1 : phase === "idle" ? 0 : 1 - remaining / phaseDur;

  const currentExercise = config.exercises.length > 0 && currentRound > 0
    ? config.exercises[(currentRound - 1) % config.exercises.length] : null;
  const isRunning = phase !== "idle" && phase !== "done";

  const tabataPresets = presets.filter((p) => p.preset_type === "tabata");

  return (
    <div className="space-y-6">
      {/* Settings */}
      {(phase === "idle" || phase === "done") && (
        <div className="card">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="flex items-center gap-2 w-full text-sm font-semibold text-onair-text">
            {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {t("tabata.settings")}
          </button>
          {settingsOpen && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-onair-muted mb-1 block">{t("tabata.sessionName")}</label>
                <input type="text" value={config.name} onChange={(e) => updateConfig("name", e.target.value)} className="w-full" placeholder={t("tabata.sessionNamePlaceholder")} />
              </div>

              {tabataPresets.length > 0 && (
                <div>
                  <label className="text-sm text-onair-muted mb-2 block">{t("tabata.presets")}</label>
                  <div className="flex flex-wrap gap-2">
                    {tabataPresets.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-onair-surface border border-onair-border text-sm">
                        <button onClick={() => loadPreset(p)} className="text-onair-text hover:text-onair-cyan transition-colors">{p.name}</button>
                        <button onClick={() => onDeletePreset(p.id)} className="text-onair-muted hover:text-onair-red transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.workDuration")}</label>
                  <input type="number" min={5} value={config.workSeconds} onChange={(e) => updateConfig("workSeconds", +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.restDuration")}</label>
                  <input type="number" min={1} value={config.restSeconds} onChange={(e) => updateConfig("restSeconds", +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.rounds")}</label>
                  <input type="number" min={1} value={config.rounds} onChange={(e) => updateConfig("rounds", +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.prepTime")}</label>
                  <input type="number" min={0} value={config.prepSeconds} onChange={(e) => updateConfig("prepSeconds", +e.target.value)} className="w-full" />
                </div>
              </div>

              <div>
                <label className="text-sm text-onair-muted mb-1 block">{t("tabata.exercises")}</label>
                <textarea value={exercisesText} onChange={(e) => handleExercisesChange(e.target.value)} rows={4} className="w-full text-sm" placeholder="Burpees&#10;Squats&#10;Mountain climbers" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_EXERCISES.map((name) => (
                    <button key={name} onClick={() => handleExercisesChange(exercisesText ? exercisesText + "\n" + name : name)}
                      className="px-2.5 py-1 rounded-full text-xs bg-onair-surface border border-onair-border text-onair-muted hover:text-onair-cyan hover:border-onair-cyan/30 transition-colors">
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const presetName = config.name.trim() || `Tabata ${tabataPresets.length + 1}`;
                  onSavePreset(presetName, "tabata", JSON.stringify({ ...config, name: presetName }));
                  if (!config.name.trim()) updateConfig("name", presetName);
                }}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                {t("tabata.savePreset")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timer display */}
      <div className="flex flex-col items-center gap-6 py-4">
        {config.name && isRunning && <p className="text-sm font-medium text-onair-muted">{config.name}</p>}

        <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase", BADGE_CLASSES[phase])}>
          {t(`tabata.phases.${phase === "idle" ? "prepare" : phase}`)}
        </div>

        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="8" className="stroke-onair-border" />
            <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              className={cn("transition-all duration-1000", RING_COLORS[phase])} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("font-mono text-7xl font-bold tabular-nums leading-none", PHASE_COLORS[phase])}>
              {phase === "idle" ? "--" : phase === "done" ? "✓" : String(remaining).padStart(2, "0")}
            </span>
          </div>
        </div>

        {(phase === "work" || phase === "rest") && (
          <p className="text-sm font-medium text-onair-muted">
            {t("tabata.round")} {currentRound} {t("tabata.of")} {config.rounds}
          </p>
        )}
        {currentExercise && (phase === "work" || phase === "rest") && (
          <p className="text-base font-semibold text-onair-text">{currentExercise}</p>
        )}

        <div className="flex gap-3">
          {phase === "idle" && (
            <button onClick={handleStart} className="btn-primary flex items-center gap-2 px-8">
              <Play className="w-5 h-5" /> {t("tabata.start")}
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
                <Pause className="w-5 h-5" /> {t("tabata.pause")}
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-5 h-5" /> {t("tabata.reset")}
              </button>
            </>
          )}
          {phase === "done" && (
            <button onClick={handleReset} className="btn-primary flex items-center gap-2 px-8">
              <RotateCcw className="w-5 h-5" /> {t("tabata.reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
type Tab = "classic" | "tabata";

export default function Timers() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const [tab, setTab] = useState<Tab>("classic");
  const [presets, setPresets] = useState<DBPreset[]>([]);

  useEffect(() => {
    api.get("/timers/presets").then((r) => setPresets(r.data)).catch(() => {});
  }, []);

  const handleSavePreset = async (name: string, type: string, config: string) => {
    try {
      const { data } = await api.post("/timers/presets", { name, preset_type: type, config });
      setPresets((prev) => [data, ...prev]);
      toast.success(lang === "fr" ? "Preset sauvegardé !" : "Preset saved!");
    } catch {
      toast.error("Error");
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await api.delete(`/timers/presets/${id}`);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Timers</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-onair-surface rounded-xl">
        <button
          onClick={() => setTab("classic")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors",
            tab === "classic" ? "bg-onair-cyan/15 text-onair-cyan" : "text-onair-muted hover:text-onair-text"
          )}
        >
          <Timer className="w-4 h-4" />
          {lang === "fr" ? "Classique" : "Classic"}
        </button>
        <button
          onClick={() => setTab("tabata")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors",
            tab === "tabata" ? "bg-amber-500/15 text-amber-400" : "text-onair-muted hover:text-onair-text"
          )}
        >
          <Flame className="w-4 h-4" />
          Tabata
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "classic" ? (
          <motion.div key="classic" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }}>
            <ClassicTimer presets={presets} onSavePreset={handleSavePreset} onDeletePreset={handleDeletePreset} />
          </motion.div>
        ) : (
          <motion.div key="tabata" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
            <TabataTimer presets={presets} onSavePreset={handleSavePreset} onDeletePreset={handleDeletePreset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
