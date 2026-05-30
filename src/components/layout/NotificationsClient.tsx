"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Users, Calendar, Megaphone, Sparkles, ShoppingBag } from "lucide-react";
import { formatTimeAgo, getAvatarUrl } from "@/lib/utils";
import type { Notification, Profile } from "@/types";

const NOTIF_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  like:         { icon: Heart,         color: "bg-red-100 dark:bg-red-950/30 text-red-500" },
  comment:      { icon: MessageCircle, color: "bg-blue-100 dark:bg-blue-950/30 text-blue-500" },
  follow:       { icon: Users,         color: "bg-glint-100 dark:bg-glint-950/30 text-glint-500" },
  club_invite:  { icon: Users,         color: "bg-aurora-emerald/20 text-emerald-500" },
  event:        { icon: Calendar,      color: "bg-amber-100 dark:bg-amber-950/30 text-amber-500" },
  announcement: { icon: Megaphone,     color: "bg-glint-100 dark:bg-glint-950/30 text-glint-500" },
  marketplace:  { icon: ShoppingBag,   color: "bg-aurora-cyan/20 text-cyan-500" },
  system:       { icon: Sparkles,      color: "bg-purple-100 dark:bg-purple-950/30 text-purple-500" },
};

export default function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet</p>
        <p className="text-sm text-slate-400 mt-1">We'll let you know when something happens</p>
      </div>
    );
  }

  // Group by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [];
  const todayItems = notifications.filter((n) => new Date(n.created_at).toDateString() === today.toDateString());
  const yesterdayItems = notifications.filter((n) => new Date(n.created_at).toDateString() === yesterday.toDateString());
  const olderItems = notifications.filter((n) => {
    const d = new Date(n.created_at);
    return d.toDateString() !== today.toDateString() && d.toDateString() !== yesterday.toDateString();
  });

  if (todayItems.length) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (olderItems.length) groups.push({ label: "Earlier", items: olderItems });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Notifications</h1>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wide mb-3 px-1">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((notif, i) => {
                const meta = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.system;
                const actor = notif.actor as Profile | undefined;
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !notif.is_read ? "bg-glint-50/50 dark:bg-glint-950/10" : ""
                    }`}
                  >
                    {/* Icon / Actor avatar */}
                    <div className="relative flex-shrink-0">
                      {actor ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image src={getAvatarUrl(actor)} alt={actor.full_name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                      {actor && (
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${meta.color} border-2 border-white dark:border-slate-900`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                        <strong className="font-semibold text-slate-900 dark:text-white">{notif.title}</strong>
                        {notif.body && <span className="text-slate-500 dark:text-slate-400"> — {notif.body}</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(notif.created_at)}</p>
                    </div>

                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-glint-500 flex-shrink-0 mt-2" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
