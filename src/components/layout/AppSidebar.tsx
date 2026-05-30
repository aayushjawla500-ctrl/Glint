"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Home, ShoppingBag, MessageCircle, Users,
  Calendar, User, Settings, LogOut, Shield, X, Menu,
  Bell, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { getAvatarUrl } from "@/lib/utils";
import type { Profile } from "@/types";
import Image from "next/image";

const navItems = [
  { href: "/app/feed",         label: "Feed",         icon: Home },
  { href: "/app/marketplace",  label: "Marketplace",  icon: ShoppingBag },
  { href: "/app/confessions",  label: "Confessions",  icon: MessageCircle },
  { href: "/app/clubs",        label: "Clubs",        icon: Users },
  { href: "/app/events",       label: "Events",       icon: Calendar },
];

const bottomItems = [
  { href: "/app/profile",  label: "Profile",  icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

interface Props { profile: Profile & { college?: { name: string } } }

export default function AppSidebar({ profile }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
          active
            ? "bg-glint-500/10 dark:bg-glint-500/15 text-glint-600 dark:text-glint-400 border border-glint-200/40 dark:border-glint-800/40"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
        }`}
      >
        <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-glint-500" : "text-current"}`} />
        <span>{label}</span>
        {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-glint-400" />}
      </Link>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-5 px-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <Link href="/app/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center shadow-lg shadow-glint-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">Glint</span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* College badge */}
      {profile.college && (
        <div className="mb-6 px-3 py-2.5 rounded-xl bg-glint-50 dark:bg-glint-950/30 border border-glint-100 dark:border-glint-900/50">
          <p className="text-xs text-glint-500 dark:text-glint-400 font-medium truncate">
            🏫 {profile.college.name}
          </p>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
          Campus
        </p>
        {navItems.map((item) => <NavItem key={item.href} {...item} />)}

        {profile.is_admin && (
          <>
            <p className="px-3 mt-5 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
              Admin
            </p>
            <NavItem href="/app/admin" label="Admin Panel" icon={Shield} />
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-1">
        {bottomItems.map((item) => <NavItem key={item.href} {...item} />)}
        <button
          onClick={() => signOutAction()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile pill */}
      <Link
        href="/app/profile"
        onClick={() => setMobileOpen(false)}
        className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-glint-200 dark:hover:border-glint-800 transition-all group"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-glint-500/20">
          <Image src={getAvatarUrl(profile)} alt={profile.full_name} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{profile.full_name}</p>
          <p className="text-xs text-slate-400 truncate">@{profile.username}</p>
        </div>
        {profile.notification_count > 0 && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-glint-500 text-white text-xs font-bold flex items-center justify-center">
            {profile.notification_count > 9 ? "9+" : profile.notification_count}
          </span>
        )}
      </Link>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0c0c18] border-r border-slate-100 dark:border-slate-800/60 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 w-12 h-12 rounded-2xl bg-glint-500 text-white shadow-xl shadow-glint-500/30 flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0c0c18] border-r border-slate-100 dark:border-slate-800 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
