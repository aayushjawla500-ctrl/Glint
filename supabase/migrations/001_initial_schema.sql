-- =============================================
-- GLINT CAMPUS PLATFORM - SUPABASE SCHEMA
-- =============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =============================================
-- COLLEGES TABLE
-- =============================================
create table if not exists public.colleges (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  location text,
  logo_url text,
  website text,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PROFILES TABLE
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  college_id uuid references public.colleges(id) on delete set null,
  full_name text not null,
  username text not null unique,
  email text not null unique,
  avatar_url text,
  bio text,
  branch text,
  year integer check (year between 1 and 6),
  skills text[],
  interests text[],
  instagram_url text,
  linkedin_url text,
  github_url text,
  is_admin boolean default false,
  is_banned boolean default false,
  notification_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- POSTS TABLE
-- =============================================
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id) on delete cascade,
  content text not null,
  image_url text,
  is_pinned boolean default false,
  is_announcement boolean default false,
  like_count integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- COMMENTS TABLE
-- =============================================
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- LIKES TABLE
-- =============================================
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  confession_id uuid references public.confessions(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  created_at timestamptz default now(),
  unique(user_id, post_id),
  unique(user_id, confession_id),
  check (
    (post_id is not null and confession_id is null) or
    (post_id is null and confession_id is not null)
  )
);

