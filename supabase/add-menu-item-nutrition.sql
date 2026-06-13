alter table public.menu_items add column if not exists calories int check (calories is null or calories >= 0);
alter table public.menu_items add column if not exists protein_g numeric(8, 2) check (protein_g is null or protein_g >= 0);
