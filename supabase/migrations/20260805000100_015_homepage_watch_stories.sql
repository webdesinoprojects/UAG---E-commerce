begin;

-- The homepage Watch Stories editor reuses the shared CMS section/item model.
-- Local videos preserve the current storefront until an administrator replaces
-- them with ImageKit media assets from the CMS editor.
insert into public.cms_sections (
  section_key,
  section_type,
  name,
  is_enabled,
  settings
)
values (
  'homepage.watch_stories',
  'video_stories',
  'Homepage Watch Stories',
  true,
  '{"eyebrow":"OUR WORK","heading":"Watch Our","accentHeading":"Stories"}'::jsonb
)
on conflict (section_key) do nothing;

with section as (
  select id
  from public.cms_sections
  where section_key = 'homepage.watch_stories'
)
insert into public.cms_section_items (
  section_id,
  item_key,
  title,
  media_asset_id,
  settings,
  sort_order,
  is_enabled
)
select
  section.id,
  seed.item_key,
  seed.title,
  null,
  jsonb_build_object('localVideoPath', seed.video_path),
  seed.sort_order,
  true
from section
cross join (
  values
    ('story-1', 'Airdopes 2', '/videos/story1.mp4', 10),
    ('story-2', 'GM8 Pro', '/videos/story2.mp4', 20),
    ('story-3', 'Master Buds 2', '/videos/story3.mp4', 30),
    ('story-4', 'Latest Shoot', '/videos/story4.mp4', 40),
    ('story-5', 'AeroStrike HD', '/videos/story5.mp4', 50),
    ('story-6', 'Vital Watch', '/videos/story6.mp4', 60),
    ('story-7', 'Soundstage', '/videos/story7.mp4', 70),
    ('story-8', 'Solar Core', '/videos/story8.mp4', 80)
) as seed(item_key, title, video_path, sort_order)
on conflict (section_id, item_key) do nothing;

commit;
