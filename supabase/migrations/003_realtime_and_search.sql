-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================
-- Enable realtime for key tables
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.confession_comments;
alter publication supabase_realtime add table public.marketplace_messages;

-- =============================================
-- NOTIFICATION TRIGGERS
-- =============================================

-- Create notification when post is liked
create or replace function public.notify_on_like()
returns trigger as $$
declare
  v_post_owner uuid;
  v_college_id uuid;
  v_liker_name text;
begin
  if NEW.post_id is not null then
    select user_id, college_id into v_post_owner, v_college_id
    from public.posts where id = NEW.post_id;

    if v_post_owner != NEW.user_id then
      select full_name into v_liker_name from public.profiles where id = NEW.user_id;
      insert into public.notifications (user_id, college_id, type, title, body, actor_id, action_url)
      values (
        v_post_owner,
        v_college_id,
        'like',
        v_liker_name || ' liked your post',
        null,
        NEW.user_id,
        '/app/feed'
      );
      update public.profiles set notification_count = notification_count + 1 where id = v_post_owner;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on public.likes
  for each row execute function public.notify_on_like();

-- Create notification when post is commented
create or replace function public.notify_on_comment()
returns trigger as $$
declare
  v_post_owner uuid;
  v_commenter_name text;
begin
  select user_id into v_post_owner from public.posts where id = NEW.post_id;

  if v_post_owner != NEW.user_id then
    select full_name into v_commenter_name from public.profiles where id = NEW.user_id;
    insert into public.notifications (user_id, college_id, type, title, body, actor_id, action_url)
    values (
      v_post_owner,
      NEW.college_id,
      'comment',
      v_commenter_name || ' commented on your post',
      null,
      NEW.user_id,
      '/app/feed'
    );
    update public.profiles set notification_count = notification_count + 1 where id = v_post_owner;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- =============================================
-- SEARCH FUNCTIONS
-- =============================================

-- Full-text search for posts
create or replace function public.search_posts(
  p_college_id uuid,
  p_query text,
  p_limit int default 10
)
returns table(
  id uuid,
  content text,
  user_id uuid,
  like_count int,
  comment_count int,
  created_at timestamptz,
  rank real
) as $$
begin
  return query
  select
    p.id,
    p.content,
    p.user_id,
    p.like_count,
    p.comment_count,
    p.created_at,
    ts_rank(to_tsvector('english', p.content), plainto_tsquery('english', p_query)) as rank
  from public.posts p
  where p.college_id = p_college_id
    and to_tsvector('english', p.content) @@ plainto_tsquery('english', p_query)
  order by rank desc
  limit p_limit;
end;
$$ language plpgsql;

-- Search profiles by name or username
create or replace function public.search_profiles(
  p_college_id uuid,
  p_query text,
  p_limit int default 10
)
returns table(
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  branch text,
  year int
) as $$
begin
  return query
  select
    p.id, p.full_name, p.username, p.avatar_url, p.branch, p.year
  from public.profiles p
  where p.college_id = p_college_id
    and (
      p.full_name ilike '%' || p_query || '%'
      or p.username ilike '%' || p_query || '%'
    )
  limit p_limit;
end;
$$ language plpgsql;
