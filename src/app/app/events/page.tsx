import { createClient } from "@/lib/supabase/server";
import EventsClient from "@/components/events/EventsClient";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user!.id)
    .single();

  const { data: events } = await supabase
    .from("events")
    .select("*, organizer:profiles(id, full_name, username, avatar_url)")
    .eq("college_id", profile?.college_id)
    .eq("is_cancelled", false)
    .gte("event_date", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("event_date", { ascending: true })
    .limit(10);

  const { data: interests } = await supabase
    .from("event_interests")
    .select("event_id")
    .eq("user_id", user!.id);

  const interestedIds = new Set(interests?.map((i) => i.event_id));

  const initial = (events || []).map((e) => ({
    ...e,
    is_interested: interestedIds.has(e.id),
  }));

  return <EventsClient initialEvents={initial} userId={user!.id} />;
}
