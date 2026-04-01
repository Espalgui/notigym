import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Dumbbell, Apple, Activity, Users, Settings, Droplets,
  ChevronRight, ChevronLeft, X, Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const steps = [
  {
    icon: Sparkles,
    color: "text-onair-amber",
    bg: "from-onair-amber/20 to-onair-amber/5",
    titleKey: "onboarding.step1.title",
    descKey: "onboarding.step1.desc",
  },
  {
    icon: LayoutDashboard,
    color: "text-onair-cyan",
    bg: "from-onair-cyan/20 to-onair-cyan/5",
    titleKey: "onboarding.step2.title",
    descKey: "onboarding.step2.desc",
  },
  {
    icon: Dumbbell,
    color: "text-onair-red",
    bg: "from-onair-red/20 to-onair-red/5",
    titleKey: "onboarding.step3.title",
    descKey: "onboarding.step3.desc",
  },
  {
    icon: Apple,
    color: "text-onair-green",
    bg: "from-onair-green/20 to-onair-green/5",
    titleKey: "onboarding.step4.title",
    descKey: "onboarding.step4.desc",
  },
  {
    icon: Activity,
    color: "text-onair-purple",
    bg: "from-onair-purple/20 to-onair-purple/5",
    titleKey: "onboarding.step5.title",
    descKey: "onboarding.step5.desc",
  },
  {
    icon: Users,
    color: "text-onair-cyan",
    bg: "from-onair-cyan/20 to-onair-cyan/5",
    titleKey: "onboarding.step6.title",
    descKey: "onboarding.step6.desc",
  },
  {
    icon: Settings,
    color: "text-onair-muted",
    bg: "from-onair-surface to-transparent",
    titleKey: "onboarding.step7.title",
    descKey: "onboarding.step7.desc",
  },
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { updateUser } = useAuthStore();
  const [current, setCurrent] = useState(0);

  const finish = async () => {
    try {
      await updateUser({ has_completed_onboarding: true } as any);
    } catch {}
    onComplete();
  };

  const step = steps[current];
  const Icon = step.icon;
  const isLast = current === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card w-full max-w-md text-center space-y-6 relative"
      >
        {/* Skip */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br ${step.bg} flex items-center justify-center`}>
          <Icon className={`w-10 h-10 ${step.color}`} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-xl font-display font-bold text-onair-text">
            {t(step.titleKey)}
          </h2>
          <p className="text-sm text-onair-muted leading-relaxed">
            {t(step.descKey)}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-onair-cyan" : "w-1.5 bg-onair-surface"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={() => setCurrent((c) => c - 1)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("onboarding.prev")}
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setCurrent((c) => c + 1)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <span>{isLast ? t("onboarding.finish") : t("onboarding.next")}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
