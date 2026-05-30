import { createClient } from "@/lib/supabase/server";
import ClubsClient from "@/components/clubs/ClubsClient";

export default async function ClubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user!.id)
    .single();

  const { data: clubs } = await supabase
    .from("clubs")
    .select("*, creator:profiles(id, full_name, username, avatar_url)")
    .eq("college_id", profile?.college_id)
    .order("member_count", { ascending: false })
    .limit(12);

  const { data: memberships } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user!.id);

  const joinedIds = new Set(memberships?.map((m) => m.club_id));

  const initial = (clubs || []).map((c) => ({
    ...c,
    is_member: joinedIds.has(c.id),
  }));

  return <ClubsClient initialClubs={initial} userId={user!.id} />;
}
