begin;

-- Homepage hero carousel section. Reuses the existing CMS tables created in
-- migration 001; no hero-specific tables are introduced in this pass.
insert into public.cms_sections (section_key, section_type, name, is_enabled, settings)
values (
  'homepage.hero_carousel',
  'hero_carousel',
  'Homepage Hero Carousel',
  true,
  '{
    "autoplaySeconds": 5,
    "loop": true,
    "pauseOnHover": true
  }'::jsonb
)
on conflict (section_key) do nothing;

-- Seed 8 slides mirroring the previously hardcoded hero content. Slide detail
-- that does not map to a dedicated column lives in settings JSON (image,
-- accentColor, badgeText, CTA labels, secondary href, features).
with section as (
  select id
  from public.cms_sections
  where section_key = 'homepage.hero_carousel'
)
insert into public.cms_section_items (
  section_id,
  item_key,
  title,
  subtitle,
  body,
  href,
  settings,
  sort_order,
  is_enabled
)
select
  section.id,
  seed.item_key,
  seed.title,
  seed.subtitle,
  seed.body,
  seed.href,
  seed.settings,
  seed.sort_order,
  true
from section
cross join (
  values
    (
      'slide-1',
      'EARBUDS 300 LITE',
      'Cybernetic Sound & Extra Bass',
      'Engineered for maximum sound isolation and heavy tactical environments. Complete with integrated case display control.',
      '/categories/earbuds',
      '{
        "image": "/images/carousel/banner1.png",
        "accentColor": "#fbbf24",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/earbuds",
        "features": [
          {"text": "Active Noise Cancellation", "icon": "volume"},
          {"text": "Sound Extra Bass Boost", "icon": "sparkles"}
        ]
      }'::jsonb,
      10
    ),
    (
      'slide-2',
      'PORTABLE SPEAKERS',
      'Powerful Audio & Ambient Glow',
      'Take the power of studio-grade acoustics anywhere. Rugged waterproof chassis with synchronized LED rings.',
      '/categories/bluetooth-speakers',
      '{
        "image": "/images/carousel/banner2.png",
        "accentColor": "#ef4444",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/bluetooth-speakers",
        "features": [
          {"text": "Rich Stereo Sound Output", "icon": "volume"},
          {"text": "Ambient RGB Illumination", "icon": "sparkles"}
        ]
      }'::jsonb,
      20
    ),
    (
      'slide-3',
      'TACTICAL WATCH PRO',
      'Military Grade Smart Watch',
      'Built to survive extreme conditions. Real-time biometric tracking, built-in GPS, and a robust battery life of 30 days.',
      '/categories/smart-watches',
      '{
        "image": "/images/carousel/banner1.png",
        "accentColor": "#34d399",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/smart-watches",
        "features": [
          {"text": "Advanced Biometric Sensors", "icon": "cpu"},
          {"text": "Impact-Resistant Bezel", "icon": "shield"}
        ]
      }'::jsonb,
      30
    ),
    (
      'slide-4',
      'POWER CORE SOLAR',
      'Heavy Duty Power Storage',
      'High capacity cells wrapped in shockproof silicone. Dual solar panels keep you charged up far off the grid.',
      '/categories/power-banks',
      '{
        "image": "/images/carousel/banner2.png",
        "accentColor": "#f97316",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/power-banks",
        "features": [
          {"text": "Fast Charge Tech", "icon": "zap"},
          {"text": "Built-In LED Flashlight", "icon": "sparkles"}
        ]
      }'::jsonb,
      40
    ),
    (
      'slide-5',
      'ARMOUR SPEED CABLE',
      'Indestructible Braided USB-C',
      'Reinforced with bulletproof fiber core. Supports up to 240W Power Delivery and high-speed data sync.',
      '/categories/data-cables',
      '{
        "image": "/images/carousel/banner1.png",
        "accentColor": "#60a5fa",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/data-cables",
        "features": [
          {"text": "240W Power Delivery", "icon": "zap"},
          {"text": "Kevlar Braided Shell", "icon": "link"}
        ]
      }'::jsonb,
      50
    ),
    (
      'slide-6',
      'AIRDOPES STUDIO ANC',
      'True Wireless Sound Shield',
      'Escape the noise. Hybrid ANC technology blocks out 40dB of ambient noise while preserving pristine vocals.',
      '/categories/earbuds',
      '{
        "image": "/images/carousel/banner2.png",
        "accentColor": "#c084fc",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/earbuds",
        "features": [
          {"text": "40dB Hybrid ANC", "icon": "volume"},
          {"text": "Low Latency Gaming Mode", "icon": "cpu"}
        ]
      }'::jsonb,
      60
    ),
    (
      'slide-7',
      'OMNI PARTY SPEAKER',
      'Ambient Audio Environment',
      'Double subwoofers deliver rich, thumping bass. Perfect for large open areas, outdoor events, and home theaters.',
      '/categories/bluetooth-speakers',
      '{
        "image": "/images/carousel/banner2.png",
        "accentColor": "#ec4899",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/bluetooth-speakers",
        "features": [
          {"text": "Wireless Stereo Pairing", "icon": "bluetooth"},
          {"text": "Rechargeable 24hr Battery", "icon": "zap"}
        ]
      }'::jsonb,
      70
    ),
    (
      'slide-8',
      'UAG ELITE ECOSYSTEM',
      'Complete Connected Gear',
      'Elevate your tech setup with matching protective cases, durable charging bricks, and premium wireless sound.',
      '/categories/smart-watches',
      '{
        "image": "/images/carousel/banner1.png",
        "accentColor": "#fbbf24",
        "badgeText": "Product Launch",
        "primaryCtaLabel": "Explore Now",
        "secondaryCtaLabel": "View Details",
        "secondaryCtaHref": "/categories/smart-watches",
        "features": [
          {"text": "Device Protection Shield", "icon": "shield"},
          {"text": "Sleek Industrial Aesthetics", "icon": "cpu"}
        ]
      }'::jsonb,
      80
    )
) as seed(item_key, title, subtitle, body, href, settings, sort_order)
on conflict (section_id, item_key) do nothing;

commit;
