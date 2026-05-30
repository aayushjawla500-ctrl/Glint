"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import {
  Plus, Users, Crown, Lock, Loader2, X, Check,
  Search, UserPlus, UserMinus, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClub, joinClub, leaveClub, getClubs } from "@/lib/actions/content";
import { getAvatarUrl, CLUB_CATEGORIES } from "@/lib/utils";
import type { Club, Profile } from "@/types";

// ─── Create Club Modal ────────────────────────────────────────
function CreateClubModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [isPrivate, setIsPrivate] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("is_private", isPrivate ? "true" : "false");
    startTransition(async () => {
      const result = await createClub(fd);
      if (result?.error) toast.error(result.error);
      else { toast.success("Club created! 🎉"); onCreated(); onClose(); }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Create a Club</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Club Name *</label>
            <input name="name" required placeholder="e.g. Coding Club, Drama Society" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea name="description" rows={3} placeholder="What is your club about? What do members do?" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CLUB_CATEGORIES.map((cat) => (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} required className="sr-only peer" />
                  <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:border-glint-500 peer-checked:bg-glint-50 dark:peer-checked:bg-glint-950/30 peer-checked:text-glint-600 dark:peer-checked:text-glint-400 text-slate-500 dark:text-slate-400 text-xs font-medium text-center transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                    {cat}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Private Club</p>
                <p className="text-xs text-slate-400">Members must request to join</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((p) => !p)}
              className={`w-11 h-6 rounded-full transition-all relative ${isPrivate ? "bg-glint-500" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isPrivate ? "left-5.5" : "left-0.5"}`} />
            </button>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Club"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Club Card ────────────────────────────────────────────────
function ClubCard({ club, onJoin, onLeave }: {
  club: Club;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isMember, setIsMember] = useState(club.is_member ?? false);
  const [memberCount, setMemberCount] = useState(club.member_count);
  const creator = club.creator as Profile | undefined;

  const gradients = [
    "from-glint-500 to-aurora-violet",
    "from-aurora-pink to-red-500",
    "from-aurora-cyan to-blue-500",
    "from-aurora-emerald to-teal-500",
    "from-orange-500 to-amber-400",
    "from-purple-500 to-glint-600",
  ];
  const grad = gradients[club.name.charCodeAt(0) % gradients.length];

  function handleToggle() {
    startTransition(async () => {
      if (isMember) {
        const result = await leaveClub(club.id);
        if (result?.error) { toast.error(result.error); return; }
        setIsMember(false);
        setMemberCount((c) => c - 1);
        onLeave(club.id);
      } else {
        const result = await joinClub(club.id);
        if (result?.error) { toast.error(result.error); return; }
        setIsMember(true);
        setMemberCount((c) => c + 1);
        onJoin(club.id);
        toast.success(`Joined ${club.name}!`);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      {/* Banner */}
      <div className={`relative h-20 bg-gradient-to-br ${grad}`}>
        {club.banner_url && (
          <Image src={club.banner_url} alt="" fill className="object-cover opacity-50" />
        )}
        {club.is_private && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg text-white/80 text-xs">
            <Lock className="w-2.5 h-2.5" /> Private
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className={`-mt-5 w-10 h-10 rounded-xl bg-gradient-to-br ${grad} border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md mb-3`}>
          {club.avatar_url ? (
            <Image src={club.avatar_url} alt={club.name} width={40} height={40} className="rounded-xl object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">{club.name[0]}</span>
          )}
        </div>

        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight mb-0.5 truncate">
          {club.name}
        </h3>

        {club.category && (
          <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-md mb-2">
            {club.category}
          </span>
        )}

        {club.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {club.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount.toLocaleString()} members</span>
          </div>

          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isMember
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
                : "bg-glint-500/10 dark:bg-glint-500/20 text-glint-600 dark:text-glint-400 hover:bg-glint-500 hover:text-white"
            }`}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isMember ? (
              <><Check className="w-3 h-3" /> Joined</>
            ) : (
              <><UserPlus className="w-3 h-3" /> Join</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ClubsClient({ initialClubs, userId }: { initialClubs: Club[]; userId: string }) {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialClubs.length === 12);
  const [loading, setLoading] = useState(false);

  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await getClubs(page);
    if (result.data?.length) {
      setClubs((prev) => {
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...(result.data as Club[]).filter((c) => !ids.has(c.id))];
      });
      setPage((p) => p + 1);
      setHasMore(result.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  if (inView && !loading && hasMore) loadMore();

  async function refreshClubs() {
    const result = await getClubs(0);
    setClubs((result.data as Club[]) || []);
    setPage(1);
    setHasMore((result.data?.length ?? 0) === 12);
  }

  const myClubs = clubs.filter((c) => c.is_member);
  const filtered = clubs.filter((c) => {
    const matchSearch = searchQ === "" || c.name.toLowerCase().includes(searchQ.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Clubs & Communities</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Find your people on campus</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-glint-500/25 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Club
        </button>
      </div>

      {/* My Clubs strip */}
      {myClubs.length > 0 && (
        <div className="mb-6 p-4 bg-glint-50 dark:bg-glint-950/20 border border-glint-100 dark:border-glint-900/40 rounded-2xl">
          <p className="text-xs font-semibold text-glint-600 dark:text-glint-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Your Clubs ({myClubs.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {myClubs.map((c) => {
              const gradients = ["from-glint-500 to-aurora-violet","from-aurora-pink to-red-500","from-aurora-cyan to-blue-500","from-aurora-emerald to-teal-500","from-orange-500 to-amber-400","from-purple-500 to-glint-600"];
              const grad = gradients[c.name.charCodeAt(0) % gradients.length];
              return (
                <div key={c.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-glint-200/50 dark:border-glint-800/40 whitespace-nowrap flex-shrink-0">
                  <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center`}>
                    <span className="text-white font-bold text-[9px]">{c.name[0]}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search clubs..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
        {["All", ...CLUB_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? "bg-glint-500/10 dark:bg-glint-500/20 border-glint-300 dark:border-glint-700 text-glint-600 dark:text-glint-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏛️</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No clubs found</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 bg-glint-500 text-white text-sm font-semibold rounded-xl hover:bg-glint-600 transition-colors">
            Create the first one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onJoin={(id) => setClubs((prev) => prev.map((c) => c.id === id ? { ...c, is_member: true, member_count: c.member_count + 1 } : c))}
                onLeave={(id) => setClubs((prev) => prev.map((c) => c.id === id ? { ...c, is_member: false, member_count: c.member_count - 1 } : c))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!hasMore && filtered.length > 0 && <p className="text-xs text-slate-400">All clubs loaded</p>}
      </div>

      <AnimatePresence>
        {showCreate && <CreateClubModal onClose={() => setShowCreate(false)} onCreated={refreshClubs} />}
      </AnimatePresence>
    </div>
  );
}
