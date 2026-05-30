"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  User, Bell, Palette, Shield, LogOut, Trash2,
  Sun, Moon, Monitor, Check, Loader2, ChevronRight, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/actions/auth";
import type { Profile } from "@/types";

interface ToggleProps { checked: boolean; onChange: (v: boolean) => void }
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-glint-500" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

interface SectionProps { title: string; description?: string; icon: React.ElementType; children: React.ReactNode }
function Section({ title, description, icon: Icon, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-glint-50 dark:bg-glint-950/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-glint-500" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">{children}</div>
    </motion.div>
  );
}

interface RowProps { label: string; description?: string; children: React.ReactNode }
function Row({ label, description, children }: RowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsClient({ profile }: { profile: Profile }) {
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    clubs: true,
    events: true,
    system: true,
  });

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPass = fd.get("new_password") as string;
    const confirm = fd.get("confirm_password") as string;
    if (newPass !== confirm) { toast.error("Passwords don't match"); return; }
    if (newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) toast.error(error.message);
      else { toast.success("Password updated successfully!"); (e.target as HTMLFormElement).reset(); }
    });
  }

  async function handleDeleteAccount() {
    const confirm = window.confirm(
      "Are you absolutely sure? This will permanently delete your account, posts, and all data. This cannot be undone."
    );
    if (!confirm) return;
    toast.error("Please contact support to delete your account.");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <Section title="Account" description="Your account details" icon={User}>
        <Row label="Email" description={profile.email}>
          <span className="px-2.5 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">Verified</span>
        </Row>
        <Row label="Username">
          <span className="text-sm text-slate-500 dark:text-slate-400">@{profile.username}</span>
        </Row>
        <Row label="Member since">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
        </Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" description="Customize how Glint looks" icon={Palette}>
        <div className="px-5 py-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  theme === t.value
                    ? "bg-glint-50 dark:bg-glint-950/30 border-glint-300 dark:border-glint-700 text-glint-600 dark:text-glint-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {theme === t.value && <Check className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Control what you hear about" icon={Bell}>
        {Object.entries(notifications).map(([key, val]) => {
          const labels: Record<string, { label: string; desc: string }> = {
            likes: { label: "Likes", desc: "When someone likes your post" },
            comments: { label: "Comments", desc: "When someone comments on your post" },
            clubs: { label: "Club Updates", desc: "Activity in your clubs" },
            events: { label: "Events", desc: "Upcoming events on your campus" },
            system: { label: "System", desc: "Important announcements from Glint" },
          };
          const info = labels[key];
          return (
            <Row key={key} label={info.label} description={info.desc}>
              <Toggle checked={val} onChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))} />
            </Row>
          );
        })}
      </Section>

      {/* Change password */}
      <Section title="Security" description="Keep your account safe" icon={Lock}>
        <div className="p-5">
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
              <input name="new_password" type="password" required minLength={8} placeholder="Min. 8 characters" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Confirm Password</label>
              <input name="confirm_password" type="password" required minLength={8} placeholder="Repeat new password" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-glint-500 text-white font-semibold text-sm rounded-xl hover:bg-glint-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon={Shield}>
        <Row label="Sign Out" description="Log out of your account">
          <button
            onClick={() => signOutAction()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </Row>
        <Row label="Delete Account" description="Permanently remove your account and all data">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </Row>
      </Section>

      <p className="text-center text-xs text-slate-400 py-4">Glint v1.0.0 · Made with ❤️ for campus communities</p>
    </div>
  );
}
