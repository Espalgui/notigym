import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Audio hook (shared) ──────────────────────────────────────────────
function useTimerAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
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
    playDone: () => {
      beep(880, 0.15, 0);
      beep(880, 0.15, 0.2);
      beep(1100, 0.3, 0.4);
    },
    playTransition: () => beep(880, 0.15),
    playRest: () => beep(440, 0.2),
  };
}

// ── Simple Rest Timer ────────────────────────────────────────────────
const REST_PRESETS = [30, 60, 90, 120, 180];

function RestTimer() {
  const { t } = useTranslation();
  const audio = useTimerAudio();

  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState(false);

  const remainingRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = (seconds: number) => {
    stop();
    setDuration(seconds);
    remainingRef.current = seconds;
    setRemaining(seconds);
    setRunning(true);

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);

      if (remainingRef.current <= 3 && remainingRef.current > 0) {
        audio.playCountdown();
      }

      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRunning(false);
        audio.playDone();
      }
    }, 1000);
  };

  const pause = () => {
    stop();
    setRunning(false);
  };

  const resume = () => {
    if (remaining <= 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);

      if (remainingRef.current <= 3 && remainingRef.current > 0) {
        audio.playCountdown();
      }

      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRunning(false);
        audio.playDone();
      }
    }, 1000);
  };

  const reset = () => {
    stop();
    setRunning(false);
    setRemaining(0);
  };

  const adjustDuration = (delta: number) => {
    const newVal = Math.max(5, duration + delta);
    setDuration(newVal);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const progress = duration > 0 && remaining > 0 ? 1 - remaining / duration : remaining === 0 && !running ? 1 : 0;
  const isFinished = remaining === 0 && !running && duration > 0 && progress === 1;

  return (
    <div className="space-y-4">
      {/* Timer display */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-36 h-36">
          <svg width="144" height="144" className="-rotate-90">
            <circle cx="72" cy="72" r="62" fill="none" strokeWidth="6" className="stroke-onair-border" />
            <circle
              cx="72" cy="72" r="62" fill="none" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 62}
              strokeDashoffset={2 * Math.PI * 62 * (1 - progress)}
              className={cn(
                "transition-all duration-1000",
                isFinished ? "stroke-green-400" : running ? "stroke-onair-cyan" : "stroke-onair-border"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "font-mono text-3xl font-bold tabular-nums",
              isFinished ? "text-green-400" : running ? "text-onair-cyan" : "text-onair-text"
            )}>
              {remaining > 0 || running ? formatTime(remaining) : isFinished ? "✓" : formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!running && remaining === 0 && (
            <>
              <button
                onClick={() => adjustDuration(-15)}
                className="p-2 rounded-lg text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => start(duration)}
                className="btn-primary flex items-center gap-2 px-6"
              >
                <Play className="w-4 h-4" />
                {t("tabata.start")}
              </button>
              <button
                onClick={() => adjustDuration(15)}
                className="p-2 rounded-lg text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
          {running && (
            <button onClick={pause} className="btn-secondary flex items-center gap-2">
              <Pause className="w-4 h-4" />
              {t("tabata.pause")}
            </button>
          )}
          {!running && remaining > 0 && (
            <>
              <button onClick={resume} className="btn-primary flex items-center gap-2">
                <Play className="w-4 h-4" />
                {t("tabata.resume")}
              </button>
              <button onClick={reset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
          {isFinished && (
            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {t("tabata.reset")}
            </button>
          )}
        </div>
      </div>

      {/* Presets */}
      {!running && remaining === 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {REST_PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => { setDuration(s); start(s); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                duration === s && !running
                  ? "bg-onair-cyan/20 text-onair-cyan border border-onair-cyan/30"
                  : "bg-onair-surface text-onair-muted hover:text-onair-text"
              )}
            >
              {formatTime(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inline Tabata Timer ──────────────────────────────────────────────
type Phase = "idle" | "prepare" | "work" | "rest" | "done";

const PHASE_COLORS: Record<Phase, string> = {
  idle: "text-onair-muted",
  prepare: "text-amber-400",
  work: "text-onair-red",
  rest: "text-onair-cyan",
  done: "text-green-400",
};

const RING_COLORS: Record<Phase, string> = {
  idle: "stroke-onair-border",
  prepare: "stroke-amber-400",
  work: "stroke-onair-red",
  rest: "stroke-onair-cyan",
  done: "stroke-green-400",
};

const BADGE_CLASSES: Record<Phase, string> = {
  idle: "bg-onair-surface text-onair-muted",
  prepare: "bg-amber-500/20 text-amber-400",
  work: "bg-onair-red/20 text-onair-red",
  rest: "bg-onair-cyan/20 text-onair-cyan",
  done: "bg-green-500/20 text-green-400",
};

interface TabataConfig {
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  prepSeconds: number;
}

const DEFAULT_TABATA: TabataConfig = {
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  prepSeconds: 5,
};

function InlineTabata() {
  const { t } = useTranslation();
  const audio = useTimerAudio();

  const [config, setConfig] = useState<TabataConfig>(DEFAULT_TABATA);
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

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const advance = useCallback(() => {
    const cp = phaseRef.current;
    const round = roundRef.current;
    const cfg = configRef.current;

    if (cp === "prepare") {
      phaseRef.current = "work";
      roundRef.current = 1;
      remainingRef.current = cfg.workSeconds;
      setPhase("work");
      setCurrentRound(1);
      setRemaining(cfg.workSeconds);
      audio.playTransition();
    } else if (cp === "work") {
      if (round >= cfg.rounds) {
        stopTimer();
        phaseRef.current = "done";
        setPhase("done");
        audio.playDone();
      } else {
        phaseRef.current = "rest";
        remainingRef.current = cfg.restSeconds;
        setPhase("rest");
        setRemaining(cfg.restSeconds);
        audio.playRest();
      }
    } else if (cp === "rest") {
      const next = round + 1;
      phaseRef.current = "work";
      roundRef.current = next;
      remainingRef.current = cfg.workSeconds;
      setPhase("work");
      setCurrentRound(next);
      setRemaining(cfg.workSeconds);
      audio.playTransition();
    }
  }, [audio, stopTimer]);

  const tick = useCallback(() => {
    remainingRef.current -= 1;
    setRemaining(remainingRef.current);
    if (remainingRef.current <= 3 && remainingRef.current > 0 && phaseRef.current !== "prepare") {
      audio.playCountdown();
    }
    if (remainingRef.current <= 0) advance();
  }, [audio, advance]);

  const handleStart = () => {
    setSettingsOpen(false);
    phaseRef.current = "prepare";
    roundRef.current = 0;
    remainingRef.current = config.prepSeconds;
    setPhase("prepare");
    setCurrentRound(0);
    setRemaining(config.prepSeconds);
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    stopTimer();
    setPhase("idle");
    phaseRef.current = "idle";
  };

  const handleResume = () => {
    phaseRef.current = "work";
    setPhase("work");
    intervalRef.current = setInterval(tick, 1000);
  };

  const handleReset = () => {
    stopTimer();
    phaseRef.current = "idle";
    roundRef.current = 0;
    remainingRef.current = 0;
    setPhase("idle");
    setCurrentRound(0);
    setRemaining(0);
    setSettingsOpen(true);
  };

  const isRunning = phase !== "idle" && phase !== "done";
  const RADIUS = 62;
  const CIRC = 2 * Math.PI * RADIUS;
  const phaseDuration =
    phase === "prepare" ? config.prepSeconds
    : phase === "work" ? config.workSeconds
    : phase === "rest" ? config.restSeconds
    : 1;
  const progress = phase === "done" ? 1 : phase === "idle" ? 0 : 1 - remaining / phaseDuration;

  return (
    <div className="space-y-4">
      {/* Settings */}
      {(phase === "idle" || phase === "done") && (
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-onair-muted mb-2"
          >
            {settingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {t("tabata.settings")}
          </button>
          {settingsOpen && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-onair-muted uppercase">{t("tabata.workDuration")}</label>
                <input type="number" min={5} value={config.workSeconds}
                  onChange={(e) => setConfig({ ...config, workSeconds: +e.target.value })} className="w-full text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-onair-muted uppercase">{t("tabata.restDuration")}</label>
                <input type="number" min={1} value={config.restSeconds}
                  onChange={(e) => setConfig({ ...config, restSeconds: +e.target.value })} className="w-full text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-onair-muted uppercase">{t("tabata.rounds")}</label>
                <input type="number" min={1} value={config.rounds}
                  onChange={(e) => setConfig({ ...config, rounds: +e.target.value })} className="w-full text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-onair-muted uppercase">{t("tabata.prepTime")}</label>
                <input type="number" min={0} value={config.prepSeconds}
                  onChange={(e) => setConfig({ ...config, prepSeconds: +e.target.value })} className="w-full text-sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timer display */}
      <div className="flex flex-col items-center gap-3">
        {isRunning && (
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase", BADGE_CLASSES[phase])}>
            {t(`tabata.phases.${phase}`)}
          </div>
        )}

        <div className="relative w-36 h-36">
          <svg width="144" height="144" className="-rotate-90">
            <circle cx="72" cy="72" r={RADIUS} fill="none" strokeWidth="6" className="stroke-onair-border" />
            <circle
              cx="72" cy="72" r={RADIUS} fill="none" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              className={cn("transition-all duration-1000", RING_COLORS[phase])}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-mono text-3xl font-bold tabular-nums", PHASE_COLORS[phase])}>
              {phase === "idle" ? "--" : phase === "done" ? "✓" : String(remaining).padStart(2, "0")}
            </span>
            {(phase === "work" || phase === "rest") && (
              <span className="text-[10px] text-onair-muted mt-1">
                {t("tabata.round")} {currentRound}{t("tabata.of")}{config.rounds}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {phase === "idle" && remaining === 0 && (
            <button onClick={handleStart} className="btn-primary flex items-center gap-2 px-6">
              <Play className="w-4 h-4" />
              {t("tabata.start")}
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
                <Pause className="w-4 h-4" /> {t("tabata.pause")}
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
          {phase === "idle" && remaining > 0 && (
            <>
              <button onClick={handleResume} className="btn-primary flex items-center gap-2">
                <Play className="w-4 h-4" /> {t("tabata.resume")}
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
          {phase === "done" && (
            <button onClick={handleReset} className="btn-primary flex items-center gap-2 px-6">
              <RotateCcw className="w-4 h-4" /> {t("tabata.reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────
type TimerTab = "rest" | "tabata";

export default function SessionTimers() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TimerTab>("rest");

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-20 right-4 z-30 p-3 rounded-full shadow-lg transition-all",
          open
            ? "bg-onair-surface text-onair-muted border border-onair-border"
            : "bg-onair-cyan text-white hover:bg-onair-cyan/90"
        )}
      >
        {open ? <X className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
      </button>

      {/* Timer panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-36 right-4 left-4 sm:left-auto sm:w-80 z-30 card shadow-2xl border border-onair-border"
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-onair-surface/50 rounded-lg">
              <button
                onClick={() => setTab("rest")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  tab === "rest"
                    ? "bg-onair-cyan/20 text-onair-cyan"
                    : "text-onair-muted hover:text-onair-text"
                )}
              >
                {t("timer.rest")}
              </button>
              <button
                onClick={() => setTab("tabata")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                  tab === "tabata"
                    ? "bg-onair-red/20 text-onair-red"
                    : "text-onair-muted hover:text-onair-text"
                )}
              >
                Tabata
              </button>
            </div>

            {/* Content */}
            {tab === "rest" ? <RestTimer /> : <InlineTabata />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
