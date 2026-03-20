import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, RotateCcw, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabataConfig {
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  prepSeconds: number;
  exercises: string[];
}

type Phase = "idle" | "prepare" | "work" | "rest" | "done";

const DEFAULT_CONFIG: TabataConfig = {
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  prepSeconds: 10,
  exercises: [],
};

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

function useTabataAudio() {
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
    playTransition: () => beep(880, 0.15),
    playRestStart: () => beep(440, 0.2),
    playCountdown: () => beep(660, 0.1),
    playDone: () => {
      beep(880, 0.15, 0);
      beep(880, 0.15, 0.2);
      beep(1100, 0.3, 0.4);
    },
  };
}

function loadConfig(): TabataConfig {
  try {
    const raw = localStorage.getItem("tabata_config");
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(cfg: TabataConfig) {
  localStorage.setItem("tabata_config", JSON.stringify(cfg));
}

export default function TabataTimer() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<TabataConfig>(loadConfig);
  const [exercisesText, setExercisesText] = useState(
    () => loadConfig().exercises.join("\n")
  );
  const [settingsOpen, setSettingsOpen] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const remainingRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const roundRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audio = useTabataAudio();

  // Wake lock
  useEffect(() => {
    let wakeLock: any = null;
    if (phase !== "idle" && phase !== "done") {
      navigator.wakeLock?.request("screen").then((wl) => { wakeLock = wl; }).catch(() => {});
    }
    return () => { wakeLock?.release().catch(() => {}); };
  }, [phase]);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = () => {
    remainingRef.current -= 1;
    setRemaining(remainingRef.current);

    // Countdown beeps for last 3 seconds
    if (remainingRef.current <= 3 && remainingRef.current > 0 && phaseRef.current !== "prepare") {
      audio.playCountdown();
    }

    if (remainingRef.current <= 0) {
      advance();
    }
  };

  const advance = () => {
    const currentPhase = phaseRef.current;
    const round = roundRef.current;
    const cfg = config;

    if (currentPhase === "prepare") {
      // Start first work phase
      phaseRef.current = "work";
      roundRef.current = 1;
      remainingRef.current = cfg.workSeconds;
      setPhase("work");
      setCurrentRound(1);
      setRemaining(cfg.workSeconds);
      audio.playTransition();
    } else if (currentPhase === "work") {
      if (round >= cfg.rounds) {
        // Done
        stopTimer();
        phaseRef.current = "done";
        setPhase("done");
        audio.playDone();
      } else {
        // Go to rest
        phaseRef.current = "rest";
        remainingRef.current = cfg.restSeconds;
        setPhase("rest");
        setRemaining(cfg.restSeconds);
        audio.playRestStart();
      }
    } else if (currentPhase === "rest") {
      // Next round
      const nextRound = round + 1;
      phaseRef.current = "work";
      roundRef.current = nextRound;
      remainingRef.current = cfg.workSeconds;
      setPhase("work");
      setCurrentRound(nextRound);
      setRemaining(cfg.workSeconds);
      audio.playTransition();
    }
  };

  const handleStart = () => {
    const cfg = config;
    setSettingsOpen(false);
    phaseRef.current = "prepare";
    roundRef.current = 0;
    remainingRef.current = cfg.prepSeconds;
    setPhase("prepare");
    setCurrentRound(0);
    setRemaining(cfg.prepSeconds);

    const total = cfg.prepSeconds + cfg.rounds * (cfg.workSeconds + cfg.restSeconds) - cfg.restSeconds;
    setTotalSeconds(total);

    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    stopTimer();
    setPhase("idle");
    phaseRef.current = "idle";
  };

  const handleResume = () => {
    phaseRef.current = phase === "idle" ? "work" : phase;
    intervalRef.current = setInterval(tick, 1000);
    setPhase(phaseRef.current);
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

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), []);

  const handleConfigChange = (key: keyof TabataConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    saveConfig(updated);
  };

  const handleExercisesChange = (text: string) => {
    setExercisesText(text);
    const exercises = text.split("\n").map((s) => s.trim()).filter(Boolean);
    handleConfigChange("exercises", exercises);
  };

  // SVG ring
  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const phaseDuration =
    phase === "prepare" ? config.prepSeconds
    : phase === "work" ? config.workSeconds
    : phase === "rest" ? config.restSeconds
    : 1;

  const progress = phase === "done" ? 1 : phase === "idle" ? 0 : 1 - remaining / phaseDuration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const currentExercise =
    config.exercises.length > 0 && currentRound > 0
      ? config.exercises[(currentRound - 1) % config.exercises.length]
      : null;

  const isRunning = phase !== "idle" && phase !== "done";
  const isPaused = false; // simplified — pause resets to idle

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">{t("tabata.title")}</h1>

      {/* Settings panel */}
      {(phase === "idle" || phase === "done") && (
        <div className="card">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-2 w-full text-sm font-semibold text-onair-text mb-0"
          >
            {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {t("tabata.settings")}
          </button>

          {settingsOpen && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.workDuration")}</label>
                  <input
                    type="number"
                    min={5}
                    value={config.workSeconds}
                    onChange={(e) => handleConfigChange("workSeconds", +e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.restDuration")}</label>
                  <input
                    type="number"
                    min={1}
                    value={config.restSeconds}
                    onChange={(e) => handleConfigChange("restSeconds", +e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.rounds")}</label>
                  <input
                    type="number"
                    min={1}
                    value={config.rounds}
                    onChange={(e) => handleConfigChange("rounds", +e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-onair-muted mb-1 block">{t("tabata.prepTime")}</label>
                  <input
                    type="number"
                    min={0}
                    value={config.prepSeconds}
                    onChange={(e) => handleConfigChange("prepSeconds", +e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-onair-muted mb-1 block">{t("tabata.exercises")}</label>
                <textarea
                  value={exercisesText}
                  onChange={(e) => handleExercisesChange(e.target.value)}
                  rows={4}
                  className="w-full text-sm"
                  placeholder="Burpees&#10;Squats&#10;Mountain climbers"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timer display */}
      <div className="card flex flex-col items-center gap-6 py-8">
        {/* Phase badge */}
        <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase", BADGE_CLASSES[phase])}>
          {t(`tabata.phases.${phase === "idle" ? "prepare" : phase}`)}
        </div>

        {/* SVG Ring */}
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle
              cx="100" cy="100" r={RADIUS}
              fill="none"
              strokeWidth="8"
              className="stroke-onair-border"
            />
            <circle
              cx="100" cy="100" r={RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className={cn("transition-all duration-1000", RING_COLORS[phase])}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-mono text-7xl font-bold tabular-nums leading-none", PHASE_COLORS[phase])}>
              {phase === "idle" ? "--" : phase === "done" ? "✓" : String(remaining).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Round indicator */}
        {(phase === "work" || phase === "rest") && (
          <p className="text-sm font-medium text-onair-muted">
            {t("tabata.round")} {currentRound} {t("tabata.of")} {config.rounds}
          </p>
        )}

        {/* Current exercise */}
        {currentExercise && (phase === "work" || phase === "rest") && (
          <p className="text-base font-semibold text-onair-text">{currentExercise}</p>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {phase === "idle" && (
            <button onClick={handleStart} className="btn-primary flex items-center gap-2 px-8">
              <Play className="w-5 h-5" />
              {t("tabata.start")}
            </button>
          )}
          {isRunning && (
            <>
              <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
                <Pause className="w-5 h-5" />
                {t("tabata.pause")}
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                {t("tabata.reset")}
              </button>
            </>
          )}
          {phase === "done" && (
            <button onClick={handleReset} className="btn-primary flex items-center gap-2 px-8">
              <RotateCcw className="w-5 h-5" />
              {t("tabata.reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
