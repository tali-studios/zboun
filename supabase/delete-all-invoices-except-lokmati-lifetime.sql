-- Delete all subscription invoices and payment records.
-- Lokmati should remain billing_exempt (lifetime free) — no invoices needed for them.
-- Run once in Supabase SQL editor.

-- Ensure Lokmati is lifetime free
update public.restaurants
set billing_exempt = true
where name ilike '%lokmati%'
   or slug ilike '%lokmati%';

-- Payments cascade from invoices, but delete explicitly for clarity
delete from public.payments
where invoice_id in (select id from public.invoices);

delete from public.invoices;
