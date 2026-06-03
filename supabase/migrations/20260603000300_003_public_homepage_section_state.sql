begin;

-- Public storefront reads must tell three section states apart:
--   1. section missing (migration not applied)  -> caller uses safe fallback
--   2. section present but is_enabled = false     -> caller hides the section
--   3. section present and is_enabled = true      -> caller renders content
--
-- The original policy only returned rows where is_enabled = true, so a disabled
-- section was indistinguishable from a missing one and the storefront fell back
-- to default (enabled) content even though an admin had turned the section off.
--
-- Allow anon/authenticated to read homepage section ROWS even when disabled, so
-- state (2) is detectable. Non-homepage sections keep the prior behavior
-- (readable only when enabled), so disabled/private non-homepage sections are
-- not exposed. Content items stay gated by cms_section_items_public_read_enabled,
-- which still requires the parent section to be enabled, so a disabled homepage
-- section exposes only its display config (colors, autoplay), never item content.
drop policy if exists cms_sections_public_read_enabled on public.cms_sections;
drop policy if exists cms_sections_public_read on public.cms_sections;
create policy cms_sections_public_read
on public.cms_sections
for select
to anon, authenticated
using (
  is_enabled
  or section_key like 'homepage.%'
);

commit;