-- =============================================
-- CONFESSIONS TABLE
-- =============================================
create table if not exists public.confessions (
  id uuid primary key default uuid_generate_v4(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  content text not null,
  tag text default 'general',
  like_count integer default 0,
  comment_count integer default 0,
  is_approved boolean default true,
  is_flagged boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CONFESSION COMMENTS TABLE
-- =============================================
create table if not exists public.confession_comments (
  id uuid primary key default uuid_generate_v4(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- MARKETPLACE ITEMS TABLE
-- =============================================
create table if not exists public.marketplace_items (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  category text not null check (category in ('Books', 'Electronics', 'Hostel', 'Fashion', 'Gaming', 'Others')),
  condition text check (condition in ('New', 'Like New', 'Good', 'Fair')),
  is_sold boolean default false,
  is_active boolean default true,
  contact_info text,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- MARKETPLACE MESSAGES TABLE
-- =============================================
create table if not exists public.marketplace_messages (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.marketplace_items(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- CLUBS TABLE
-- =============================================
create table if not exists public.clubs (
  id uuid primary key default uuid_generate_v4(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  banner_url text,
  avatar_url text,
  category text,
  tags text[],
  member_count integer default 1,
  is_private boolean default false,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(college_id, slug)
);

-- =============================================
-- CLUB MEMBERS TABLE
-- =============================================
create table if not exists public.club_members (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  role text default 'member' check (role in ('admin', 'moderator', 'member')),
  joined_at timestamptz default now(),
  unique(club_id, user_id)
);

-- =============================================
-- EVENTS TABLE
-- =============================================
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete set null,
  title text not null,
  description text,
  banner_url text,
  location text,
  venue text,
  event_date timestamptz not null,
  end_date timestamptz,
  category text,
  tags text[],
  interested_count integer default 0,
  is_featured boolean default false,
  is_cancelled boolean default false,
  registration_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- EVENT INTERESTS TABLE
-- =============================================
create table if not exists public.event_interests (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- =============================================
-- REPORTS TABLE
-- =============================================
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  target_type text not null check (target_type in ('post', 'confession', 'marketplace_item', 'profile', 'club', 'comment')),
  target_id uuid not null,
  reason text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  type text not null check (type in ('like', 'comment', 'follow', 'club_invite', 'event', 'announcement', 'marketplace', 'system')),
  title text not null,
  body text,
  action_url text,
  actor_id uuid references public.profiles(id),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- FOLLOWS TABLE
-- =============================================
create table if not exists public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  college_id uuid not null references public.colleges(id),
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index if not exists idx_posts_college_id on public.posts(college_id);
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_pinned on public.posts(is_pinned) where is_pinned = true;

create index if not exists idx_confessions_college_id on public.confessions(college_id);
create index if not exists idx_confessions_created_at on public.confessions(created_at desc);
create index if not exists idx_confessions_likes on public.confessions(like_count desc);

create index if not exists idx_marketplace_college_id on public.marketplace_items(college_id);
create index if not exists idx_marketplace_category on public.marketplace_items(category);
create index if not exists idx_marketplace_active on public.marketplace_items(is_active, is_sold);

create index if not exists idx_clubs_college_id on public.clubs(college_id);
create index if not exists idx_club_members_user on public.club_members(user_id);
create index if not exists idx_club_members_club on public.club_members(club_id);

create index if not exists idx_events_college_id on public.events(college_id);
create index if not exists idx_events_date on public.events(event_date);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_likes_post on public.likes(post_id);
create index if not exists idx_comments_post on public.comments(post_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.colleges enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.confessions enable row level security;
alter table public.confession_comments enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.events enable row level security;
alter table public.event_interests enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.follows enable row level security;

-- Colleges: anyone can read
create policy "Colleges are publicly readable" on public.colleges for select using (true);

-- Profiles: users can read same college profiles
create policy "Profiles readable by same college" on public.profiles
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
    or id = auth.uid()
  );

create policy "Users can update own profile" on public.profiles
  for update using (id = auth.uid());

create policy "Users can insert own profile" on public.profiles
  for insert with check (id = auth.uid());

-- Posts: college-isolated
create policy "Posts readable by same college" on public.posts
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Authenticated users can create posts" on public.posts
  for insert with check (
    auth.uid() = user_id and
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Users can update own posts" on public.posts
  for update using (user_id = auth.uid());

create policy "Users can delete own posts" on public.posts
  for delete using (
    user_id = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Comments: college-isolated
create policy "Comments readable by same college" on public.comments
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments" on public.comments
  for delete using (user_id = auth.uid());

-- Likes
create policy "Likes readable by same college" on public.likes
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Users can like" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike" on public.likes
  for delete using (user_id = auth.uid());

-- Confessions: anonymous, college-isolated
create policy "Confessions readable by same college" on public.confessions
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
    and is_approved = true
  );

create policy "Authenticated users can post confessions" on public.confessions
  for insert with check (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

-- Marketplace: college-isolated
create policy "Marketplace readable by same college" on public.marketplace_items
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Users can create marketplace items" on public.marketplace_items
  for insert with check (
    auth.uid() = seller_id and
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Sellers can update own items" on public.marketplace_items
  for update using (seller_id = auth.uid());

create policy "Sellers can delete own items" on public.marketplace_items
  for delete using (seller_id = auth.uid());

-- Clubs: college-isolated
create policy "Clubs readable by same college" on public.clubs
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Authenticated users can create clubs" on public.clubs
  for insert with check (
    auth.uid() = creator_id and
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Club admins can update clubs" on public.clubs
  for update using (
    creator_id = auth.uid() or
    exists (
      select 1 from public.club_members
      where club_id = clubs.id and user_id = auth.uid() and role = 'admin'
    )
  );

-- Club Members
create policy "Club members readable by same college" on public.club_members
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Users can join clubs" on public.club_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave clubs" on public.club_members
  for delete using (user_id = auth.uid());

-- Events: college-isolated
create policy "Events readable by same college" on public.events
  for select using (
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Authenticated users can create events" on public.events
  for insert with check (
    auth.uid() = organizer_id and
    college_id = (select college_id from public.profiles where id = auth.uid())
  );

-- Notifications: private to user
create policy "Users can read own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "System can create notifications" on public.notifications
  for insert with check (true);

create policy "Users can mark own notifications read" on public.notifications
  for update using (user_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_posts_updated_at before update on public.posts
  for each row execute function public.handle_updated_at();

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_marketplace_updated_at before update on public.marketplace_items
  for each row execute function public.handle_updated_at();

create trigger handle_clubs_updated_at before update on public.clubs
  for each row execute function public.handle_updated_at();

-- Update post like count on like/unlike
create or replace function public.update_post_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.post_id is not null then
    update public.posts set like_count = like_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' and OLD.post_id is not null then
    update public.posts set like_count = greatest(0, like_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_post_likes
  after insert or delete on public.likes
  for each row execute function public.update_post_like_count();

-- Update comment count on posts
create or replace function public.update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_comment_count
  after insert or delete on public.comments
  for each row execute function public.update_post_comment_count();

-- Update confession like count
create or replace function public.update_confession_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.confession_id is not null then
    update public.confessions set like_count = like_count + 1 where id = NEW.confession_id;
  elsif TG_OP = 'DELETE' and OLD.confession_id is not null then
    update public.confessions set like_count = greatest(0, like_count - 1) where id = OLD.confession_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_confession_likes
  after insert or delete on public.likes
  for each row execute function public.update_confession_like_count();

-- Update club member count
create or replace function public.update_club_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.clubs set member_count = member_count + 1 where id = NEW.club_id;
  elsif TG_OP = 'DELETE' then
    update public.clubs set member_count = greatest(0, member_count - 1) where id = OLD.club_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_club_members
  after insert or delete on public.club_members
  for each row execute function public.update_club_member_count();

-- Update event interested count
create or replace function public.update_event_interest_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.events set interested_count = interested_count + 1 where id = NEW.event_id;
  elsif TG_OP = 'DELETE' then
    update public.events set interested_count = greatest(0, interested_count - 1) where id = OLD.event_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_event_interests
  after insert or delete on public.event_interests
  for each row execute function public.update_event_interest_count();

-- Handle new user signup - create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- =============================================
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);
-- insert into storage.buckets (id, name, public) values ('marketplace-images', 'marketplace-images', true);
-- insert into storage.buckets (id, name, public) values ('club-images', 'club-images', true);
-- insert into storage.buckets (id, name, public) values ('event-banners', 'event-banners', true);

-- =============================================
-- SEED DATA
-- =============================================
insert into public.colleges (name, slug, location, verified) values
  ('Indian Institute of Technology Delhi', 'iit-delhi', 'New Delhi, India', true),
  ('Delhi University', 'delhi-university', 'Delhi, India', true),
  ('BITS Pilani', 'bits-pilani', 'Pilani, Rajasthan, India', true),
  ('VIT University', 'vit', 'Vellore, Tamil Nadu, India', true)
on conflict (slug) do nothing;
