"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// =============================================
// CONFESSIONS
// =============================================

export async function createConfession(content: string, tag: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const { error } = await supabase.from("confessions").insert({
    college_id: profile.college_id,
    content: content.trim(),
    tag,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/confessions");
  return { success: true };
}

export async function toggleConfessionLike(confessionId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("confession_id", confessionId)
    .single();

  if (existingLike) {
    await supabase.from("likes").delete().eq("id", existingLike.id);
    return { liked: false };
  } else {
    await supabase.from("likes").insert({
      user_id: user.id,
      confession_id: confessionId,
      college_id: profile!.college_id,
    });
    return { liked: true };
  }
}

export async function getConfessions(tag?: string, sort: "latest" | "trending" = "latest", page = 0) {
  const supabase = await createClient();
  const limit = 10;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { data: [] };

  let query = supabase
    .from("confessions")
    .select("*")
    .eq("college_id", profile.college_id)
    .eq("is_approved", true)
    .range(page * limit, (page + 1) * limit - 1);

  if (tag && tag !== "all") query = query.eq("tag", tag);

  if (sort === "trending") {
    query = query.order("like_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };

  const { data: likes } = await supabase
    .from("likes")
    .select("confession_id")
    .eq("user_id", user.id)
    .in("confession_id", data?.map((c) => c.id) || []);

  const likedIds = new Set(likes?.map((l) => l.confession_id));

  return {
    data: data?.map((c) => ({ ...c, liked_by_me: likedIds.has(c.id) })) || [],
    hasMore: (data?.length || 0) === limit,
  };
}

// =============================================
// CLUBS
// =============================================

export async function createClub(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const { data: club, error } = await supabase
    .from("clubs")
    .insert({
      college_id: profile.college_id,
      creator_id: user.id,
      name,
      slug,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Auto-join as admin
  await supabase.from("club_members").insert({
    club_id: club.id,
    user_id: user.id,
    college_id: profile.college_id,
    role: "admin",
  });

  revalidatePath("/app/clubs");
  return { success: true, clubId: club.id };
}

export async function joinClub(clubId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("club_members").insert({
    club_id: clubId,
    user_id: user.id,
    college_id: profile!.college_id,
    role: "member",
  });

  if (error) return { error: error.message };

  revalidatePath("/app/clubs");
  return { success: true };
}

export async function leaveClub(clubId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/clubs");
  return { success: true };
}

export async function getClubs(page = 0) {
  const supabase = await createClient();
  const limit = 12;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { data: [] };

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select(`*, creator:profiles(id, full_name, username, avatar_url)`)
    .eq("college_id", profile.college_id)
    .order("member_count", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return { error: error.message, data: [] };

  const { data: memberships } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user.id);

  const joinedClubIds = new Set(memberships?.map((m) => m.club_id));

  return {
    data: clubs?.map((c) => ({ ...c, is_member: joinedClubIds.has(c.id) })) || [],
    hasMore: (clubs?.length || 0) === limit,
  };
}

// =============================================
// EVENTS
// =============================================

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const bannerFile = formData.get("banner") as File | null;
  let banner_url: string | undefined;

  if (bannerFile && bannerFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${bannerFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-banners")
      .upload(fileName, bannerFile);

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from("event-banners")
      .getPublicUrl(uploadData.path);

    banner_url = publicUrl;
  }

  const { error } = await supabase.from("events").insert({
    college_id: profile.college_id,
    organizer_id: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    venue: formData.get("venue") as string,
    event_date: formData.get("event_date") as string,
    end_date: formData.get("end_date") as string || null,
    category: formData.get("category") as string,
    registration_url: formData.get("registration_url") as string || null,
    banner_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/events");
  return { success: true };
}

export async function toggleEventInterest(eventId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  const { data: existing } = await supabase
    .from("event_interests")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("event_interests").delete().eq("id", existing.id);
    return { interested: false };
  } else {
    await supabase.from("event_interests").insert({
      event_id: eventId,
      user_id: user.id,
      college_id: profile!.college_id,
    });
    return { interested: true };
  }
}

export async function getEvents(page = 0) {
  const supabase = await createClient();
  const limit = 10;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { data: [] };

  const { data: events, error } = await supabase
    .from("events")
    .select(`*, organizer:profiles(id, full_name, username, avatar_url)`)
    .eq("college_id", profile.college_id)
    .eq("is_cancelled", false)
    .gte("event_date", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("event_date", { ascending: true })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return { error: error.message, data: [] };

  const { data: interests } = await supabase
    .from("event_interests")
    .select("event_id")
    .eq("user_id", user.id);

  const interestedIds = new Set(interests?.map((i) => i.event_id));

  return {
    data: events?.map((e) => ({ ...e, is_interested: interestedIds.has(e.id) })) || [],
    hasMore: (events?.length || 0) === limit,
  };
}
