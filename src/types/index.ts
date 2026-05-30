// =============================================
// GLINT - TypeScript Types
// =============================================

export type College = {
  id: string;
  name: string;
  slug: string;
  location?: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  college_id?: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  branch?: string;
  year?: number;
  skills?: string[];
  interests?: string[];
  instagram_url?: string;
  linkedin_url?: string;
  github_url?: string;
  is_admin: boolean;
  is_banned: boolean;
  notification_count: number;
  created_at: string;
  updated_at: string;
  college?: College;
};

export type Post = {
  id: string;
  user_id: string;
  college_id: string;
  content: string;
  image_url?: string;
  is_pinned: boolean;
  is_announcement: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  user?: Profile;
  liked_by_me?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  college_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
};

export type Like = {
  id: string;
  user_id: string;
  post_id?: string;
  confession_id?: string;
  college_id: string;
  created_at: string;
};

export type Confession = {
  id: string;
  college_id: string;
  content: string;
  tag: string;
  like_count: number;
  comment_count: number;
  is_approved: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  liked_by_me?: boolean;
};

export type ConfessionComment = {
  id: string;
  confession_id: string;
  user_id: string;
  college_id: string;
  content: string;
  created_at: string;
  user?: Profile;
};

export type MarketplaceCategory = 'Books' | 'Electronics' | 'Hostel' | 'Fashion' | 'Gaming' | 'Others';
export type MarketplaceCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type MarketplaceItem = {
  id: string;
  seller_id: string;
  college_id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category: MarketplaceCategory;
  condition?: MarketplaceCondition;
  is_sold: boolean;
  is_active: boolean;
  contact_info?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  seller?: Profile;
};

export type Club = {
  id: string;
  college_id: string;
  creator_id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  avatar_url?: string;
  category?: string;
  tags?: string[];
  member_count: number;
  is_private: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  is_member?: boolean;
};

export type ClubMember = {
  id: string;
  club_id: string;
  user_id: string;
  college_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: Profile;
};

export type Event = {
  id: string;
  college_id: string;
  organizer_id: string;
  club_id?: string;
  title: string;
  description?: string;
  banner_url?: string;
  location?: string;
  venue?: string;
  event_date: string;
  end_date?: string;
  category?: string;
  tags?: string[];
  interested_count: number;
  is_featured: boolean;
  is_cancelled: boolean;
  registration_url?: string;
  created_at: string;
  updated_at: string;
  organizer?: Profile;
  club?: Club;
  is_interested?: boolean;
};

export type NotificationType = 'like' | 'comment' | 'follow' | 'club_invite' | 'event' | 'announcement' | 'marketplace' | 'system';

export type Notification = {
  id: string;
  user_id: string;
  college_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  action_url?: string;
  actor_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
};

export type Report = {
  id: string;
  reporter_id: string;
  college_id: string;
  target_type: 'post' | 'confession' | 'marketplace_item' | 'profile' | 'club' | 'comment';
  target_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
};

// =============================================
// FORM TYPES
// =============================================

export type SignUpFormData = {
  full_name: string;
  username: string;
  email: string;
  password: string;
  college_name: string;
  branch: string;
  year: number;
};

export type PostFormData = {
  content: string;
  image?: File;
};

export type MarketplaceFormData = {
  title: string;
  description: string;
  price: number;
  category: MarketplaceCategory;
  condition: MarketplaceCondition;
  contact_info: string;
  image?: File;
};

export type ClubFormData = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  is_private: boolean;
  avatar?: File;
  banner?: File;
};

export type EventFormData = {
  title: string;
  description: string;
  location: string;
  venue: string;
  event_date: string;
  end_date?: string;
  category: string;
  tags: string[];
  registration_url?: string;
  banner?: File;
};

// =============================================
// API RESPONSE TYPES
// =============================================

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

// =============================================
// DATABASE TYPES
// =============================================

export type Database = {
  public: {
    Tables: {
      colleges: { Row: College };
      profiles: { Row: Profile };
      posts: { Row: Post };
      comments: { Row: Comment };
      likes: { Row: Like };
      confessions: { Row: Confession };
      confession_comments: { Row: ConfessionComment };
      marketplace_items: { Row: MarketplaceItem };
      clubs: { Row: Club };
      club_members: { Row: ClubMember };
      events: { Row: Event };
      notifications: { Row: Notification };
      reports: { Row: Report };
    };
  };
};
