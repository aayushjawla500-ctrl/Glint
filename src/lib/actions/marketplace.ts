"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceCategory, MarketplaceCondition } from "@/types";

export async function createMarketplaceItem(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { error: "College not set" };

  const imageFile = formData.get("image") as File | null;
  let image_url: string | undefined;

  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("marketplace-images")
      .upload(fileName, imageFile);

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from("marketplace-images")
      .getPublicUrl(uploadData.path);

    image_url = publicUrl;
  }

  const { error } = await supabase.from("marketplace_items").insert({
    seller_id: user.id,
    college_id: profile.college_id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category") as MarketplaceCategory,
    condition: formData.get("condition") as MarketplaceCondition,
    contact_info: formData.get("contact_info") as string,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/app/marketplace");
  return { success: true };
}

export async function getMarketplaceItems(category?: string, page = 0, limit = 12) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id) return { data: [] };

  let query = supabase
    .from("marketplace_items")
    .select(`*, seller:profiles(id, full_name, username, avatar_url)`)
    .eq("college_id", profile.college_id)
    .eq("is_active", true)
    .eq("is_sold", false)
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };

  return { data: data || [], hasMore: (data?.length || 0) === limit };
}

export async function markAsSold(itemId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("marketplace_items")
    .update({ is_sold: true })
    .eq("id", itemId)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/marketplace");
  return { success: true };
}

export async function deleteMarketplaceItem(itemId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("marketplace_items")
    .delete()
    .eq("id", itemId)
    .eq("seller_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/marketplace");
  return { success: true };
}
