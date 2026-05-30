"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Sparkles, ArrowLeft, ArrowRight, Loader2,
  Check, User, GraduationCap,
} from "lucide-react";
import { signUpAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { College } from "@/types";

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [colleges, setColleges] = useState<College[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    college_id: "",
    branch: "",
    year: "1",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("colleges")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch colleges:", error.message);
          return;
        }
        if (data) setColleges(data);
      });
  }, []);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "full_name") {
      const username = value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20);
      setFormData((prev) => ({ ...prev, full_name: value, username }));
    }
  }

  function handleNext() {
    if (step === 1) {
      if (!formData.full_name || !formData.username || !formData.email || !formData.password) {
        toast.error("Please fill all fields");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }
    if (step === 2) {
      if (!formData.college_id || !formData.branch || !formData.year) {
        toast.error("Please fill all fields");
        return;
      }
    }
    setStep((prev) => (prev < 3 ? (prev + 1) as Step : prev));
  }

  async function handleSubmit() {
    if (!formData.college_id || !formData.branch || !formData.year) {
      toast.error("Please fill all fields");
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
    fd.set("year", formData.year);

    startTransition(async () => {
      const result = await signUpAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || "Account created!");
        setStep(3);
      }
    });
  }

  const steps = [
    { num: 1, label: "Account", icon: User },
    { num: 2, label: "College", icon: GraduationCap },
    { num: 3, label: "Done", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] 
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
          className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Glint</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > s.num
                    ? "bg-glint-500 text-white"
                    : step === s.num
                    ? "bg-glint-500/20 border border-glint-500 text-glint-400"
                    : "bg-white/5 border border-white/10 text-white/20"
                }`}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? "text-white/70" : "text-white/20"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`h-px w-8 ${step > s.num ? "bg-glint-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Account */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h1 className="font-display font-bold text-2xl text-white mb-1">Create account</h1>
                  <p className="text-white/40 text-sm">Join your campus community</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Full Name</label>
                  <input
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="Aryan Verma"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                               focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                    <input
                      value={formData.username}
                      onChange={(e) => updateField("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="aryan_verma"
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                                 placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                                 focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">College Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@iitd.ac.in"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                               focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white 
                                 placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                                 focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button onClick={handleNext}
                  className="w-full py-3.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold 
                             rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: College */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h1 className="font-display font-bold text-2xl text-white mb-1">Your college</h1>
                  <p className="text-white/40 text-sm">Tell us about your academic life</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">College</label>
                  <select
                    value={formData.college_id}
                    onChange={(e) => updateField("college_id", e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               focus:outline-none focus:border-glint-500/60 transition-all text-sm
                               [&>option]:bg-slate-900"
                  >
                    <option value="">
                      {colleges.length === 0 ? "Loading colleges..." : "Select your college"}
                    </option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Branch / Department</label>
                  <input
                    value={formData.branch}
                    onChange={(e) => updateField("branch", e.target.value)}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               placeholder:text-white/25 focus:outline-none focus:border-glint-500/60 
                               focus:ring-1 focus:ring-glint-500/30 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Year of Study</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => updateField("year", y.toString())}
                        className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                          formData.year === y.toString()
                            ? "bg-glint-500/20 border-glint-500 text-glint-400"
                            : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
                        }`}
                      >
                        {y === 6 ? "PhD" : `Year ${y}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white font-medium 
                               rounded-xl hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex-1 py-3.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold 
                               rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] 
                               transition-all disabled:opacity-60"
                  >
                    {isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <>Join Campus <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-glint-500/20 border-2 border-glint-500 
                               flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-glint-400" />
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-2">You're in! 🎉</h2>
                <p className="text-white/50 text-sm mb-8">
                  Check your email to verify your account, then you're all set to explore your campus.
                </p>
                <Link href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-glint-600 to-glint-500 
                             text-white font-semibold rounded-xl hover:scale-105 transition-all"
                >
                  Sign In to Glint
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <p className="text-center text-white/40 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-glint-400 hover:text-glint-300 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
