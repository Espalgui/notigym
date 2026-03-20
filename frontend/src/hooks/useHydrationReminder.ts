import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "hydration_reminder_interval";
const DEFAULT_INTERVAL_MIN = 45;

export function useHydrationReminder() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        toast("💧 Pense à t'hydrater !", { icon: "🥤", duration: 5000 });
      }
    }, minutes * 60 * 1000);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const minutes = stored ? parseInt(stored, 10) : DEFAULT_INTERVAL_MIN;
    startTimer(minutes);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const setInterval_ = (minutes: number) => {
    localStorage.setItem(STORAGE_KEY, String(minutes));
    startTimer(minutes);
  };

  return { setReminderInterval: setInterval_ };
}
