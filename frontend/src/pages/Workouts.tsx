import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Dumbbell, Calendar, Trophy, ChevronRight, Play, Sparkles, Download, Clock, Target } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Program {
  id: string;
  name: string;
  program_type: string;
  is_active: boolean;
  days: { id: string; name: string; exercises: any[] }[];
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  program_type: string;
  days_per_week: number;
  days_count: number;
  exercises_count: number;
  goals: string[];
  training_types: string[];
  genders: string[];
}

export default function Workouts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [tab, setTab] = useState<"programs" | "history" | "records">("programs");

  useEffect(() => {
    api.get("/workouts/programs").then((r) => setPrograms(r.data)).catch(() => {});
    api.get("/workouts/templates").then((r) => setTemplates(r.data)).catch(() => {});
  }, []);

  const typeColors: Record<string, string> = {
    push_pull_legs: "text-onair-red",
    upper_lower:    "text-onair-cyan",
    full_body:      "text-onair-green",
    bro_split:      "text-onair-purple",
    custom:         "text-onair-amber",
  };

  const typeBg: Record<string, string> = {
    push_pull_legs: "bg-onair-red/10",
    upper_lower:    "bg-onair-cyan/10",
    full_body:      "bg-onair-green/10",
    bro_split:      "bg-onair-purple/10",
    custom:         "bg-onair-amber/10",
  };

  const handleImport = async (templateId: string) => {
    setImporting(templateId);
    try {
      const { data } = await api.post(`/workouts/templates/${templateId}/import`);
      setPrograms((prev) => [data, ...prev]);
      toast.success(t("workouts.templates.imported"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t("workouts.title")}</h1>
        <button
          onClick={() => navigate("/workouts/new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t("workouts.createProgram")}</span>
        </button>
      </div>

      <div className="flex gap-2 border-b border-onair-border pb-1">
        {(["programs", "history", "records"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === key
                ? "text-onair-cyan border-b-2 border-onair-cyan"
                : "text-onair-muted hover:text-onair-text"
            }`}
          >
            {key === "programs" && <Dumbbell className="w-4 h-4 inline mr-2" />}
            {key === "history"  && <Calendar className="w-4 h-4 inline mr-2" />}
            {key === "records"  && <Trophy className="w-4 h-4 inline mr-2" />}
            {t(`workouts.${key === "programs" ? "myPrograms" : key}`)}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div className="space-y-6">

          {/* Programmes recommandés */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-onair-amber" />
                <h2 className="text-sm font-semibold text-onair-muted uppercase tracking-wider">
                  {t("workouts.templates.title")}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tpl, i) => (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBg[tpl.program_type] || "bg-onair-surface"} ${typeColors[tpl.program_type] || "text-onair-muted"}`}>
                            {t(`workouts.types.${tpl.program_type}` as any)}
                          </span>
                          {tpl.genders.includes("female") && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400">
                              {t("workouts.templates.female")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm leading-tight">{tpl.name}</h3>
                        <p className="text-xs text-onair-muted mt-1 line-clamp-2">{tpl.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-onair-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {tpl.days_per_week}j/sem
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" />
                        {tpl.exercises_count} {t("workouts.exercises")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {tpl.days_count} {t("workouts.days")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleImport(tpl.id)}
                      disabled={importing === tpl.id}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold bg-onair-cyan/10 text-onair-cyan hover:bg-onair-cyan/20 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {importing === tpl.id ? t("common.loading") : t("workouts.templates.import")}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mes programmes */}
          <div className="space-y-3">
            {templates.length > 0 && (
              <h2 className="text-sm font-semibold text-onair-muted uppercase tracking-wider">
                {t("workouts.myPrograms")}
              </h2>
            )}
            {programs.length === 0 ? (
              <div className="card text-center py-12">
                <Dumbbell className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
                <p className="text-onair-muted mb-4">{t("common.noData")}</p>
                <button onClick={() => navigate("/workouts/new")} className="btn-primary">
                  <span>{t("workouts.createProgram")}</span>
                </button>
              </div>
            ) : (
              programs.map((program, i) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(`/workouts/program/${program.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{program.name}</h3>
                        {program.is_active && (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-onair-green/10 text-onair-green rounded-full font-bold">
                            Actif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-onair-muted">
                        <span className={typeColors[program.program_type] || "text-onair-muted"}>
                          {t(`workouts.types.${program.program_type}` as any)}
                        </span>
                        <span>{program.days.length} {t("workouts.days")}</span>
                        <span>
                          {program.days.reduce((acc, d) => acc + d.exercises.length, 0)} {t("workouts.exercises")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/workouts/session"); }}
                        className="p-2 rounded-lg bg-onair-red/10 text-onair-red hover:bg-onair-red/20 transition-colors"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-onair-muted" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
          <p className="text-onair-muted">{t("common.noData")}</p>
        </div>
      )}

      {tab === "records" && (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
          <p className="text-onair-muted">{t("common.noData")}</p>
        </div>
      )}
    </div>
  );
}
