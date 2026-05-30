import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/layout/AppSidebar";
import AppNavbar from "@/components/layout/AppNavbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] flex">
      {/* Sidebar */}
      <AppSidebar profile={profile} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-64 transition-all duration-300">
        <AppNavbar profile={profile} />
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
