import { createClient } from "@/lib/supabase/server";
import AdminClient from "@/components/admin/AdminClient";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/app/feed");

  const { data: reports } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reporter_id(id, full_name, username)")
    .eq("college_id", profile.college_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*, user:profiles(id, full_name, username)")
    .eq("college_id", profile.college_id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentConfessions } = await supabase
    .from("confessions")
    .select("*")
    .eq("college_id", profile.college_id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: userCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("college_id", profile.college_id);

  const { data: postCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("college_id", profile.college_id);

  const { data: confessionCount } = await supabase
    .from("confessions")
    .select("id", { count: "exact", head: true })
    .eq("college_id", profile.college_id);

  const { data: clubCount } = await supabase
    .from("clubs")
    .select("id", { count: "exact", head: true })
    .eq("college_id", profile.college_id);

  return (
    <AdminClient
      profile={profile}
      reports={reports || []}
      recentPosts={recentPosts || []}
      recentConfessions={recentConfessions || []}
      stats={{
        users: (userCount as any)?.count ?? 0,
        posts: (postCount as any)?.count ?? 0,
        confessions: (confessionCount as any)?.count ?? 0,
        clubs: (clubCount as any)?.count ?? 0,
      }}
    />
  );
}
