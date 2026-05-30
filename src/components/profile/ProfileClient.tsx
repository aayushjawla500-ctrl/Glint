"use client";

import { useState, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Edit3, Camera, Instagram, Linkedin, Github, MapPin,
  BookOpen, Calendar, Users, Heart, MessageCircle, X,
  Loader2, Check, Plus, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { getAvatarUrl, formatTimeAgo, YEAR_LABELS } from "@/lib/utils";
import type { Profile, Post } from "@/types";

// ─── Edit Profile Modal ───────────────────────────────────────
function EditProfileModal({ profile, onClose, onSaved }: {
  profile: Profile;
  onClose: () => void;
  onSaved: (p: Partial<Profile>) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [skills, setSkills] = useState((profile.skills || []).join(", "));

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setAvatarPreview(URL.createObjectURL(f));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const supabase = createClient();
      const updates: Partial<Profile> = {
        full_name: fd.get("full_name") as string,
        bio: fd.get("bio") as string,
        branch: fd.get("branch") as string,
        year: parseInt(fd.get("year") as string) || undefined,
        instagram_url: fd.get("instagram_url") as string || undefined,
        linkedin_url: fd.get("linkedin_url") as string || undefined,
        github_url: fd.get("github_url") as string || undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      };

      // Upload avatar if changed
      const avatarFile = fileRef.current?.files?.[0];
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.id}/avatar.${ext}`;
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path);
          updates.avatar_url = publicUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) { toast.error(error.message); return; }
      toast.success("Profile updated!");
      onSaved(updates);
      onClose();
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
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-glint-500/20">
                  <Image
                    src={avatarPreview || getAvatarUrl(profile)}
                    alt={profile.full_name}
                    width={80} height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-glint-500 text-white flex items-center justify-center cursor-pointer hover:bg-glint-600 transition-colors shadow-lg">
                  <Camera className="w-3.5 h-3.5" />
                </label>
                <input ref={fileRef} id="avatar-upload" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input name="full_name" defaultValue={profile.full_name} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Branch</label>
                <input name="branch" defaultValue={profile.branch || ""} placeholder="CSE, ECE..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
                <select name="year" defaultValue={profile.year || 1} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all [&>option]:bg-white dark:[&>option]:bg-slate-800">
                  {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
              <textarea name="bio" defaultValue={profile.bio || ""} rows={3} placeholder="Tell your campus about yourself..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Skills & Interests <span className="text-slate-400 font-normal">(comma separated)</span></label>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, ML, Guitar, Photography..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Social Links</label>
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <input name="instagram_url" defaultValue={profile.instagram_url || ""} placeholder="instagram.com/yourhandle" className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <input name="linkedin_url" defaultValue={profile.linkedin_url || ""} placeholder="linkedin.com/in/yourname" className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                <input name="github_url" defaultValue={profile.github_url || ""} placeholder="github.com/yourhandle" className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ProfileClient({
  profile: initialProfile,
  posts,
  clubs,
  followerCount,
  followingCount,
  isOwnProfile,
}: {
  profile: Profile & { college?: { name: string } };
  posts: Post[];
  clubs: any[];
  followerCount: number;
  followingCount: number;
  isOwnProfile: boolean;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "clubs">("posts");

  const tabs = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "clubs", label: "Clubs", count: clubs.length },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-glint-500 via-aurora-violet to-aurora-pink relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + edit */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-xl">
                <Image src={getAvatarUrl(profile)} alt={profile.full_name} width={80} height={80} className="object-cover w-full h-full" />
              </div>
              {profile.is_admin && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-900" />
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mb-4">
            <h1 className="font-display font-bold text-xl text-slate-900 dark:text-white">{profile.full_name}</h1>
            <p className="text-slate-400 text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.college && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-glint-50 dark:bg-glint-950/30 text-glint-600 dark:text-glint-400 text-xs font-medium rounded-xl border border-glint-100 dark:border-glint-900/40">
                <MapPin className="w-3 h-3" /> {(profile.college as any).name}
              </span>
            )}
            {profile.branch && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-xl">
                <BookOpen className="w-3 h-3" /> {profile.branch}
              </span>
            )}
            {profile.year && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-xl">
                <Calendar className="w-3 h-3" /> {YEAR_LABELS[profile.year]}
              </span>
            )}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profile.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-aurora-violet/10 text-aurora-violet dark:text-purple-400 text-xs font-medium rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Posts", value: posts.length },
              { label: "Clubs", value: clubs.length },
              { label: "Followers", value: followerCount },
              { label: "Following", value: followingCount },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="font-display font-bold text-lg text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Social links */}
          {(profile.instagram_url || profile.linkedin_url || profile.github_url) && (
            <div className="flex gap-3">
              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-xs font-medium rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${activeTab === tab.key ? "bg-glint-100 dark:bg-glint-900/30 text-glint-600 dark:text-glint-400" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "posts" && (
          <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No posts yet</p>
              </div>
            ) : posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">{post.content}</p>
                {post.image_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                    <Image src={post.image_url} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.like_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comment_count}</span>
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "clubs" && (
          <motion.div key="clubs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {clubs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Not a member of any clubs yet</p>
              </div>
            ) : clubs.map((m) => {
              const club = m.club;
              return club ? (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-violet flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{club.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{club.name}</p>
                    <p className="text-xs text-slate-400">{club.category} • {club.member_count} members</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${m.role === "admin" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                    {m.role}
                  </span>
                </div>
              ) : null;
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEdit(false)}
            onSaved={(updates) => setProfile((p) => ({ ...p, ...updates }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
