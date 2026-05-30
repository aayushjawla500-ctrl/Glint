"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-glint-600/15 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-6">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Glint</span>
          </div>

          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-glint-500/15 border border-glint-500/30 flex items-center justify-center mb-6">
                <Mail className="w-5 h-5 text-glint-400" />
              </div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Reset password</h1>
              <p className="text-white/40 text-sm mb-8">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@college.edu"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm mb-8">We've sent a password reset link to your email.</p>
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all">
                Back to Login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
