"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const signUpSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  college_id: z.string().uuid("Please select a valid college"),
  branch: z.string().min(1, "Branch is required"),
  year: z.number().int().min(1).max(6),
});

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const raw = {
    full_name: formData.get("full_name") as string,
    username: (formData.get("username") as string).toLowerCase(),
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    college_id: formData.get("college_id") as string,
    branch: formData.get("branch") as string,
    year: parseInt(formData.get("year") as string),
  };

  const result = signUpSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Check username availability
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", raw.username)
    .single();

  if (existingUser) {
    return { error: "Username is already taken" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: raw.email,
    password: raw.password,
    options: {
      data: {
        full_name: raw.full_name,
        username: raw.username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: raw.full_name,
        username: raw.username,
        college_id: raw.college_id,
        branch: raw.branch,
        year: raw.year,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return { error: profileError.message };
    }
  }

  return {
    success: true,
    message: "Please check your email to verify your account",
  };
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/app/feed");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password reset link sent to your email" };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, college:colleges(*)")
    .eq("id", user.id)
    .single();

  return profile;
}

