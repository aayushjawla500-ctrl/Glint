"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import {
  Heart, MessageCircle, Trash2, Image as ImageIcon, Send,
  Pin, Megaphone, TrendingUp, Loader2, X, MoreHorizontal, Smile,
} from "lucide-react";
import toast from "react-hot-toast";
import { createPost, deletePost, toggleLike, addComment, getPosts } from "@/lib/actions/posts";
import { formatTimeAgo, getAvatarUrl, truncateText } from "@/lib/utils";
import type { Post, Profile, Comment } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface Props {
  profile: Profile & { college?: { name: string } };
  initialPosts: Post[];
}

// ─── Post Card ──────────────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  onDelete,
  onLike,
}: {
  post: Post;
  currentUserId: string;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleLike() {
    setLiked((p) => !p);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    onLike(post.id);
    await toggleLike(post.id);
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
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Pinned / Announcement banner */}
      {(post.is_pinned || post.is_announcement) && (
        <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold ${
          post.is_announcement
            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-b border-amber-100 dark:border-amber-900/40"
            : "bg-glint-50 dark:bg-glint-950/30 text-glint-600 dark:text-glint-400 border-b border-glint-100 dark:border-glint-900/40"
        }`}>
          {post.is_announcement ? <Megaphone className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          {post.is_announcement ? "Campus Announcement" : "Pinned Post"}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
          <Image src={getAvatarUrl(user)} alt={user?.full_name || ""} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">{user?.full_name}</span>
            <span className="text-xs text-slate-400">@{user?.username}</span>
            {user?.branch && (
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                {user.branch}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(post.created_at)}</p>
        </div>
        {post.user_id === currentUserId && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-8 z-10 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 mx-0 overflow-hidden">
          <Image src={post.image_url} alt="Post image" fill className="object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-3 border-t border-slate-50 dark:border-slate-800/60">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            liked
              ? "text-red-500 bg-red-50 dark:bg-red-950/30"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500"
          }`}
        >
          <motion.div animate={{ scale: liked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.2 }}>
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </motion.div>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => {
                  const cu = c.user as Profile;
                  return (
                    <div key={c.id} className="flex gap-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={getAvatarUrl(cu)} alt={cu?.full_name || ""} fill className="object-cover" />
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{cu?.full_name}</span>
                        <span className="text-xs text-slate-400 ml-2">{formatTimeAgo(c.created_at)}</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleComment} className="flex gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder:text-slate-400 outline-none focus:border-glint-500/60 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="p-2 rounded-xl bg-glint-500 text-white hover:bg-glint-600 disabled:opacity-40 transition-all"
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

// ─── Create Post Box ─────────────────────────────────────────
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
        toast.success("Posted!");
        setContent("");
        removeImage();
        // Re-fetch the new post
        const res = await getPosts(0, 1);
        if (res.data?.[0]) onPost(res.data[0] as Post);
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4">
      <div className="flex gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
          <Image src={getAvatarUrl(profile)} alt={profile.full_name} fill className="object-cover" />
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none leading-relaxed"
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" id="post-image" />
              <label htmlFor="post-image" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                <ImageIcon className="w-4.5 h-4.5" />
              </label>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isPending}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-glint-600 to-glint-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-glint-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
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

// ─── Main Feed Client ─────────────────────────────────────────
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

  // Trigger load when loader div enters view
  if (inView && !loading && hasMore) loadMore();

  function handleNewPost(post: Post) {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Create post */}
      <CreatePostBox profile={profile} onPost={handleNewPost} />

      {/* Trending section hint */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-600 px-1">
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
            onDelete={handleDeletePost}
            onLike={() => {}}
          />
        ))}
      </AnimatePresence>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex justify-center py-4">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!hasMore && posts.length > 0 && (
          <p className="text-xs text-slate-400">You've seen all posts 🎉</p>
        )}
        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No posts yet</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to post on your campus!</p>
          </div>
        )}
      </div>
    </div>
  );
}
