"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, FileText, MessageCircle, Flag, Trash2,
  Pin, PinOff, Ban, CheckCircle, AlertTriangle, TrendingUp,
  Sparkles, BarChart3, Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils";
import type { Profile, Post, Confession } from "@/types";

interface Stats { users: number; posts: number; confessions: number; clubs: number }

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-display font-bold text-3xl text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
        active
          ? "bg-glint-500/10 dark:bg-glint-500/20 border-glint-300 dark:border-glint-700 text-glint-600 dark:text-glint-400"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminClient({
  profile, reports, recentPosts, recentConfessions, stats,
}: {
  profile: Profile;
  reports: any[];
  recentPosts: any[];
  recentConfessions: any[];
  stats: Stats;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "posts" | "confessions" | "users">("overview");
  const [reportsList, setReportsList] = useState(reports);
  const [postsList, setPostsList] = useState(recentPosts);
  const [confessionsList, setConfessionsList] = useState(recentConfessions);
  const [isPending, startTransition] = useTransition();

  async function deletePost(postId: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) { toast.error(error.message); return; }
      setPostsList((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    });
  }

  async function togglePinPost(post: Post) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("posts").update({ is_pinned: !post.is_pinned }).eq("id", post.id);
      if (error) { toast.error(error.message); return; }
      setPostsList((prev) => prev.map((p) => p.id === post.id ? { ...p, is_pinned: !p.is_pinned } : p));
      toast.success(post.is_pinned ? "Post unpinned" : "Post pinned!");
    });
  }

  async function deleteConfession(confessionId: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("confessions").delete().eq("id", confessionId);
      if (error) { toast.error(error.message); return; }
      setConfessionsList((prev) => prev.filter((c) => c.id !== confessionId));
      toast.success("Confession deleted");
    });
  }

  async function resolveReport(reportId: string, action: "resolved" | "dismissed") {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("reports").update({ status: action, reviewed_by: profile.id }).eq("id", reportId);
      if (error) { toast.error(error.message); return; }
      setReportsList((prev) => prev.filter((r) => r.id !== reportId));
      toast.success(action === "resolved" ? "Report resolved" : "Report dismissed");
    });
  }

  async function banUser(userId: string) {
    const confirm = window.confirm("Ban this user? They will lose access to the platform.");
    if (!confirm) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ is_banned: true }).eq("id", userId);
      if (error) { toast.error(error.message); return; }
      toast.success("User banned");
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Campus moderation dashboard</p>
        </div>
        {reportsList.length > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{reportsList.length} pending reports</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 custom-scrollbar">
        <TabBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabBtn>
        <TabBtn active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
          Reports {reportsList.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{reportsList.length}</span>}
        </TabBtn>
        <TabBtn active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>Posts</TabBtn>
        <TabBtn active={activeTab === "confessions"} onClick={() => setActiveTab("confessions")}>Confessions</TabBtn>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Students" value={stats.users} icon={Users} color="bg-glint-500" />
              <StatCard label="Total Posts" value={stats.posts} icon={FileText} color="bg-aurora-emerald" />
              <StatCard label="Confessions" value={stats.confessions} icon={MessageCircle} color="bg-aurora-pink" />
              <StatCard label="Clubs" value={stats.clubs} icon={Sparkles} color="bg-aurora-violet" />
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-display font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "View Reports", icon: Flag, color: "text-red-500 bg-red-50 dark:bg-red-950/30", action: () => setActiveTab("reports") },
                  { label: "Manage Posts", icon: FileText, color: "text-glint-500 bg-glint-50 dark:bg-glint-950/30", action: () => setActiveTab("posts") },
                  { label: "Confessions", icon: MessageCircle, color: "text-aurora-pink bg-pink-50 dark:bg-pink-950/30", action: () => setActiveTab("confessions") },
                  { label: "Analytics", icon: BarChart3, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", action: () => {} },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${item.color} hover:scale-105 transition-all`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <motion.div key="reports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {reportsList.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-70" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No pending reports</p>
                <p className="text-sm text-slate-400 mt-1">Your campus is clean 🎉</p>
              </div>
            ) : reportsList.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${
                      report.target_type === "confession" ? "bg-aurora-pink/10 text-aurora-pink" :
                      report.target_type === "post" ? "bg-glint-500/10 text-glint-500" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {report.target_type}
                    </span>
                    <span className="text-xs text-slate-400">{formatTimeAgo(report.created_at)}</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-lg">
                    Pending
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason: <span className="font-normal">{report.reason}</span></p>
                {report.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{report.description}</p>}
                <p className="text-xs text-slate-400">Reported by: {report.reporter?.full_name} (@{report.reporter?.username})</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => resolveReport(report.id, "resolved")} disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-xl hover:bg-green-100 dark:hover:bg-green-950/50 transition-all border border-green-200 dark:border-green-900/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve & Remove
                  </button>
                  <button onClick={() => resolveReport(report.id, "dismissed")} disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wide">Recent Posts — {postsList.length} shown</p>
            {postsList.map((post) => {
              const user = post.user as Profile;
              return (
                <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{user?.full_name}</span>
                        <span className="text-xs text-slate-400">@{user?.username}</span>
                        {post.is_pinned && <span className="px-1.5 py-0.5 bg-glint-500/10 text-glint-500 text-xs rounded-md">📌 Pinned</span>}
                        <span className="text-xs text-slate-400 ml-auto">{formatTimeAgo(post.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => togglePinPost(post)} disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                        post.is_pinned
                          ? "bg-glint-500/10 text-glint-600 dark:text-glint-400 hover:bg-glint-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}>
                      {post.is_pinned ? <><PinOff className="w-3 h-3" /> Unpin</> : <><Pin className="w-3 h-3" /> Pin</>}
                    </button>
                    <button onClick={() => deletePost(post.id)} disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-all border border-red-100 dark:border-red-900/30">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <button onClick={() => banUser(post.user_id)} disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                      <Ban className="w-3 h-3" /> Ban User
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* CONFESSIONS */}
        {activeTab === "confessions" && (
          <motion.div key="confessions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wide">Recent Confessions — {confessionsList.length} shown</p>
            {confessionsList.map((confession) => (
              <div key={confession.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-lg">#{confession.tag}</span>
                  <span className="text-xs text-slate-400">{formatTimeAgo(confession.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3">{confession.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>❤️ {confession.like_count}</span>
                    <span>💬 {confession.comment_count}</span>
                    {confession.is_flagged && <span className="text-amber-500 font-medium">⚠️ Flagged</span>}
                  </div>
                  <button onClick={() => deleteConfession(confession.id)} disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-medium rounded-xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
