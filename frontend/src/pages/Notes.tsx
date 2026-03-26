import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, ChevronLeft, ChevronRight, Save, Trash2, Calendar, Plus } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Note {
  id: string;
  date: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Notes() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Note[]>([]);
  const [tab, setTab] = useState<"edit" | "history">("edit");
  const [hasChanges, setHasChanges] = useState(false);

  const fetchNote = useCallback(async (date: string) => {
    try {
      const { data } = await api.get(`/notes/${date}`);
      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setNoteId(data.id);
      } else {
        setTitle("");
        setContent("");
        setNoteId(null);
      }
      setHasChanges(false);
    } catch {
      setTitle("");
      setContent("");
      setNoteId(null);
      setHasChanges(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/notes?limit=30");
      setHistory(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNote(selectedDate); }, [selectedDate, fetchNote]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) setSelectedDate(toLocalDateString(d));
  };

  const isToday = selectedDate === toLocalDateString(new Date());

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) return;
    setSaving(true);
    try {
      await api.post("/notes", {
        date: selectedDate,
        title: title.trim() || null,
        content: content.trim(),
      });
      toast.success(lang === "fr" ? "Note sauvegardée" : "Note saved");
      setHasChanges(false);
      await fetchNote(selectedDate);
      await fetchHistory();
    } catch {
      toast.error("Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setTitle("");
      setContent("");
      setNoteId(null);
      setHasChanges(false);
      toast.success(lang === "fr" ? "Note supprimée" : "Note deleted");
      await fetchHistory();
    } catch {
      toast.error("Error");
    }
  };

  const formatDisplayDate = (date: string) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", day: "numeric", month: "long",
    }).format(new Date(date + "T12:00:00"));
  };

  const formatShortDate = (date: string) => {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric", month: "short",
    }).format(new Date(date + "T12:00:00"));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <StickyNote className="w-6 h-6 text-amber-400" />
            </div>
            {lang === "fr" ? "Bloc-notes" : "Notes"}
          </h1>
          <p className="text-sm text-onair-muted mt-1">
            {lang === "fr" ? "Un journal quotidien pour tes notes" : "A daily journal for your notes"}
          </p>
        </div>

        <div className="flex gap-2">
          {(["edit", "history"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === k
                  ? "bg-amber-500/15 text-amber-400 shadow-sm"
                  : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
              }`}
            >
              {k === "edit"
                ? (lang === "fr" ? "Éditer" : "Edit")
                : (lang === "fr" ? "Historique" : "History")}
            </button>
          ))}
        </div>
      </div>

      {tab === "edit" && (
        <div className="space-y-4">
          {/* Date picker */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-onair-surface transition-colors">
              <ChevronLeft className="w-5 h-5 text-onair-muted" />
            </button>
            <div className="text-center">
              <p className="font-semibold capitalize">{formatDisplayDate(selectedDate)}</p>
              {isToday && <span className="text-xs text-amber-400 font-medium">{lang === "fr" ? "Aujourd'hui" : "Today"}</span>}
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className="p-2 rounded-lg hover:bg-onair-surface transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5 text-onair-muted" />
            </button>
          </div>

          {/* Note editor */}
          <div className="card space-y-3">
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
              placeholder={lang === "fr" ? "Titre (optionnel)" : "Title (optional)"}
              className="w-full text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 placeholder:text-onair-muted/30"
            />
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setHasChanges(true); }}
              placeholder={lang === "fr" ? "Écris ta note du jour..." : "Write your daily note..."}
              rows={12}
              className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-onair-muted/30 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || (!content.trim() && !title.trim())}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${hasChanges ? "ring-2 ring-amber-400/50" : ""}`}
            >
              <Save className="w-4 h-4" />
              {saving ? "..." : (lang === "fr" ? "Sauvegarder" : "Save")}
            </button>
            {noteId && (
              <button onClick={handleDelete} className="btn-secondary text-onair-red flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <StickyNote className="w-12 h-12 mx-auto text-onair-muted/30 mb-4" />
              <p className="text-onair-muted">{lang === "fr" ? "Aucune note" : "No notes yet"}</p>
            </div>
          ) : (
            history.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4 cursor-pointer hover:ring-1 hover:ring-onair-border transition-all"
                onClick={() => { setSelectedDate(note.date); setTab("edit"); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-onair-muted">{formatDisplayDate(note.date)}</span>
                    </div>
                    {note.title && (
                      <h3 className="font-semibold text-sm mb-1">{note.title}</h3>
                    )}
                    <p className="text-sm text-onair-muted line-clamp-3 whitespace-pre-line">{note.content}</p>
                  </div>
                  <div className="text-center min-w-[45px]">
                    <p className="text-lg font-bold text-onair-text">{new Date(note.date + "T12:00:00").getDate()}</p>
                    <p className="text-[10px] text-onair-muted uppercase">{formatShortDate(note.date).split(" ").pop()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
