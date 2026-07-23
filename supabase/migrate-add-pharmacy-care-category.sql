-- Included in migrate-fold-categories-into-subcategories.sql (section 1).
-- You do NOT need to run this file separately if you already ran that script.
--
-- Ensure stores tagged with legacy "Pharmacy" also have Beauty & Pharmacy.
update public.restaurants
set browse_sections = browse_sections || array['Beauty & Pharmacy']::text[]
where browse_sections @> array['Pharmacy']::text[]
  and not (browse_sections @> array['Beauty & Pharmacy']::text[]);
