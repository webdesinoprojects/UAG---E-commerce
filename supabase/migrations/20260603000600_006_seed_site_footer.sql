begin;

insert into public.cms_sections (section_key, section_type, name, is_enabled, settings)
values (
  'homepage.footer',
  'site_footer',
  'Site Footer',
  true,
  '{
    "logoPath": "/images/logo/logo.png",
    "logoAlt": "UAG Logo",
    "copyrightText": "UAG URBN ARMOUR GEAR Copyright 2026"
  }'::jsonb
)
on conflict (section_key) do nothing;

with section as (
  select id from public.cms_sections where section_key = 'homepage.footer'
)
insert into public.cms_section_items (
  section_id, item_key, title, href, settings, sort_order, is_enabled
)
select
  section.id, seed.item_key, seed.title, seed.href, seed.settings, seed.sort_order, true
from section
cross join (
  values
    (
      'footer-link-1', 'ABOUT US', '/about-us',
      '{"kind": "link", "group": "primary"}'::jsonb,
      10
    ),
    (
      'footer-link-2', 'CONTACT US', '/contact-us',
      '{"kind": "link", "group": "primary"}'::jsonb,
      20
    ),
    (
      'footer-link-3', 'PRIVACY POLICY', '/privacy-policy',
      '{"kind": "link", "group": "primary"}'::jsonb,
      30
    ),
    (
      'footer-link-4', 'RETURN OR REFUND POLICY', '/return-policy',
      '{"kind": "link", "group": "primary"}'::jsonb,
      40
    ),
    (
      'footer-link-5', 'SHIPPING POLICY', '/shipping-policy',
      '{"kind": "link", "group": "primary"}'::jsonb,
      50
    ),
    (
      'footer-link-6', 'TERMS & CONDITIONS', '/terms-conditions',
      '{"kind": "link", "group": "primary"}'::jsonb,
      60
    ),
    (
      'footer-link-7', 'BLOGS', '/blogs',
      '{"kind": "link", "group": "secondary"}'::jsonb,
      70
    ),
    (
      'footer-link-8', 'FAQ', '/faqs',
      '{"kind": "link", "group": "secondary"}'::jsonb,
      80
    ),
    (
      'footer-social-1', 'Facebook', 'https://facebook.com',
      '{"kind": "social", "platform": "facebook", "backgroundColor": "#3b5998"}'::jsonb,
      110
    ),
    (
      'footer-social-2', 'Instagram', 'https://instagram.com',
      '{"kind": "social", "platform": "instagram", "backgroundColor": "#d946ef"}'::jsonb,
      120
    ),
    (
      'footer-social-3', 'YouTube', 'https://youtube.com',
      '{"kind": "social", "platform": "youtube", "backgroundColor": "#c4302b"}'::jsonb,
      130
    )
) as seed(item_key, title, href, settings, sort_order)
on conflict (section_id, item_key) do nothing;

commit;
