"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="font-display font-bold text-2xl text-white mb-3">Something went wrong</h1>
        <p className="text-white/40 mb-8 max-w-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-glint-500/30"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
