import { createClient } from "@/lib/supabase/server";
import FeedClient from "@/components/feed/FeedClient";
import GlintLoader from "@/components/ui/GlintLoader";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("id", user!.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, user:profiles(id, full_name, username, avatar_url, branch, year)")
    .eq("college_id", profile?.college_id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: likes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", user!.id);

  const likedIds = new Set(likes?.map((l) => l.post_id));

  const initialPosts = (posts || []).map((p) => ({
    ...p,
    liked_by_me: likedIds.has(p.id),
  }));

  return (
    <GlintLoader>
      <FeedClient
        profile={profile!}
        initialPosts={initialPosts}
      />
    </GlintLoader>
  );
}
