"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const content = formData.get("content") as string;
  const imageFile = formData.get("image") as File | null;

  if (!content?.trim()) return { error: "Content is required" };

  let image_url: string | undefined;

  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile);

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from("post-images")
      .getPublicUrl(uploadData.path);

    image_url = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    college_id: profile.college_id,
    content: content.trim(),
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/feed");
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/feed");
  return { success: true };
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existingLike) {
    await supabase.from("likes").delete().eq("id", existingLike.id);
    return { liked: false };
  } else {
    await supabase.from("likes").insert({
      user_id: user.id,
      post_id: postId,
      college_id: profile.college_id,
    });
    return { liked: true };
  }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    college_id: profile.college_id,
    content: content.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/app/feed");
  return { success: true };
}

export async function getPosts(page = 0, limit = 10) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { data: [] };

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(id, full_name, username, avatar_url, branch, year)
    `)
    .eq("college_id", profile.college_id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return { error: error.message, data: [] };

  // Get liked posts
  const { data: likes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", posts?.map((p) => p.id) || []);

  const likedPostIds = new Set(likes?.map((l) => l.post_id));

  return {
    data: posts?.map((p) => ({
      ...p,
      liked_by_me: likedPostIds.has(p.id),
    })) || [],
    hasMore: (posts?.length || 0) === limit,
  };
}
