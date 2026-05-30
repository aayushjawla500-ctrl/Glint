-- =============================================
-- SUPABASE STORAGE SETUP
-- Run this in the Supabase SQL Editor
-- =============================================

-- Create buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',            'avatars',            true, 5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('post-images',        'post-images',        true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('marketplace-images', 'marketplace-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('club-images',        'club-images',        true, 5242880,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('event-banners',      'event-banners',      true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- ─── AVATARS ───────────────────────────────────────────────────
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── POST IMAGES ───────────────────────────────────────────────
create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own post images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── MARKETPLACE IMAGES ────────────────────────────────────────
create policy "Marketplace images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'marketplace-images');

create policy "Authenticated users can upload marketplace images"
  on storage.objects for insert
  with check (
    bucket_id = 'marketplace-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own marketplace images"
  on storage.objects for delete
  using (
    bucket_id = 'marketplace-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── CLUB IMAGES ───────────────────────────────────────────────
create policy "Club images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'club-images');

create policy "Authenticated users can upload club images"
  on storage.objects for insert
  with check (
    bucket_id = 'club-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── EVENT BANNERS ─────────────────────────────────────────────
create policy "Event banners are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'event-banners');

create policy "Authenticated users can upload event banners"
  on storage.objects for insert
  with check (
    bucket_id = 'event-banners'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
