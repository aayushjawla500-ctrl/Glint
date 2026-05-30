"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import {
  Plus, Search, SlidersHorizontal, ShoppingBag, X, Loader2,
  Tag, MapPin, Phone, CheckCircle, ChevronDown, Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { createMarketplaceItem, getMarketplaceItems, markAsSold, deleteMarketplaceItem } from "@/lib/actions/marketplace";
import { formatPrice, formatTimeAgo, getAvatarUrl, MARKETPLACE_CATEGORIES } from "@/lib/utils";
import type { MarketplaceItem, Profile } from "@/types";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

// ─── Create Listing Modal ─────────────────────────────────────
function CreateListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createMarketplaceItem(fd);
      if (result?.error) toast.error(result.error);
      else { toast.success("Listing created!"); onCreated(); onClose(); }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Create Listing</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Image upload */}
            <div>
              <input ref={fileRef} type="file" name="image" accept="image/*" onChange={handleImage} className="hidden" id="item-img" />
              <label htmlFor="item-img" className="block cursor-pointer">
                {preview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-glint-400 hover:bg-glint-50/30 dark:hover:bg-glint-950/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-400 font-medium">Upload product photo</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
              <input name="title" required placeholder="e.g. Engineering Maths Book Vol. 2" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea name="description" rows={2} placeholder="Describe condition, edition, any defects..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price (₹) *</label>
                <input name="price" type="number" min="0" required placeholder="499" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Condition *</label>
                <select name="condition" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 transition-all [&>option]:bg-white dark:[&>option]:bg-slate-800">
                  <option value="">Select</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <label key={cat.value} className="cursor-pointer">
                    <input type="radio" name="category" value={cat.value} required className="sr-only peer" />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 peer-checked:border-glint-500 peer-checked:bg-glint-50 dark:peer-checked:bg-glint-950/30 peer-checked:text-glint-600 dark:peer-checked:text-glint-400 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-600">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Info *</label>
              <input name="contact_info" required placeholder="WhatsApp number or Instagram handle" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "List Item for Sale"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Item Detail Modal ────────────────────────────────────────
function ItemDetailModal({ item, currentUserId, onClose, onSold, onDelete }: {
  item: MarketplaceItem;
  currentUserId: string;
  onClose: () => void;
  onSold: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const seller = item.seller as Profile;
  const isOwner = item.seller_id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        {item.image_url ? (
          <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800">
            <Image src={item.image_url} alt={item.title} fill className="object-cover" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">{item.title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight">{item.title}</h3>
              <span className="text-2xl font-bold text-glint-600 dark:text-glint-400 whitespace-nowrap">{formatPrice(item.price)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg">{item.category}</span>
              {item.condition && <span className="px-2.5 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">{item.condition}</span>}
              {item.is_sold && <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-medium rounded-lg">Sold</span>}
            </div>
          </div>

          {item.description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>}

          {/* Seller info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <Image src={getAvatarUrl(seller)} alt={seller?.full_name || ""} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{seller?.full_name}</p>
              <p className="text-xs text-slate-400">Listed {formatTimeAgo(item.created_at)}</p>
            </div>
          </div>

          {/* Contact */}
          {item.contact_info && !isOwner && !item.is_sold && (
            <div className="flex items-center gap-2 p-3 bg-glint-50 dark:bg-glint-950/30 border border-glint-100 dark:border-glint-900/40 rounded-xl">
              <Phone className="w-4 h-4 text-glint-500 flex-shrink-0" />
              <span className="text-sm text-glint-700 dark:text-glint-300 font-medium">{item.contact_info}</span>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-3">
              {!item.is_sold && (
                <button
                  onClick={() => startTransition(async () => { await markAsSold(item.id); onSold(item.id); onClose(); toast.success("Marked as sold!"); })}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 text-green-600 dark:text-green-400 text-sm font-medium rounded-xl hover:bg-green-100 dark:hover:bg-green-950/50 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Sold
                </button>
              )}
              <button
                onClick={() => startTransition(async () => { await deleteMarketplaceItem(item.id); onDelete(item.id); onClose(); toast.success("Listing deleted"); })}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 transition-all"
              >
                <X className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Marketplace Card ─────────────────────────────────────────
function ItemCard({ item, onClick }: { item: MarketplaceItem; onClick: () => void }) {
  const cat = MARKETPLACE_CATEGORIES.find((c) => c.value === item.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all group"
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">{cat?.emoji ?? "📦"}</div>
        )}
        {item.is_sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-xl">SOLD</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
            {cat?.emoji} {item.category}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight mb-1 line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-glint-600 dark:text-glint-400">{formatPrice(item.price)}</span>
          {item.condition && (
            <span className="text-xs text-slate-400 dark:text-slate-500">{item.condition}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(item.created_at)}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Client ──────────────────────────────────────────────
export default function MarketplaceClient({
  profile,
  initialItems,
}: {
  profile: { id: string; college_id: string };
  initialItems: MarketplaceItem[];
}) {
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length === 12);
  const [loading, setLoading] = useState(false);

  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await getMarketplaceItems(activeCategory, page, 12);
    if (result.data?.length) {
      setItems((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        return [...prev, ...(result.data as MarketplaceItem[]).filter((i) => !ids.has(i.id))];
      });
      setPage((p) => p + 1);
      setHasMore(result.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [loading, hasMore, page, activeCategory]);

  if (inView && !loading && hasMore) loadMore();

  async function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(1);
    setHasMore(true);
    const result = await getMarketplaceItems(cat === "All" ? undefined : cat, 0, 12);
    setItems((result.data as MarketplaceItem[]) || []);
    setHasMore(result.hasMore ?? false);
  }

  const filtered = items.filter((i) =>
    searchQ === "" || i.title.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Campus Marketplace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Buy and sell within your campus</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-glint-600 to-glint-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-glint-500/25 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> List Item
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-glint-500/60 focus:ring-1 focus:ring-glint-500/20 transition-all"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
        {["All", ...MARKETPLACE_CATEGORIES.map((c) => c.value)].map((cat) => {
          const info = MARKETPLACE_CATEGORIES.find((c) => c.value === cat);
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-glint-500/10 dark:bg-glint-500/20 border-glint-300 dark:border-glint-700 text-glint-600 dark:text-glint-400"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {info && <span>{info.emoji}</span>}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No listings found</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to list something!</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 bg-glint-500 text-white text-sm font-semibold rounded-xl hover:bg-glint-600 transition-colors">
            Create Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        {!hasMore && filtered.length > 0 && <p className="text-xs text-slate-400">All listings loaded</p>}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateListingModal
            onClose={() => setShowCreate(false)}
            onCreated={async () => {
              const result = await getMarketplaceItems(undefined, 0, 12);
              setItems((result.data as MarketplaceItem[]) || []);
            }}
          />
        )}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            currentUserId={profile.id}
            onClose={() => setSelectedItem(null)}
            onSold={(id) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_sold: true } : i))}
            onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
