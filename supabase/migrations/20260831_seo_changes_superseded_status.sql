-- seo_changes: one more terminal status, `superseded`.
--
-- Why: `changes.propose_or_apply` asked its duplicate guard before it asked
-- whether it may apply, so a page carrying an open `proposed` row was
-- answered "duplicate" on every later run and the RPC was never called. 35
-- `loop:aeo` proposals from the shadow days were stuck that way, on pages
-- that would never have got their answer block.
--
-- Fixing the order means an apply can now land on a page that already has a
-- proposal queued. That proposal has to be closed, or (path, field) stays in
-- the open set forever and a lane could re-apply the same field run after
-- run with a slightly reworded value, which is the exact hazard the guard
-- was built to stop. `superseded` is that close: the row is history, it
-- never reached the page, and it must never be read as one that did.
--
-- Additive only. `sitemap.xml/route.ts` treats applied, verification_pending
-- and verified as landed; `superseded` is deliberately not one of them, so a
-- superseded proposal cannot move a lastmod.

alter table public.seo_changes drop constraint if exists seo_changes_status_check;

alter table public.seo_changes add constraint seo_changes_status_check
  check (status = any (array[
    'proposed'::text,
    'applied'::text,
    'verification_pending'::text,
    'verified'::text,
    'rolled_back'::text,
    'advisory_regression'::text,
    'superseded'::text
  ]));
