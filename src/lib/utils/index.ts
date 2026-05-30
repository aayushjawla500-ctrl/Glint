import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarUrl(profile?: {
  avatar_url?: string;
  full_name: string;
  username: string;
}): string {
  if (profile?.avatar_url) return profile.avatar_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile?.full_name || "User"
  )}&background=6366f1&color=fff&bold=true`;
}

export const MARKETPLACE_CATEGORIES = [
  { value: "Books", label: "Books", emoji: "📚" },
  { value: "Electronics", label: "Electronics", emoji: "💻" },
  { value: "Hostel", label: "Hostel", emoji: "🏠" },
  { value: "Fashion", label: "Fashion", emoji: "👕" },
  { value: "Gaming", label: "Gaming", emoji: "🎮" },
  { value: "Others", label: "Others", emoji: "📦" },
] as const;

export const CONFESSION_TAGS = [
  { value: "general", label: "General", color: "bg-blue-500/20 text-blue-400" },
  { value: "crush", label: "Crush", color: "bg-pink-500/20 text-pink-400" },
  { value: "rant", label: "Rant", color: "bg-red-500/20 text-red-400" },
  { value: "advice", label: "Advice", color: "bg-green-500/20 text-green-400" },
  { value: "funny", label: "Funny", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "study", label: "Study", color: "bg-purple-500/20 text-purple-400" },
  { value: "hostel", label: "Hostel", color: "bg-orange-500/20 text-orange-400" },
] as const;

export const YEAR_LABELS: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
  5: "5th Year",
  6: "6th Year (PhD)",
};

export const CLUB_CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Academic",
  "Social",
  "Arts",
  "Music",
  "Gaming",
  "Entrepreneurship",
  "Others",
];

export const EVENT_CATEGORIES = [
  "Tech Talk",
  "Workshop",
  "Cultural",
  "Sports",
  "Hackathon",
  "Seminar",
  "Social",
  "Career",
  "Others",
];
