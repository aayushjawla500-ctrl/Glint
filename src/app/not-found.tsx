import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl font-display font-black text-white/10 mb-4">404</div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Page not found</h1>
        <p className="text-white/40 mb-8">This page doesn't exist or was removed.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-glint-500/30"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
