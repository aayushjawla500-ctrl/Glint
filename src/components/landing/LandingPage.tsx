"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Zap, Shield, Users, ShoppingBag, MessageCircle, Calendar,
  ChevronRight, Star, Heart, Flame, BookOpen, Laptop, Shirt,
  ArrowRight, Globe, Lock, TrendingUp, Moon, Sun, Menu, X,
} from "lucide-react";

// ============================================================
// FLOATING CARD
// ============================================================
function FloatingCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3"
          : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Glint
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {["Home", "Features", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white 
                         rounded-lg hover:bg-white/10 transition-all duration-150"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white 
                       hover:bg-white/10 rounded-xl transition-all"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white 
                       text-sm font-semibold rounded-xl shadow-lg shadow-glint-500/30 
                       hover:shadow-glint-500/50 hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl bg-white/10 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 pb-6"
          >
            <div className="flex flex-col gap-2 pt-4">
              {["Home", "Features", "About"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <hr className="border-white/10 my-2" />
              <Link href="/auth/login"
                className="px-4 py-3 text-center text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >Login</Link>
              <Link href="/auth/signup"
                className="px-4 py-3 text-center bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl"
              >Get Started →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ============================================================
// HERO SECTION
// ============================================================
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060611]" id="home">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] 
                        bg-glint-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] 
                        bg-aurora-pink/10 rounded-full blur-[100px]" 
             style={{ animation: "float 6s ease-in-out infinite" }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] 
                        bg-aurora-cyan/10 rounded-full blur-[100px]"
             style={{ animation: "float 6s ease-in-out infinite 2s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-glint-500/10 border border-glint-500/30 text-glint-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Now available for Indian colleges
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-6xl md:text-8xl text-white leading-[1.05] tracking-tight mb-6"
        >
          All Your Campus,
          <br />
          <span className="bg-gradient-to-r from-glint-400 via-aurora-violet to-aurora-pink 
                           bg-clip-text text-transparent">
            In One Place
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Connect, discover, buy, share, and experience campus life beautifully. 
          Your private ecosystem — only for your college.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
                       from-glint-600 to-glint-500 text-white font-semibold text-lg rounded-2xl 
                       shadow-2xl shadow-glint-500/30 hover:shadow-glint-500/50 
                       hover:scale-105 transition-all duration-200"
          >
            Join Your Campus
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 
                       text-white font-medium text-lg rounded-2xl hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-14 text-white/40 text-sm"
        >
          <div className="flex -space-x-2">
            {["6366f1", "ec4899", "06b6d4", "10b981", "f59e0b"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#060611]"
                style={{ backgroundColor: `#${c}` }} />
            ))}
          </div>
          <span>Trusted by <strong className="text-white/70">12,000+</strong> students</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </motion.div>

        {/* Floating UI cards */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          {/* Main app preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 px-3 py-1 bg-white/5 rounded-md text-white/30 text-xs">
                  app.glint.campus/feed
                </div>
              </div>
              {/* Mock feed */}
              <div className="p-6 space-y-4">
                {[
                  { name: "Aryan Verma", content: "Just finished my ML project 🎉 Anyone want to collaborate on the upcoming hackathon?", likes: 47, comments: 12, avatar: "6366f1", pinned: true },
                  { name: "Priya Sharma", content: "The library is having extended hours this week for exams. Pass it on 📚", likes: 128, comments: 34, avatar: "ec4899", pinned: false },
                  { name: "Rohan Mehta", content: "Food at the new canteen is actually fire ngl 🔥", likes: 89, comments: 21, avatar: "10b981", pinned: false },
                ].map((post, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.15 }}
                    className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: `#${post.avatar}` }}>
                      {post.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{post.name}</span>
                        {post.pinned && (
                          <span className="px-1.5 py-0.5 bg-glint-500/20 text-glint-400 text-xs rounded-md">📌 Pinned</span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-white/30 text-xs">
                        <span className="flex items-center gap-1">❤️ {post.likes}</span>
                        <span className="flex items-center gap-1">💬 {post.comments}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating side cards */}
          <FloatingCard delay={0.9} className="absolute -left-4 top-8 hidden lg:block">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-aurora-pink/20 to-aurora-violet/20 
                           border border-white/10 backdrop-blur-xl w-52 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-aurora-pink/30 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-aurora-pink" />
                </div>
                <span className="text-white/90 text-xs font-semibold">Confession #1247</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                "I study at 3am when the whole campus is asleep. It's actually the best time 🌙"
              </p>
              <div className="flex items-center gap-3 mt-3 text-white/40 text-xs">
                <span>❤️ 234</span>
                <span>💬 18</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={1.1} className="absolute -right-4 top-12 hidden lg:block">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-glint-500/20 
                           border border-white/10 backdrop-blur-xl w-52 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-aurora-cyan/30 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-aurora-cyan" />
                </div>
                <span className="text-white/90 text-xs font-semibold">New Listing</span>
              </div>
              <p className="text-white/80 text-sm font-semibold">Data Structures Book</p>
              <p className="text-white/40 text-xs mt-0.5">Like New • CS Dept</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-aurora-cyan font-bold text-base">₹299</span>
                <span className="px-2 py-0.5 bg-aurora-cyan/20 text-aurora-cyan text-xs rounded-lg">Available</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={1.3} className="absolute -right-4 bottom-4 hidden lg:block">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-aurora-emerald/20 to-glint-600/20 
                           border border-white/10 backdrop-blur-xl w-52 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-aurora-emerald/30 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-aurora-emerald" />
                </div>
                <span className="text-white/90 text-xs font-semibold">Upcoming Event</span>
              </div>
              <p className="text-white/80 text-sm font-semibold">HackFest 2025</p>
              <p className="text-white/40 text-xs mt-0.5">Dec 15 • Main Auditorium</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-1">
                  {["6366f1", "ec4899", "10b981"].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-slate-800"
                      style={{ backgroundColor: `#${c}` }} />
                  ))}
                </div>
                <span className="text-white/40 text-xs">+847 interested</span>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FEATURES SECTION
// ============================================================
const features = [
  {
    icon: Users,
    title: "Campus Feed",
    description: "Instagram-style posts with likes, comments, and trending content. Pinned announcements from admin.",
    gradient: "from-glint-500 to-aurora-violet",
    glow: "shadow-glint-500/20",
  },
  {
    icon: MessageCircle,
    title: "Anonymous Confessions",
    description: "Post your thoughts anonymously. React, comment, and discover what campus is really thinking.",
    gradient: "from-aurora-pink to-red-500",
    glow: "shadow-aurora-pink/20",
  },
  {
    icon: ShoppingBag,
    title: "Campus Marketplace",
    description: "Buy and sell within your campus. Books, electronics, fashion — all in one secure marketplace.",
    gradient: "from-aurora-cyan to-blue-500",
    glow: "shadow-aurora-cyan/20",
  },
  {
    icon: Globe,
    title: "Clubs & Communities",
    description: "Join or create clubs. Build communities around shared interests and passions.",
    gradient: "from-aurora-emerald to-teal-500",
    glow: "shadow-aurora-emerald/20",
  },
  {
    icon: Calendar,
    title: "Campus Events",
    description: "Never miss a hackathon, fest, or seminar. Discover, RSVP, and stay in the loop.",
    gradient: "from-orange-500 to-amber-400",
    glow: "shadow-orange-500/20",
  },
  {
    icon: Lock,
    title: "College-Isolated",
    description: "Every college is a private ecosystem. Your campus, only for your campus community.",
    gradient: "from-purple-500 to-glint-600",
    glow: "shadow-purple-500/20",
  },
];

function Features() {
  return (
    <section id="features" className="py-32 bg-[#060611] relative">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                           bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Everything your campus needs
          </span>
          <h2 className="font-display font-bold text-5xl md:text-6xl text-white mb-5">
            One platform.
            <br />
            <span className="gradient-text">Infinite possibilities.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Built with the features you actually need, designed to be addictive in all the right ways.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] 
                         hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300
                         shadow-xl hover:shadow-2xl ${f.glow}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} 
                              flex items-center justify-center mb-5 shadow-lg`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// MARKETPLACE PREVIEW
// ============================================================
const marketplaceItems = [
  { title: "Engineering Mathematics Vol. 2", price: "₹450", category: "Books", condition: "Like New", emoji: "📚", color: "from-blue-600 to-indigo-600" },
  { title: "MacBook Pro Charger", price: "₹1,200", category: "Electronics", condition: "Good", emoji: "💻", color: "from-slate-600 to-slate-500" },
  { title: "Double Bed Mattress", price: "₹2,500", category: "Hostel", condition: "Fair", emoji: "🛏️", color: "from-amber-600 to-orange-600" },
  { title: "Nike Air Force 1 (UK 9)", price: "₹3,800", category: "Fashion", condition: "New", emoji: "👟", color: "from-pink-600 to-rose-600" },
  { title: "PS5 Controller", price: "₹2,999", category: "Gaming", condition: "Like New", emoji: "🎮", color: "from-purple-600 to-violet-600" },
  { title: "Scientific Calculator", price: "₹350", category: "Electronics", condition: "Good", emoji: "🔢", color: "from-green-600 to-emerald-600" },
];

function MarketplacePreview() {
  return (
    <section className="py-32 bg-[#070712] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] 
                      bg-aurora-cyan/10 rounded-full blur-[100px]" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                           bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-sm font-medium mb-6">
            <ShoppingBag className="w-3.5 h-3.5" />
            Campus Marketplace
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Buy & Sell Within
            <span className="text-aurora-cyan"> Your Campus</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto">
            A trusted marketplace where only your fellow students buy and sell. No strangers, just campusmates.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {marketplaceItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] 
                         hover:border-white/15 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} 
                              flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {item.emoji}
              </div>
              <h3 className="text-white font-semibold text-sm leading-tight mb-1">{item.title}</h3>
              <p className="text-white/40 text-xs mb-3">{item.category} • {item.condition}</p>
              <div className="flex items-center justify-between">
                <span className="text-aurora-cyan font-bold text-lg">{item.price}</span>
                <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-lg">
                  Contact Seller
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-aurora-cyan/10 border border-aurora-cyan/20 
                       text-aurora-cyan font-medium rounded-xl hover:bg-aurora-cyan/20 transition-all"
          >
            Browse Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// CONFESSIONS PREVIEW
// ============================================================
const confessions = [
  { content: "The coding lab AC is set to absolute zero. I wear a jacket to practice LeetCode.", tag: "funny", likes: 342 },
  { content: "To the person who returns library books late every time... we need to talk.", tag: "rant", likes: 156 },
  { content: "I have a crush on someone in my Data Structures class and they always helps me debug. Not sure if it's the code or them 💀", tag: "crush", likes: 891 },
  { content: "Real talk: the 8 AM classes should be illegal. Who approved this schedule?", tag: "rant", likes: 2104 },
  { content: "Successfully convinced my prof to push deadline by sending a 500-word email at 11:58 PM. Peak college life.", tag: "funny", likes: 673 },
  { content: "I actually love studying here. The campus is beautiful at night. Not ashamed.", tag: "general", likes: 234 },
];

function ConfessionsPreview() {
  return (
    <section className="py-32 bg-[#060611] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] 
                      bg-aurora-pink/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-aurora-pink/10 border border-aurora-pink/20 text-aurora-pink text-sm font-medium mb-6">
              <MessageCircle className="w-3.5 h-3.5" />
              Anonymous Confessions
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
              What campus is
              <br />
              <span className="text-aurora-pink">really thinking</span>
            </h2>
          </div>
          <p className="text-white/40 max-w-sm">
            Post anonymously. Share freely. No names, just honest college thoughts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confessions.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 
                         transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 
                                flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium">Anonymous</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.tag === "funny" ? "bg-yellow-500/20 text-yellow-400" :
                    c.tag === "rant" ? "bg-red-500/20 text-red-400" :
                    c.tag === "crush" ? "bg-pink-500/20 text-pink-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>#{c.tag}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">"{c.content}"</p>
              <div className="flex items-center gap-3 text-white/30 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {c.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Reply
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// WHY GLINT
// ============================================================
const stats = [
  { value: "50+", label: "Colleges", icon: Globe },
  { value: "12K+", label: "Students", icon: Users },
  { value: "100%", label: "Private", icon: Lock },
  { value: "4.9★", label: "Rating", icon: Star },
];

function WhyGlint() {
  return (
    <section id="about" className="py-32 bg-[#070712] relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-50" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-glint-500/10 border border-glint-500/20 text-glint-400 text-sm font-medium mb-8">
              <Flame className="w-3.5 h-3.5" />
              Why Glint?
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              Built for students,
              <br />
              <span className="gradient-text">by people who get it.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Generic social media isn't built for campus life. Glint is. Every feature 
              is crafted around the way college students actually connect, communicate, 
              and collaborate.
            </p>
            <div className="space-y-4">
              {[
                "College-isolated — no outsiders, ever",
                "Anonymous confessions with moderation",
                "Verified campus marketplace",
                "Real-time notifications and updates",
              ].map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-white/70"
                >
                  <div className="w-5 h-5 rounded-full bg-glint-500/20 border border-glint-500/40 
                                 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-glint-400" />
                  </div>
                  {point}
                </motion.div>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r 
                           from-glint-600 to-glint-500 text-white font-semibold rounded-2xl 
                           shadow-xl shadow-glint-500/30 hover:scale-105 transition-all"
              >
                Join Glint Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.07] 
                           hover:border-white/15 transition-all text-center"
              >
                <s.icon className="w-6 h-6 text-glint-400 mx-auto mb-4" />
                <div className="font-display font-bold text-4xl text-white mb-1">{s.value}</div>
                <div className="text-white/40 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="bg-[#040409] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-glint-500 to-aurora-pink flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Glint</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              The premium social platform built exclusively for college campuses.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {[
              { title: "Platform", links: ["Feed", "Marketplace", "Confessions", "Events"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <div className="space-y-2">
                  {col.links.map((link) => (
                    <p key={link} className="text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                      {link}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">© 2025 Glint. All rights reserved.</p>
          <p className="text-white/30 text-sm">Made with ❤️ for campus communities</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================
export default function LandingPage() {
  return (
    <div className="bg-[#060611]">
      <Navbar />
      <Hero />
      <Features />
      <MarketplacePreview />
      <ConfessionsPreview />
      <WhyGlint />
      <Footer />
    </div>
  );
}
