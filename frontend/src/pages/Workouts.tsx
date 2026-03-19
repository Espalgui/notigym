import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Dumbbell, Calendar, Trophy, ChevronRight, Play } from "lucide-react";
import api from "@/lib/api";

interface Program {
  id: string;
  name: string;
  program_type: string;
  is_active: boolean;
  days: { id: string; name: string; exercises: any[] }[];
  created_at: string;
}

export default function Workouts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tab, setTab] = useState<"programs" | "history" | "records">("programs");

  useEffect(() => {
    api.get("/workouts/programs").then((r) => setPrograms(r.data)).catch(() => {});
  }, []);

  const typeColors: Record<string, string> = {
    push_pull_legs: "text-onair-red",
    upper_lower: "text-onair-cyan",
    full_body: "text-onair-green",
    bro_split: "text-onair-purple",
    custom: "text-onair-amber",
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
            {key === "history" && <Calendar className="w-4 h-4 inline mr-2" />}
            {key === "records" && <Trophy className="w-4 h-4 inline mr-2" />}
            {t(`workouts.${key === "programs" ? "myPrograms" : key}`)}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div className="space-y-4">
          {programs.length === 0 ? (
            <div className="card text-center py-12">
              <Dumbbell className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
              <p className="text-onair-muted mb-4">{t("common.noData")}</p>
              <button
                onClick={() => navigate("/workouts/new")}
                className="btn-primary"
              >
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
                      <span>{program.days.length} jours</span>
                      <span>
                        {program.days.reduce((acc, d) => acc + d.exercises.length, 0)} exercices
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/workouts/session");
                      }}
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
