-- Optional social profile URLs for each store (public menu hero).
-- Run in the Supabase SQL editor (safe to re-run).
alter table public.restaurants add column if not exists instagram_url text;
alter table public.restaurants add column if not exists tiktok_url text;
alter table public.restaurants add column if not exists facebook_url text;
alter table public.restaurants add column if not exists twitter_url text;
alter table public.restaurants add column if not exists youtube_url text;
