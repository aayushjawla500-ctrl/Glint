import { createClient } from "@/lib/supabase/server";
import ProfileClient from "@/components/profile/ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: clubs } = await supabase
    .from("club_members")
    .select("*, club:clubs(id, name, category, member_count, avatar_url)")
    .eq("user_id", user.id)
    .limit(10);

  const { data: followersData } = await supabase
    .from("follows")
    .select("id", { count: "exact" })
    .eq("following_id", user.id);

  const { data: followingData } = await supabase
    .from("follows")
    .select("id", { count: "exact" })
    .eq("follower_id", user.id);

  return (
    <ProfileClient
      profile={profile!}
      posts={posts || []}
      clubs={clubs || []}
      followerCount={followersData?.length ?? 0}
      followingCount={followingData?.length ?? 0}
      isOwnProfile
    />
  );
}
