"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Shield, Heart, MessageCircle, Flame, Send, Plus, X,
  Loader2, TrendingUp, Clock, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createConfession, toggleConfessionLike,
  getConfessions,
} from "@/lib/actions/content";
import { formatTimeAgo, CONFESSION_TAGS } from "@/lib/utils";
import type { Confession } from "@/types";
import { createClient } from "@/lib/supabase/client";

// ─── Compose Modal ────────────────────────────────────────────
function ComposeModal({ onClose, onPosted }: { onClose: () => void; onPosted: (c: Confession) => void }) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("general");
  const [isPending, startTransition] = useTransition();
  const maxLen = 500;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await createConfession(content, tag);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Confession posted anonymously 🕵️");
        onClose();
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Post Anonymously</p>
              <p className="text-white/40 text-xs">Your identity is completely hidden</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLen))}
              placeholder="What's on your mind? Share anything — crushes, rants, secrets, advice... 🤫"
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/25 text-sm leading-relaxed outline-none focus:border-glint-500/50 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${content.length > 450 ? "text-amber-400" : "text-white/30"}`}>
                {content.length}/{maxLen}
              </span>
            </div>
          </div>

          <div>
            <p className="text-white/50 text-xs font-medium mb-2">Tag your confession</p>
            <div className="flex flex-wrap gap-2">
              {CONFESSION_TAGS.map((t) => (
                <button
                  key={t.value} type="button"
                  onClick={() => setTag(t.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    tag === t.value
                      ? `${t.color} border-current`
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  #{t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isPending}
            className="w-full py-3 bg-gradient-to-r from-aurora-pink/80 to-aurora-violet/80 text-white font-semibold rounded-xl hover:from-aurora-pink hover:to-aurora-violet disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Shield className="w-4 h-4" /> Post Anonymously</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Confession Card ──────────────────────────────────────────
function ConfessionCard({ confession, onLike }: { confession: Confession; onLike: (id: string, liked: boolean) => void }) {
  const [liked, setLiked] = useState(confession.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(confession.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const tagInfo = CONFESSION_TAGS.find((t) => t.value === confession.tag);

  async function handleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => newLiked ? c + 1 : c - 1);
    onLike(confession.id, newLiked);
    await toggleConfessionLike(confession.id);
  }

  async function loadComments() {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    setLoadingComments(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("confession_comments")
      .select("*, user:profiles(id, full_name, username, avatar_url)")
      .eq("confession_id", confession.id)
      .order("created_at", { ascending: true })
      .limit(20);
    setComments(data || []);
    setLoadingComments(false);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("college_id").eq("id", user!.id).single();
    await supabase.from("confession_comments").insert({
      confession_id: confession.id,
      user_id: user!.id,
      college_id: profile!.college_id,
      content: commentText.trim(),
    });
    const { data } = await supabase
      .from("confession_comments")
      .select("*, user:profiles(id, full_name, username, avatar_url)")
      .eq("confession_id", confession.id)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setCommentText("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-[#0f1120] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center shadow-inner">
              <Shield className="w-4 h-4 text-white/50" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold">Anonymous</p>
              <p className="text-white/30 text-xs">{formatTimeAgo(confession.created_at)}</p>
            </div>
          </div>
          {tagInfo && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${tagInfo.color}`}>
              #{tagInfo.label}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-white/85 text-sm leading-relaxed mb-4">
          {confession.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              liked
                ? "text-red-400 bg-red-500/10"
                : "text-white/40 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <motion.div animate={{ scale: liked ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.2 }}>
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </motion.div>
            <span>{likeCount}</span>
          </button>
          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{confession.comment_count}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.07] overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {loadingComments ? (
                <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-white/30" /></div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-2">No comments yet</p>
              ) : comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-glint-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-glint-400 font-bold">
                      {c.user?.full_name?.[0] ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2">
                    <span className="text-xs font-semibold text-white/70">{c.user?.full_name}</span>
                    <span className="text-xs text-white/30 ml-2">{formatTimeAgo(c.created_at)}</span>
                    <p className="text-xs text-white/60 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2 px-4 pb-4">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Reply anonymously..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/25 outline-none focus:border-glint-500/50 transition-all"
              />
              <button type="submit" disabled={!commentText.trim()} className="p-2 rounded-xl bg-glint-500/80 text-white hover:bg-glint-500 disabled:opacity-30 transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ConfessionsClient({
  initialConfessions,
  userId,
}: {
  initialConfessions: Confession[];
  userId: string;
}) {
  const [confessions, setConfessions] = useState<Confession[]>(initialConfessions);
  const [showCompose, setShowCompose] = useState(false);
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState<"latest" | "trending">("latest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialConfessions.length === 10);
  const [loading, setLoading] = useState(false);

  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await getConfessions(activeTag, sort, page);
    if (result.data?.length) {
      setConfessions((prev) => {
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...(result.data as Confession[]).filter((c) => !ids.has(c.id))];
      });
      setPage((p) => p + 1);
      setHasMore(result.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [loading, hasMore, page, activeTag, sort]);

  if (inView && !loading && hasMore) loadMore();

  async function handleFilterChange(tag: string, newSort: "latest" | "trending") {
    setActiveTag(tag);
    setSort(newSort);
    setPage(1);
    setHasMore(true);
    const result = await getConfessions(tag, newSort, 0);
    setConfessions((result.data as Confession[]) || []);
    setHasMore(result.hasMore ?? false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Campus Confessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Anonymous. Unfiltered. Relatable.</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-aurora-pink/80 to-aurora-violet/80 text-white font-semibold text-sm rounded-xl shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Confess
        </button>
      </div>

      {/* Sort & Tag filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange(activeTag, "latest")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              sort === "latest"
                ? "bg-glint-500/10 border-glint-400/40 text-glint-600 dark:text-glint-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Latest
          </button>
          <button
            onClick={() => handleFilterChange(activeTag, "trending")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              sort === "trending"
                ? "bg-orange-500/10 border-orange-400/40 text-orange-600 dark:text-orange-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Trending
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => handleFilterChange("all", sort)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              activeTag === "all"
                ? "bg-glint-500/10 border-glint-400/40 text-glint-600 dark:text-glint-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            #all
          </button>
          {CONFESSION_TAGS.map((t) => (
            <button
              key={t.value}
              onClick={() => handleFilterChange(t.value, sort)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                activeTag === t.value ? `${t.color} border-current` : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              #{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {confessions.map((c) => (
            <ConfessionCard
              key={c.id}
              confession={c}
              onLike={(id, liked) => {
                setConfessions((prev) =>
                  prev.map((x) => x.id === id ? { ...x, liked_by_me: liked, like_count: x.like_count + (liked ? 1 : -1) } : x)
                );
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!hasMore && confessions.length > 0 && <p className="text-xs text-slate-400">No more confessions</p>}
        {confessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤫</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No confessions yet</p>
            <button onClick={() => setShowCompose(true)} className="mt-4 px-5 py-2.5 bg-aurora-pink/80 text-white text-sm font-semibold rounded-xl hover:bg-aurora-pink transition-colors">
              Be the first
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onPosted={(c) => setConfessions((prev) => [c, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
