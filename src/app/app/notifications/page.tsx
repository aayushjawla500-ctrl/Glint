import { createClient } from "@/lib/supabase/server";
import NotificationsClient from "@/components/layout/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, actor:profiles!actor_id(id, full_name, username, avatar_url)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(30);

  // Mark all as read
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user!.id)
    .eq("is_read", false);

  // Reset notification count
  await supabase
    .from("profiles")
    .update({ notification_count: 0 })
    .eq("id", user!.id);

  return <NotificationsClient notifications={notifications || []} />;
}
