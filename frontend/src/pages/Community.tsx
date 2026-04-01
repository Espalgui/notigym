import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Plus, Send, Dumbbell, Trophy, TrendingUp, X, Trash2, ExternalLink, ChefHat, Star, Clock, Flame } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

function RichText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-onair-cyan hover:underline break-all"
          >
            {part.length > 60 ? part.slice(0, 57) + "…" : part}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface RecipeData {
  id: string;
  name_fr: string;
  name_en: string;
  description_fr?: string | null;
  description_en?: string | null;
  meal_type: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prep_time_min?: number | null;
  cook_time_min?: number | null;
  servings?: number;
  creator_name?: string | null;
  tags?: string | null;
}

interface Post {
  id: string;
  post_type: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: { id: string; username: string; first_name: string; last_name: string; avatar_url: string | null } | null;
  liked_by_me: boolean;
  recipe?: RecipeData | null;
}

const typeIcons: Record<string, any> = {
  workout: Dumbbell,
  pr: Trophy,
  progress: TrendingUp,
  general: MessageCircle,
  recipe: ChefHat,
};

export default function Community() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ post_type: "general", content: "" });
  const [commentPost, setCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";

  const fetchPosts = () => {
    api.get("/community/feed").then((r) => setPosts(r.data)).catch(() => {});
  };

  useEffect(fetchPosts, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    try {
      await api.post("/community/posts", newPost);
      toast.success(t("common.success"));
      setShowNewPost(false);
      setNewPost({ post_type: "general", content: "" });
      fetchPosts();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      fetchPosts();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const openComments = async (postId: string) => {
    setCommentPost(postId);
    try {
      const { data } = await api.get(`/community/posts/${postId}/comments`);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t("community.deleteConfirm"))) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success(t("community.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const addRecipeToJournal = async (recipe: RecipeData) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await api.post("/nutrition/entries", {
        date: today,
        meal_type: recipe.meal_type,
        food_name: lang === "fr" ? recipe.name_fr : recipe.name_en,
        calories: recipe.calories,
        protein_g: recipe.protein_g,
        carbs_g: recipe.carbs_g,
        fat_g: recipe.fat_g,
      });
      toast.success(t("community.recipeAdded"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const toggleRecipeFavorite = async (recipeId: string) => {
    try {
      const { data } = await api.post(`/recipes/${recipeId}/favorite`);
      toast.success(data.is_favorite ? t("community.recipeFavorited") : t("community.recipeUnfavorited"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const submitComment = async () => {
    if (!commentPost || !commentText.trim()) return;
    try {
      await api.post(`/community/posts/${commentPost}/comments`, { content: commentText });
      setCommentText("");
      setCommentPost(null);
      fetchPosts();
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t("community.title")}</h1>
        <button onClick={() => setShowNewPost(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> <span>{t("community.newPost")}</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center py-12 text-onair-muted">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{t("common.noData")}</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const TypeIcon = typeIcons[post.post_type] || MessageCircle;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-onair-surface flex items-center justify-center text-sm font-bold text-onair-cyan border border-onair-cyan/30">
                    {post.author?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {post.author ? post.author.username : "Anonyme"}
                    </p>
                    <p className="text-xs text-onair-muted">{formatDateTime(post.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-onair-surface text-xs">
                      <TypeIcon className="w-3 h-3" />
                      {t(`community.postTypes.${post.post_type}` as any)}
                    </div>
                    {user?.id === post.author?.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-lg text-onair-muted hover:text-onair-red hover:bg-onair-red/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap"><RichText text={post.content} /></p>

                {/* Recipe card embed */}
                {post.post_type === "recipe" && post.recipe && (
                  <div className="mb-4 p-4 rounded-xl bg-onair-surface/50 border border-onair-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">
                          {lang === "fr" ? post.recipe.name_fr : post.recipe.name_en}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-onair-cyan/10 text-onair-cyan font-medium">
                            {t(`nutrition.mealTypes.${post.recipe.meal_type}` as any)}
                          </span>
                          {post.recipe.prep_time_min != null && post.recipe.prep_time_min > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-onair-muted">
                              <Clock className="w-3 h-3" /> {post.recipe.prep_time_min}min
                            </span>
                          )}
                          {post.recipe.cook_time_min != null && post.recipe.cook_time_min > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-onair-muted">
                              <Flame className="w-3 h-3" /> {post.recipe.cook_time_min}min
                            </span>
                          )}
                        </div>
                      </div>
                      <ChefHat className="w-8 h-8 text-onair-cyan/30" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold text-onair-amber">{post.recipe.calories}</p>
                        <p className="text-[9px] text-onair-muted">kcal</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-onair-red">{post.recipe.protein_g}g</p>
                        <p className="text-[9px] text-onair-muted">{t("nutrition.protein")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-onair-cyan">{post.recipe.carbs_g}g</p>
                        <p className="text-[9px] text-onair-muted">{t("nutrition.carbs")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-purple-400">{post.recipe.fat_g}g</p>
                        <p className="text-[9px] text-onair-muted">{t("nutrition.fat")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addRecipeToJournal(post.recipe!)}
                        className="btn-primary flex-1 !py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> {t("community.addToJournal")}
                      </button>
                      <button
                        onClick={() => toggleRecipeFavorite(post.recipe!.id)}
                        className="btn-secondary !py-2 px-3"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-onair-border">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.liked_by_me ? "text-onair-red" : "text-onair-muted hover:text-onair-red"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked_by_me ? "fill-current" : ""}`} />
                    {post.likes_count}
                  </button>
                  <button
                    onClick={() => openComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-onair-muted hover:text-onair-cyan transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleCreatePost} className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">{t("community.newPost")}</h2>
              <button type="button" onClick={() => setShowNewPost(false)} className="p-1.5 rounded-xl text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <select value={newPost.post_type} onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })} className="w-full mb-3">
              {["general", "workout", "pr", "progress", "program", "recipe"].map((type) => (
                <option key={type} value={type}>{t(`community.postTypes.${type}` as any)}</option>
              ))}
            </select>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Quoi de neuf ?"
              rows={4}
              required
              className="w-full"
            />
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setShowNewPost(false)} className="btn-secondary flex-1">{t("common.cancel")}</button>
              <button type="submit" className="btn-primary flex-1"><span>Publier</span></button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Comments Modal */}
      {commentPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">{t("community.comment")}</h2>
              <button onClick={() => setCommentPost(null)} className="p-1.5 rounded-xl text-onair-muted hover:text-onair-text hover:bg-onair-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto space-y-3 mb-4">
              {comments.map((c: any) => (
                <div key={c.id} className="p-3 bg-onair-surface rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{c.author?.username || "?"}</span>
                    <span className="text-xs text-onair-muted">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap"><RichText text={c.content} /></p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-onair-muted py-4">{t("common.noData")}</p>}
            </div>
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("community.writeComment")}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
              />
              <button onClick={submitComment} className="btn-primary p-2.5">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
