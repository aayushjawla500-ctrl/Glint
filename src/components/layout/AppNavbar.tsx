"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bell, Search, Sun, Moon, X } from "lucide-react";
import { useTheme } from "next-themes";
import { getAvatarUrl } from "@/lib/utils";
import type { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

const PAGE_TITLES: Record<string, string> = {
  "/app/feed":        "Campus Feed",
  "/app/marketplace": "Marketplace",
  "/app/confessions": "Confessions",
  "/app/clubs":       "Clubs",
  "/app/events":      "Events",
  "/app/profile":     "Profile",
  "/app/settings":    "Settings",
  "/app/admin":       "Admin Panel",
};

interface Props { profile: Profile }

export default function AppNavbar({ profile }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(profile.notification_count ?? 0);

  const title = PAGE_TITLES[pathname] ?? "Glint";

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notification-count")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${profile.id}`,
      }, () => setUnread((n) => n + 1))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile.id]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-16 bg-white/90 dark:bg-[#080810]/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/60 flex items-center px-5 gap-4 transition-all duration-300">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Search bar */}
      <div className={`transition-all duration-200 ${searchOpen ? "flex-1 max-w-sm" : "w-auto"}`}>
        {searchOpen ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus..."
              className="bg-transparent text-sm text-slate-700 dark:text-white placeholder:text-slate-400 outline-none flex-1 min-w-0"
            />
            <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
      </button>

      {/* Notifications */}
      <Link
        href="/app/notifications"
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-glint-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <Link href="/app/profile" className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-glint-500/20 hover:ring-glint-500/60 transition-all flex-shrink-0">
        <Image src={getAvatarUrl(profile)} alt={profile.full_name} fill className="object-cover" />
      </Link>
    </header>
  );
}
