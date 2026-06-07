"use client";

import { useState, useRef, useTransition, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle, Trash2, Image as ImageIcon, Send,
  Pin, Megaphone, TrendingUp, Loader2, X, MoreHorizontal,
  Smile, Search, Calendar, Users, Hash, ChevronRight, Flame,
} from "lucide-react";
import toast from "react-hot-toast";
import { createPost, deletePost, toggleLike, addComment, getPosts } from "@/lib/actions/posts";
import { formatTimeAgo, getAvatarUrl } from "@/lib/utils";
import type { Post, Profile, Comment } from "@/types";
import { createClient } from "@/lib/supabase/client";

// Discord-style emoji reactions
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "💯"];

interface Props {
  profile: Profile & { college?: { name: string } };
  initialPosts: Post[];
}

// ─── Emoji Picker ─────────────────────────────────────────────
function EmojiPicker({ onSelect }: { onSelect: (e: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      className="absolute bottom-10 left-0 z-50 flex gap-1 p-2 bg-[#1e1f2e] border border-white/10 rounded-2xl shadow-2xl"
    >
      {REACTIONS.map((e) => (
        <button
          key={e}
          onClick={() => onSelect(e)}
          className="text-xl hover:scale-125 transition-transform w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10"
        >
          {e}
        </button>
      ))}
    </motion.div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────
function PostCard({
  post, currentUserId, isAdmin, onDelete,
}: {
  post: Post; currentUserId: string; isAdmin: boolean; onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const canDelete = post.user_id === currentUserId || isAdmin;

  async function handleLike() {
    setLiked((p) => !p);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    await toggleLike(post.id);
  }

  function handleReaction(emoji: string) {
    setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setShowEmojiPicker(false);
    toast.success(`Reacted with ${emoji}`, { duration: 1000 });
  }

  async function loadComments() {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    setLoadingComments(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select("*, user:profiles(id, full_name, username, avatar_url)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
      .limit(20);
    setComments(data || []);
    setLoadingComments(false);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    const result = await addComment(post.id, commentText);
    if (result?.error) {
      toast.error(result.error);
    } else {
      const supabase = createClient();
      const { data } = await supabase
        .from("comments")
        .select("*, user:profiles(id, full_name, username, avatar_url)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
      setComments(data || []);
      setCommentText("");
    }
    setSubmittingComment(false);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result?.error) toast.error(result.error);
      else { toast.success("Post deleted"); onDelete(post.id); }
    });
    setShowMenu(false);
  }

  const user = post.user as Profile;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-[#1e1f2e] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
    >
      {/* Pinned / Announcement */}
      {(post.is_pinned || post.is_announcement) && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
          post.is_announcement
            ? "bg-amber-500/10 text-amber-400 border-b border-amber-500/20"
            : "bg-indigo-500/10 text-indigo-400 border-b border-indigo-500/20"
        }`}>
          {post.is_announcement ? <Megaphone className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          {post.is_announcement ? "Campus Announcement" : "Pinned Post"}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Link href={`/app/profile/${user?.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all">
            <Image src={getAvatarUrl(user)} alt={user?.full_name || ""} fill className="object-cover" />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/app/profile/${user?.username}`}>
              <span className="font-semibold text-sm text-white hover:text-indigo-400 transition-colors">
                {user?.full_name}
              </span>
            </Link>
            <span className="text-xs text-white/30">@{user?.username}</span>
            {user?.branch && (
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                {user.branch}
              </span>
            )}
          </div>
          <p className="text-xs text-white/30 mt-0.5">{formatTimeAgo(post.created_at)}</p>
        </div>
        {canDelete && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-8 z-10 w-32 bg-[#2a2b3d] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full aspect-video bg-white/5 overflow-hidden">
          <Image src={post.image_url} alt="Post image" fill className="object-cover" />
        </div>
      )}

      {/* Emoji reactions display */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 py-2">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span key={emoji} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-white/70">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-white/5">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            liked
              ? "text-red-400 bg-red-500/10"
              : "text-white/40 hover:bg-white/5 hover:text-red-400"
          }`}
        >
          <motion.span animate={{ scale: liked ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.2 }}>
            ❤️
          </motion.span>
          <span>{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </button>

        {/* Emoji reaction */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/5 hover:text-yellow-400 transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showEmojiPicker && <EmojiPicker onSelect={handleReaction} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-3">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => {
                  const cu = c.user as Profile;
                  return (
                    <div key={c.id} className="flex gap-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={getAvatarUrl(cu)} alt={cu?.full_name || ""} fill className="object-cover" />
                      </div>
                      <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                        <span className="text-xs font-semibold text-white/80">{cu?.full_name}</span>
                        <span className="text-xs text-white/30 ml-2">{formatTimeAgo(c.created_at)}</span>
                        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleComment} className="flex gap-2 px-4 py-3 border-t border-white/5">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 transition-all"
              >
                {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ─── Create Post Box ──────────────────────────────────────────
function CreatePostBox({ profile, onPost }: { profile: Profile; onPost: (post: Post) => void }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const fd = new FormData();
    fd.append("content", content);
    if (imageFile) fd.append("image", imageFile);
    startTransition(async () => {
      const result = await createPost(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Posted! 🎉");
        setContent("");
        removeImage();
        const res = await getPosts(0, 1);
        if (res.data?.[0]) onPost(res.data[0] as Post);
      }
    });
  }

  return (
    <div className="bg-[#1e1f2e] border border-white/5 rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
          <Image src={getAvatarUrl(profile)} alt={profile.full_name} fill className="object-cover" />
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${profile.full_name.split(" ")[0]}?`}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all resize-none leading-relaxed"
          />
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-white/5">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button type="button" onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" id="post-image" />
              <label htmlFor="post-image" className="p-2 rounded-xl hover:bg-white/10 text-white/30 hover:text-white/60 cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
              </label>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isPending}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition-all hover:scale-105 disabled:hover:scale-100"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────
function SearchProfiles() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, branch, year")
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#1e1f2e] border border-white/5 rounded-2xl px-4 py-3">
        <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShow(true); }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder="Search students..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
        {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-white/30" />}
      </div>
      <AnimatePresence>
        {show && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1e1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {results.map((p) => (
              <Link key={p.id} href={`/app/profile/${p.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={getAvatarUrl(p)} alt={p.full_name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{p.full_name}</p>
                  <p className="text-xs text-white/40">@{p.username} · {p.branch}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────
function RightPanel({ collegeName }: { collegeName?: string }) {
  return (
    <div className="space-y-4">
      {/* Campus info */}
      <div className="bg-[#1e1f2e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Your Campus</span>
        </div>
        <p className="text-xs text-white/50 mb-3">{collegeName || "Campus"}</p>
        <div className="space-y-2">
          {[
            { icon: Flame, label: "Active now", val: "Live" },
            { icon: Users, label: "Members", val: "Growing" },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <span className="text-xs font-medium text-indigo-400">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="bg-[#1e1f2e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">Upcoming Events</span>
          </div>
          <Link href="/app/events" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {[
            { name: "Tech Fest 2026", date: "Jun 15", tag: "Festival" },
            { name: "Alumni Meet", date: "Jun 20", tag: "Networking" },
            { name: "Hackathon", date: "Jun 28", tag: "Competition" },
          ].map((event) => (
            <div key={event.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-indigo-400 font-bold uppercase">{event.date.split(" ")[0]}</span>
                <span className="text-xs font-bold text-indigo-300">{event.date.split(" ")[1]}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-white">{event.name}</p>
                <p className="text-[10px] text-white/40">{event.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="bg-[#1e1f2e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Trending</span>
        </div>
        <div className="space-y-2">
          {["#placements", "#exams", "#canteen", "#hackathon"].map((tag, i) => (
            <div key={tag} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/20 w-4">{i + 1}</span>
                <span className="text-sm font-medium text-indigo-400">{tag}</span>
              </div>
              <span className="text-[10px] text-white/30">trending</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Feed ────────────────────────────────────────────────
export default function FeedClient({ profile, initialPosts }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length === 10);
  const [loading, setLoading] = useState(false);

  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await getPosts(page, 10);
    if (result.data?.length) {
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...(result.data as Post[]).filter((p) => !ids.has(p.id))];
      });
      setPage((p) => p + 1);
      setHasMore(result.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  if (inView && !loading && hasMore) loadMore();

  function handleNewPost(post: Post) {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#13141f]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">🏠 Home</h1>
          <p className="text-sm text-white/40">See what's happening at {profile.college?.name || "your campus"}</p>
        </div>

        <div className="flex gap-6">
          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search */}
            <SearchProfiles />

            {/* Create post */}
            <CreatePostBox profile={profile} onPost={handleNewPost} />

            {/* Feed label */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/30 px-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Latest from your campus</span>
            </div>

            {/* Posts */}
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={profile.id}
                  isAdmin={profile.is_admin ?? false}
                  onDelete={handleDeletePost}
                />
              ))}
            </AnimatePresence>

            {/* Infinite scroll */}
            <div ref={loaderRef} className="flex justify-center py-4">
              {loading && <Loader2 className="w-5 h-5 animate-spin text-white/30" />}
              {!hasMore && posts.length > 0 && (
                <p className="text-xs text-white/30">You've seen all posts 🎉</p>
              )}
              {posts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-white/50 font-medium">No posts yet</p>
                  <p className="text-sm text-white/30 mt-1">Be the first to post on your campus!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - hidden on mobile */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <RightPanel collegeName={profile.college?.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
