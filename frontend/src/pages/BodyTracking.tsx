import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Scale,
  Ruler,
  Camera,
  Plus,
  TrendingUp,
  TrendingDown,
  Upload,
  Trash2,
  ArrowLeftRight,
  Image,
  X,
  GripVertical,
} from "lucide-react";
import api from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";
import toast from "react-hot-toast";
import { formatDate, formatWeight } from "@/lib/utils";

interface Measurement {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  notes: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
  category: "front" | "side" | "back";
  taken_at: string;
}

type Category = "all" | "front" | "side" | "back";

/* ─── Before / After Comparison Slider ─── */
function CompareSlider({
  beforeUrl,
  afterUrl,
  beforeDate,
  afterDate,
  t,
}: {
  beforeUrl: string;
  afterUrl: string;
  beforeDate: string;
  afterDate: string;
  t: (k: string) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const locale = "fr-FR";
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(d));

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] max-h-[600px] rounded-2xl overflow-hidden select-none cursor-col-resize
                   ring-1 ring-onair-border"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* After (full background) */}
        <img
          src={afterUrl}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100%" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-xl
                          flex items-center justify-center">
            <GripVertical className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold
                        px-3 py-1.5 rounded-full z-10">
          {t("body.before")}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold
                        px-3 py-1.5 rounded-full z-10">
          {t("body.after")}
        </div>
      </div>

      <div className="flex justify-between text-xs text-onair-muted px-1">
        <span>{t("body.takenOn")} {fmtDate(beforeDate)}</span>
        <span>{t("body.takenOn")} {fmtDate(afterDate)}</span>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function BodyTracking() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<"weight" | "measurements" | "photos">("weight");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    weight_kg: "",
    body_fat_pct: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    left_arm_cm: "",
    right_arm_cm: "",
    notes: "",
  });

  const [uploadCategory, setUploadCategory] = useState<"front" | "side" | "back">("front");
  const [uploading, setUploading] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<Category>("all");
  const [photoView, setPhotoView] = useState<"gallery" | "compare">("gallery");
  const [beforePhoto, setBeforePhoto] = useState<Photo | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<Photo | null>(null);
  const [selectingFor, setSelectingFor] = useState<"before" | "after" | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  const fetchData = () => {
    api.get("/body/measurements?limit=100").then((r) => setMeasurements(r.data)).catch(() => {});
  };

  const fetchPhotos = useCallback(() => {
    api.get("/body/photos?limit=200").then((r) => setPhotos(r.data)).catch(() => {});
  }, []);

  useEffect(fetchData, []);
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { measured_at: new Date().toISOString() };
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") payload[k] = k === "notes" ? v : parseFloat(v);
      });
      await api.post("/body/measurements", payload);
      toast.success(t("common.success"));
      setShowForm(false);
      setForm({ weight_kg: "", body_fat_pct: "", chest_cm: "", waist_cm: "", hips_cm: "", left_arm_cm: "", right_arm_cm: "", notes: "" });
      fetchData();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("JPEG, PNG or WebP only");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/body/photos?category=${uploadCategory}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("body.uploadSuccess"));
      fetchPhotos();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await api.delete(`/body/photos/${id}`);
      toast.success(t("body.photoDeleted"));
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (beforePhoto?.id === id) setBeforePhoto(null);
      if (afterPhoto?.id === id) setAfterPhoto(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const filteredPhotos = photoFilter === "all"
    ? photos
    : photos.filter((p) => p.category === photoFilter);

  const fmtDateShort = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

  const weightData = [...measurements]
    .reverse()
    .filter((m) => m.weight_kg)
    .map((m) => ({ date: formatDate(m.measured_at), weight: m.weight_kg }));

  const latest = measurements[0];
  const previous = measurements[1];
  const weightDiff =
    latest?.weight_kg && previous?.weight_kg
      ? +(latest.weight_kg - previous.weight_kg).toFixed(1)
      : null;

  const handlePhotoClick = (photo: Photo) => {
    if (selectingFor) {
      if (selectingFor === "before") setBeforePhoto(photo);
      else setAfterPhoto(photo);
      setSelectingFor(null);
    } else {
      setLightboxPhoto(photo);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t("body.title")}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> <span>{t("body.addMeasurement")}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-onair-border pb-1">
        {(["weight", "measurements", "photos"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === key
                ? "text-onair-cyan border-b-2 border-onair-cyan"
                : "text-onair-muted hover:text-onair-text"
            }`}
          >
            {key === "weight" && <Scale className="w-4 h-4 inline mr-2" />}
            {key === "measurements" && <Ruler className="w-4 h-4 inline mr-2" />}
            {key === "photos" && <Camera className="w-4 h-4 inline mr-2" />}
            {t(`body.${key === "weight" ? "weight" : key}`)}
          </button>
        ))}
      </div>

      {/* ─── Weight Tab ─── */}
      {tab === "weight" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card">
              <p className="stat-label">{t("dashboard.currentWeight")}</p>
              <p className="stat-value text-onair-cyan mt-1">
                {latest?.weight_kg ? `${formatWeight(latest.weight_kg)} kg` : "—"}
              </p>
            </div>
            <div className="card">
              <p className="stat-label">{t("body.weightChange")}</p>
              <div className="flex items-center gap-2 mt-1">
                {weightDiff !== null ? (
                  <>
                    {weightDiff > 0 ? (
                      <TrendingUp className="w-5 h-5 text-onair-amber" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-onair-green" />
                    )}
                    <p className={`stat-value ${weightDiff > 0 ? "text-onair-amber" : "text-onair-green"}`}>
                      {weightDiff > 0 ? "+" : ""}{weightDiff} kg
                    </p>
                  </>
                ) : (
                  <p className="stat-value text-onair-muted">—</p>
                )}
              </div>
            </div>
            <div className="card">
              <p className="stat-label">{t("body.bodyFat")}</p>
              <p className="stat-value text-onair-purple mt-1">
                {latest?.body_fat_pct ? `${latest.body_fat_pct}%` : "—"}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display font-semibold mb-4">{t("dashboard.weightProgress")}</h2>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? "#00f0ff" : "#0a84ff"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isDark ? "#00f0ff" : "#0a84ff"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2a2a3e" : "#e5e5ea"} />
                  <XAxis dataKey="date" stroke={isDark ? "#8e8e93" : "#86868b"} fontSize={11} />
                  <YAxis stroke={isDark ? "#8e8e93" : "#86868b"} fontSize={11} domain={["auto", "auto"]} unit="kg" />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? "#1a1a2e" : "#fff",
                      border: `1px solid ${isDark ? "#2a2a3e" : "#e5e5ea"}`,
                      borderRadius: "12px",
                      color: isDark ? "#e8e8ed" : "#1d1d1f",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke={isDark ? "#00f0ff" : "#0a84ff"}
                    strokeWidth={2}
                    fill="url(#wg)"
                    dot={{ fill: isDark ? "#00f0ff" : "#0a84ff", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-onair-muted">
                {t("common.noData")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Measurements Tab ─── */}
      {tab === "measurements" && (
        <div className="space-y-3">
          {measurements.length === 0 ? (
            <div className="card text-center py-12 text-onair-muted">{t("common.noData")}</div>
          ) : (
            measurements.map((m) => (
              <div key={m.id} className="card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{formatDate(m.measured_at)}</span>
                  {m.weight_kg && <span className="text-onair-cyan font-mono">{m.weight_kg} kg</span>}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs text-onair-muted">
                  {m.body_fat_pct && <span>BF: {m.body_fat_pct}%</span>}
                  {m.chest_cm && <span>{t("body.chest")}: {m.chest_cm}</span>}
                  {m.waist_cm && <span>{t("body.waist")}: {m.waist_cm}</span>}
                  {m.hips_cm && <span>{t("body.hips")}: {m.hips_cm}</span>}
                  {m.left_arm_cm && <span>{t("body.arms")}: {m.left_arm_cm}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Photos Tab ─── */}
      {tab === "photos" && (
        <div className="space-y-5">
          {/* Upload Area */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-onair-text flex items-center gap-2">
                <Upload className="w-5 h-5 text-onair-cyan" />
                {t("body.uploadPhoto")}
              </h2>
              <div className="flex gap-1.5">
                {(["front", "side", "back"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setUploadCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      uploadCategory === cat
                        ? "bg-onair-cyan/15 text-onair-cyan"
                        : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
                    }`}
                  >
                    {t(`body.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-onair-border rounded-xl p-8 text-center
                         cursor-pointer hover:border-onair-cyan/50 hover:bg-onair-cyan/5
                         transition-all duration-200"
            >
              <Camera className="w-10 h-10 mx-auto text-onair-muted/40 mb-3" />
              <p className="text-sm text-onair-muted font-medium">{t("body.dragOrClick")}</p>
              <p className="text-xs text-onair-muted/60 mt-1">
                {t("body.maxSize", { size: "10" })}
              </p>
              {uploading && (
                <div className="mt-3">
                  <div className="live-dot mx-auto" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>

          {/* View Toggle + Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setPhotoView("gallery")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  photoView === "gallery"
                    ? "bg-onair-cyan/15 text-onair-cyan shadow-sm"
                    : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
                }`}
              >
                <Image className="w-4 h-4" />
                {t("body.gallery")}
              </button>
              <button
                onClick={() => setPhotoView("compare")}
                disabled={photos.length < 2}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                           disabled:opacity-40 disabled:cursor-not-allowed ${
                  photoView === "compare"
                    ? "bg-onair-purple/15 text-onair-purple shadow-sm"
                    : "text-onair-muted hover:text-onair-text hover:bg-onair-surface"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {t("body.beforeAfter")}
              </button>
            </div>

            <div className="flex gap-1.5">
              {(["all", "front", "side", "back"] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    photoFilter === cat
                      ? "bg-onair-surface text-onair-text ring-1 ring-onair-border"
                      : "text-onair-muted hover:text-onair-text"
                  }`}
                >
                  {cat === "all" ? t("body.allCategories") : t(`body.${cat}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery View */}
          {photoView === "gallery" && (
            <AnimatePresence mode="wait">
              {filteredPhotos.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-12 text-center"
                >
                  <Camera className="w-12 h-12 text-onair-border mx-auto mb-4" />
                  <p className="text-onair-muted font-medium">{t("body.noPhotos")}</p>
                  <p className="text-sm text-onair-muted mt-1">{t("body.noPhotosHint")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                >
                  {filteredPhotos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative rounded-xl overflow-hidden aspect-[3/4]
                                  ring-1 ring-onair-border cursor-pointer
                                  hover:ring-2 hover:ring-onair-cyan/50 transition-all ${
                        selectingFor ? "hover:ring-onair-purple" : ""
                      }`}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.category}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                                      opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Category badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px]
                                      font-bold uppercase px-2 py-1 rounded-md">
                        {t(`body.${photo.category}`)}
                      </div>
                      {/* Date + delete */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5
                                      opacity-0 group-hover:opacity-100 transition-opacity
                                      flex items-end justify-between">
                        <span className="text-white text-xs font-medium">
                          {fmtDateShort(photo.taken_at)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Selection indicator */}
                      {(beforePhoto?.id === photo.id || afterPhoto?.id === photo.id) && (
                        <div className="absolute inset-0 ring-4 ring-inset ring-onair-purple rounded-xl" />
                      )}
                      {beforePhoto?.id === photo.id && (
                        <div className="absolute top-2 right-2 bg-onair-purple text-white text-[10px]
                                        font-bold px-2 py-1 rounded-md">
                          {t("body.before")}
                        </div>
                      )}
                      {afterPhoto?.id === photo.id && (
                        <div className="absolute top-2 right-2 bg-onair-cyan text-white text-[10px]
                                        font-bold px-2 py-1 rounded-md">
                          {t("body.after")}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Compare View */}
          {photoView === "compare" && (
            <div className="space-y-4">
              {/* Before / After selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before selector */}
                <div
                  className={`card p-4 text-center cursor-pointer transition-all ${
                    selectingFor === "before" ? "ring-2 ring-onair-purple" : ""
                  }`}
                  onClick={() => setSelectingFor(selectingFor === "before" ? null : "before")}
                >
                  {beforePhoto ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={beforePhoto.photo_url}
                        alt="Before"
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold uppercase text-onair-purple">{t("body.before")}</p>
                        <p className="text-sm text-onair-text">{t(`body.${beforePhoto.category}`)}</p>
                        <p className="text-xs text-onair-muted">{fmtDateShort(beforePhoto.taken_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBeforePhoto(null);
                        }}
                        className="text-onair-muted hover:text-onair-text"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 rounded-xl bg-onair-purple/10 flex items-center justify-center mx-auto mb-2">
                        <Image className="w-6 h-6 text-onair-purple" />
                      </div>
                      <p className="text-sm text-onair-muted">{t("body.selectBefore")}</p>
                    </div>
                  )}
                </div>

                {/* After selector */}
                <div
                  className={`card p-4 text-center cursor-pointer transition-all ${
                    selectingFor === "after" ? "ring-2 ring-onair-cyan" : ""
                  }`}
                  onClick={() => setSelectingFor(selectingFor === "after" ? null : "after")}
                >
                  {afterPhoto ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={afterPhoto.photo_url}
                        alt="After"
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold uppercase text-onair-cyan">{t("body.after")}</p>
                        <p className="text-sm text-onair-text">{t(`body.${afterPhoto.category}`)}</p>
                        <p className="text-xs text-onair-muted">{fmtDateShort(afterPhoto.taken_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAfterPhoto(null);
                        }}
                        className="text-onair-muted hover:text-onair-text"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 rounded-xl bg-onair-cyan/10 flex items-center justify-center mx-auto mb-2">
                        <Image className="w-6 h-6 text-onair-cyan" />
                      </div>
                      <p className="text-sm text-onair-muted">{t("body.selectAfter")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection hint */}
              {selectingFor && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-onair-purple font-medium"
                >
                  {selectingFor === "before" ? t("body.selectBefore") : t("body.selectAfter")}
                </motion.p>
              )}

              {/* Photo grid for selection */}
              {selectingFor && filteredPhotos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2"
                >
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative rounded-lg overflow-hidden aspect-[3/4] cursor-pointer
                                  ring-1 ring-onair-border hover:ring-2 transition-all ${
                        beforePhoto?.id === photo.id
                          ? "ring-2 ring-onair-purple"
                          : afterPhoto?.id === photo.id
                          ? "ring-2 ring-onair-cyan"
                          : "hover:ring-onair-purple/50"
                      }`}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <img
                        src={photo.photo_url}
                        alt={photo.category}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-[10px] text-white font-medium">{fmtDateShort(photo.taken_at)}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Comparison slider */}
              {beforePhoto && afterPhoto && !selectingFor && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CompareSlider
                    beforeUrl={beforePhoto.photo_url}
                    afterUrl={afterPhoto.photo_url}
                    beforeDate={beforePhoto.taken_at}
                    afterDate={afterPhoto.taken_at}
                    t={t}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add measurement modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSubmit}
            className="card w-full max-w-md max-h-[80vh] overflow-auto"
          >
            <h2 className="text-lg font-display font-bold mb-4">{t("body.addMeasurement")}</h2>
            <div className="space-y-3">
              {[
                ["weight_kg", t("body.weight")],
                ["body_fat_pct", t("body.bodyFat")],
                ["chest_cm", t("body.chest")],
                ["waist_cm", t("body.waist")],
                ["hips_cm", t("body.hips")],
                ["left_arm_cm", t("body.arms")],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm text-onair-muted mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-onair-muted mb-1">{t("workouts.notes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                {t("common.cancel")}
              </button>
              <button type="submit" className="btn-primary flex-1">
                <span>{t("common.save")}</span>
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20
                         transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxPhoto.photo_url}
              alt={lightboxPhoto.category}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm
                            text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-3">
              <span className="uppercase text-xs font-bold">{t(`body.${lightboxPhoto.category}`)}</span>
              <span className="w-px h-4 bg-white/30" />
              <span>{fmtDateShort(lightboxPhoto.taken_at)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
