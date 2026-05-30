import { createClient } from "@/lib/supabase/server";
import ConfessionsClient from "@/components/confessions/ConfessionsClient";

export default async function ConfessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user!.id)
    .single();

  const { data: confessions } = await supabase
    .from("confessions")
    .select("*")
    .eq("college_id", profile?.college_id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: likes } = await supabase
    .from("likes")
    .select("confession_id")
    .eq("user_id", user!.id);

  const likedIds = new Set(likes?.map((l) => l.confession_id));

  const initial = (confessions || []).map((c) => ({
    ...c,
    liked_by_me: likedIds.has(c.id),
  }));

  return <ConfessionsClient initialConfessions={initial} userId={user!.id} />;
}
