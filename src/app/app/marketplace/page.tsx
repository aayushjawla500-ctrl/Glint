import { createClient } from "@/lib/supabase/server";
import MarketplaceClient from "@/components/marketplace/MarketplaceClient";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user!.id)
    .single();

  const { data: items } = await supabase
    .from("marketplace_items")
    .select("*, seller:profiles(id, full_name, username, avatar_url)")
    .eq("college_id", profile?.college_id)
    .eq("is_active", true)
    .eq("is_sold", false)
    .order("created_at", { ascending: false })
    .limit(12);

  return <MarketplaceClient profile={profile!} initialItems={items || []} />;
}
