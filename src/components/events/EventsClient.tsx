"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import {
  Plus, Calendar, MapPin, Clock, Star, Users, Loader2,
  X, ExternalLink, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { createEvent, toggleEventInterest, getEvents } from "@/lib/actions/content";
import { formatEventDate, getAvatarUrl, EVENT_CATEGORIES } from "@/lib/utils";
import type { Event, Profile } from "@/types";

// ─── Create Event Modal ───────────────────────────────────────
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEvent(fd);
      if (result?.error) toast.error(result.error);
      else { toast.success("Event created! 🎉"); onCreated(); onClose(); }
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
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Create Event</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Event Title *</label>
              <input name="title" required placeholder="e.g. Annual Hackathon 2025" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea name="description" rows={3} placeholder="What's happening? Who can attend? What to bring?" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date & Time *</label>
                <input name="event_date" type="datetime-local" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date & Time</label>
                <input name="end_date" type="datetime-local" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
                <input name="location" placeholder="Main Campus" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Venue</label>
                <input name="venue" placeholder="Auditorium" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_CATEGORIES.map((cat) => (
                  <label key={cat} className="cursor-pointer">
                    <input type="radio" name="category" value={cat} required className="sr-only peer" />
                    <div className="px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:border-glint-500 peer-checked:bg-glint-50 dark:peer-checked:bg-glint-950/30 peer-checked:text-glint-600 dark:peer-checked:text-glint-400 text-slate-500 dark:text-slate-400 text-xs font-medium text-center transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                      {cat}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Registration Link</label>
              <input name="registration_url" type="url" placeholder="https://forms.google.com/..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Calendar className="w-4 h-4" /> Create Event</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Event Card ───────────────────────────────────────────────
function EventCard({ event, onInterest }: { event: Event; onInterest: (id: string, v: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [interested, setInterested] = useState(event.is_interested ?? false);
  const [count, setCount] = useState(event.interested_count);
  const organizer = event.organizer as Profile | undefined;

  const categoryColors: Record<string, string> = {
    "Hackathon": "bg-glint-500/10 text-glint-600 dark:bg-glint-500/20 dark:text-glint-400",
    "Workshop": "bg-aurora-cyan/10 text-cyan-600 dark:bg-aurora-cyan/20 dark:text-cyan-400",
    "Cultural": "bg-aurora-pink/10 text-pink-600 dark:bg-aurora-pink/20 dark:text-pink-400",
    "Sports": "bg-aurora-emerald/10 text-emerald-600 dark:bg-aurora-emerald/20 dark:text-emerald-400",
    "Seminar": "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    "Tech Talk": "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  };

  const catColor = categoryColors[event.category ?? ""] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

  function handleToggle() {
    startTransition(async () => {
      const newVal = !interested;
      setInterested(newVal);
      setCount((c) => newVal ? c + 1 : c - 1);
      onInterest(event.id, newVal);
      await toggleEventInterest(event.id);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
    >
      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-glint-600 to-aurora-violet overflow-hidden">
        {event.banner_url && (
          <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
        )}
        {event.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg">
            <Sparkles className="w-3 h-3" /> Featured
          </div>
        )}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          {event.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-glint-400" />
            <span>{formatEventDate(event.event_date)}</span>
          </div>
          {(event.venue || event.location) && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-aurora-pink" />
              <span className="line-clamp-1">{event.venue ?? event.location}</span>
            </div>
          )}
          {organizer && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                <Image src={getAvatarUrl(organizer)} alt={organizer.full_name} fill className="object-cover" />
              </div>
              <span>By {organizer.full_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{count.toLocaleString()} interested</span>
          </div>

          <div className="flex items-center gap-2">
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Register
              </a>
            )}
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                interested
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                  : "bg-glint-500/10 dark:bg-glint-500/20 text-glint-600 dark:text-glint-400 hover:bg-glint-500 hover:text-white"
              }`}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className={`w-3 h-3 ${interested ? "fill-current" : ""}`} />}
              {interested ? "Interested" : "Interested?"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function EventsClient({ initialEvents, userId }: { initialEvents: Event[]; userId: string }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialEvents.length === 10);
  const [loading, setLoading] = useState(false);

  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await getEvents(page);
    if (result.data?.length) {
      setEvents((prev) => {
        const ids = new Set(prev.map((e) => e.id));
        return [...prev, ...(result.data as Event[]).filter((e) => !ids.has(e.id))];
      });
      setPage((p) => p + 1);
      setHasMore(result.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  if (inView && !loading && hasMore) loadMore();

  async function refreshEvents() {
    const result = await getEvents(0);
    setEvents((result.data as Event[]) || []);
    setPage(1);
    setHasMore((result.data?.length ?? 0) === 10);
  }

  const featured = events.filter((e) => e.is_featured);
  const upcoming = events.filter((e) => !e.is_featured);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Campus Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">What's happening on campus</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-glint-500/25 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Featured Events
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((e) => (
              <EventCard key={e.id} event={e}
                onInterest={(id, v) => setEvents((prev) => prev.map((x) => x.id === id ? { ...x, is_interested: v, interested_count: x.interested_count + (v ? 1 : -1) } : x))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Upcoming Events
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e}
                onInterest={(id, v) => setEvents((prev) => prev.map((x) => x.id === id ? { ...x, is_interested: v, interested_count: x.interested_count + (v ? 1 : -1) } : x))}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!hasMore && events.length > 0 && <p className="text-xs text-slate-400">No more upcoming events</p>}
        {events.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming events</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 bg-glint-500 text-white text-sm font-semibold rounded-xl hover:bg-glint-600 transition-colors">
              Create an Event
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={refreshEvents} />}
      </AnimatePresence>
    </div>
  );
}
