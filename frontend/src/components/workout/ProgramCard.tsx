import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Play, ChevronRight } from "lucide-react";

interface Program {
  id: string;
  name: string;
  program_type: string;
  image_url?: string;
  is_active: boolean;
  is_favorite: boolean;
  days: { id: string; name: string; exercises: any[] }[];
  created_at: string;
}

interface ProgramCardProps {
  program: Program;
  index: number;
  typeColors: Record<string, string>;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onStartSession: (program: Program) => void;
  showChevron?: boolean;
}

export default function ProgramCard({
  program,
  index,
  typeColors,
  onToggleFavorite,
  onStartSession,
  showChevron = true,
}: ProgramCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      key={program.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover cursor-pointer"
      onClick={() => navigate(`/workouts/program/${program.id}`)}
    >
      <div className="flex items-center justify-between">
        {program.image_url && (
          <img src={program.image_url} alt="" className="w-16 h-16 rounded-lg object-cover mr-3 flex-shrink-0" />
        )}
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
            onClick={(e) => onToggleFavorite(e, program.id)}
            className={`p-2 rounded-lg transition-colors ${
              program.is_favorite
                ? "bg-onair-amber/20 text-onair-amber"
                : "text-onair-muted hover:text-onair-amber hover:bg-onair-amber/10"
            }`}
            title={program.is_favorite ? t("workouts.removeFavorite") : t("workouts.addFavorite")}
          >
            <Star className={`w-4 h-4 ${program.is_favorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onStartSession(program); }}
            className="p-2 rounded-lg bg-onair-red/10 text-onair-red hover:bg-onair-red/20 transition-colors"
          >
            <Play className="w-5 h-5" />
          </button>
          {showChevron && <ChevronRight className="w-5 h-5 text-onair-muted" />}
        </div>
      </div>
    </motion.div>
  );
}
