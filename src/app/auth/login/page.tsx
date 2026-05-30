"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        router.push("/app/feed");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] 
                        bg-glint-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Link href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Glint</span>
          </div>

          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm mb-8">Sign in to your campus account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@college.edu"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                           placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                           focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                             placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                             focus:ring-1 focus:ring-glint-500/30 transition-all text-sm pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/auth/forgot-password"
                  className="text-glint-400 text-xs hover:text-glint-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold 
                         rounded-xl shadow-lg shadow-glint-500/25 hover:shadow-glint-500/40 
                         hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            New to campus?{" "}
            <Link href="/auth/signup" className="text-glint-400 hover:text-glint-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
