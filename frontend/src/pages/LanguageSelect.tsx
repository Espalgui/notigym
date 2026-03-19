import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Radio } from "lucide-react";

export default function LanguageSelect() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const selectLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("notigym_lang", lang);
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: "var(--purple)" }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: "var(--cyan)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Radio className="w-10 h-10 text-onair-red" />
            <h1 className="text-4xl font-display font-bold gradient-text">NotiGym</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-onair-cyan" />
            <h2 className="text-xl font-semibold">{t("language.title")}</h2>
          </div>
          <p className="text-onair-muted text-sm">{t("language.subtitle")}</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectLanguage("fr")}
            className="w-full card-hover flex items-center gap-4 cursor-pointer group"
          >
            <span className="text-3xl">🇫🇷</span>
            <div className="flex-1 text-left">
              <p className="font-semibold group-hover:text-onair-cyan transition-colors">
                Français
              </p>
              <p className="text-sm text-onair-muted">Langue française</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectLanguage("en")}
            className="w-full card-hover flex items-center gap-4 cursor-pointer group"
          >
            <span className="text-3xl">🇬🇧</span>
            <div className="flex-1 text-left">
              <p className="font-semibold group-hover:text-onair-cyan transition-colors">
                English
              </p>
              <p className="text-sm text-onair-muted">English language</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
