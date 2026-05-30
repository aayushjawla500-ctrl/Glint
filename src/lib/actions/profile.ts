"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    full_name: formData.get("full_name"),
    bio: formData.get("bio"),
    branch: formData.get("branch"),
    year: parseInt(formData.get("year") as string) || undefined,
    instagram_url: formData.get("instagram_url") || null,
    linkedin_url: formData.get("linkedin_url") || null,
    github_url: formData.get("github_url") || null,
    skills: (formData.get("skills") as string)
      ?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
  };

  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
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
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/app/profile");
  return { success: true };
}

export async function reportContent(
  targetType: string,
  targetId: string,
  reason: string,
  description?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    college_id: profile!.college_id,
    target_type: targetType,
    target_id: targetId,
    reason,
    description,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getPublicProfile(username: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("username", username)
    .single();

  if (!profile) return { error: "User not found" };

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: clubs } = await supabase
    .from("club_members")
    .select("*, club:clubs(id, name, category, member_count)")
    .eq("user_id", profile.id)
    .limit(10);

  return { data: { profile, posts: posts || [], clubs: clubs || [] } };
}

export async function followUser(targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .single();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
    return { following: false };
  } else {
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetId,
      college_id: myProfile!.college_id,
    });
    return { following: true };
  }
}
