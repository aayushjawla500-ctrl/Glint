import { createClient } from "@/lib/supabase/server";
import ProfileClient from "@/components/profile/ProfileClient";
import { notFound } from "next/navigation";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: clubs } = await supabase
    .from("club_members")
    .select("*, club:clubs(id, name, category, member_count, avatar_url)")
    .eq("user_id", profile.id)
    .limit(10);

  const { data: followersData } = await supabase
    .from("follows")
    .select("id")
    .eq("following_id", profile.id);

  const { data: followingData } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", profile.id);

  return (
    <ProfileClient
      profile={profile}
      posts={posts || []}
      clubs={clubs || []}
      followerCount={followersData?.length ?? 0}
      followingCount={followingData?.length ?? 0}
      isOwnProfile={user?.id === profile.id}
    />
  );
}
