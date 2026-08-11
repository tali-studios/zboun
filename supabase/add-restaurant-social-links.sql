-- Optional social profile URLs for each store (public menu hero).
alter table public.restaurants
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text,
  add column if not exists twitter_url text,
  add column if not exists youtube_url text;
