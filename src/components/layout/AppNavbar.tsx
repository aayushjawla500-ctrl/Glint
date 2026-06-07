"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, X, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { getAvatarUrl } from "@/lib/utils";
import type { Profile } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/app/feed":        "🏠 Home",
  "/app/marketplace": "🛍️ Marketplace",
  "/app/confessions": "💬 Confessions",
  "/app/clubs":       "👥 Clubs",
  "/app/events":      "📅 Events",
  "/app/profile":     "👤 Profile",
  "/app/settings":    "⚙️ Settings",
  "/app/admin":       "🛡️ Admin Panel",
};

interface Props { profile: Profile }

export default function AppNavbar({ profile }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

  const title = PAGE_TITLES[pathname] ?? "Glint";

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, branch")
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-14 bg-[#0e0f1a]/90 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-3 transition-all duration-300">
      <div className="flex-1">
        <h1 className="font-bold text-base text-white hidden sm:block">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl"
            >
              <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students..."
                className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none flex-1 min-w-0"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}>
                <X className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </AnimatePresence>

        {/* Search results dropdown */}
        <AnimatePresence>
          {results.length > 0 && searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full right-0 mt-2 w-64 bg-[#1e1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/profile/${p.username}`}
                  onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={getAvatarUrl(p)} alt={p.full_name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.full_name}</p>
                    <p className="text-xs text-white/40">@{p.username}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Avatar */}
      <Link href="/app/profile" className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/20 hover:ring-indigo-500/60 transition-all flex-shrink-0">
        <Image src={getAvatarUrl(profile)} alt={profile.full_name} fill className="object-cover" />
      </Link>
    </header>
  );
}
