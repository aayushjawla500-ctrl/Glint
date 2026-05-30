import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center shadow-xl shadow-glint-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-glint-500 to-aurora-pink opacity-40 blur-md animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-glint-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
