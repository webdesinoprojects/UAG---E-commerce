begin;

-- Homepage bento gallery + merchandising banners. Reuses the existing CMS
-- tables (migration 001); no new tables. Item detail that has no dedicated
-- column lives in settings JSON. media_asset_id is null for seed rows so the
-- storefront falls back to the local /images/... paths until an admin assigns
-- ImageKit media in /admin/media.

/* -------------------------------------------------------------------------- */
/* Bento gallery                                                              */
/* -------------------------------------------------------------------------- */
insert into public.cms_sections (section_key, section_type, name, is_enabled, settings)
values (
  'homepage.bento_gallery',
  'bento_gallery',
  'Homepage Bento Gallery',
  true,
  '{
    "eyebrow": "GALLERY SHOWCASE",
    "heading": "Engineered Ecosystem",
    "description": ""
  }'::jsonb
)
on conflict (section_key) do nothing;

with section as (
  select id from public.cms_sections where section_key = 'homepage.bento_gallery'
)
insert into public.cms_section_items (
  section_id, item_key, title, subtitle, body, href, media_asset_id, settings, sort_order, is_enabled
)
select
  section.id, seed.item_key, seed.title, seed.subtitle, seed.body, seed.href, null, seed.settings, seed.sort_order, true
from section
cross join (
  values
    (
      'bento-1', 'AeroStrike HD', 'Commercial Quadcopter',
      'Equipped with dual GPS tracking, 4K camera gimbal, and 40-minute flight cells.',
      '/products/uag-aerostrike-hd-camera-drone',
      '{"localImagePath": "/images/products/drone.png", "tileType": "product", "layout": "tall", "badgeText": "Air-Tech", "accentColor": "#f97316", "ctaLabel": "View Product"}'::jsonb,
      10
    ),
    (
      'bento-2', 'CYBER AUDIO LABS', 'Tactical Pro Gaming Essentials',
      'Engineered for immersive low-latency gameplay and crystal clear team communication.',
      '/products/uag-crystal-gaming-anc',
      '{"localImagePath": "/images/carousel/banner1.png", "tileType": "banner", "layout": "wide", "badgeText": "Studio Pro", "accentColor": "#f59e0b", "ctaLabel": "Shop Audio"}'::jsonb,
      20
    ),
    (
      'bento-3', 'Vital Smartwatch', 'Rugged Health Trackers',
      'Built-in GPS, 24/7 heart rate and SpO2 monitoring in a mil-grade IP68 chassis.',
      '/products/uag-elite-gps-sports-smartwatch',
      '{"localImagePath": "/images/categories/watches.png", "tileType": "product", "layout": "standard", "badgeText": "GPS Call", "accentColor": "#10b981", "ctaLabel": "View Product"}'::jsonb,
      30
    ),
    (
      'bento-4', 'Solar Power Core', '50K mAh Backup Battery',
      'Monocrystalline solar trickle charging with dual fast-charge USB-C output.',
      '/products/uag-solarcharge-rugged-powerbank',
      '{"localImagePath": "/images/categories/powerbanks.png", "tileType": "product", "layout": "standard", "badgeText": "Solar Fast", "accentColor": "#f97316", "ctaLabel": "View Product"}'::jsonb,
      40
    ),
    (
      'bento-5', 'OMNI SOUNDSTAGE', 'Ambient Audio Projection',
      'Heavy subwoofers with sync LED lights, optimized for wide outdoor acoustics.',
      '/products/uag-omnisound-portable-speaker',
      '{"localImagePath": "/images/carousel/banner2.png", "tileType": "banner", "layout": "wide", "badgeText": "IPX7 Sound", "accentColor": "#ef4444", "ctaLabel": "Shop Speakers"}'::jsonb,
      50
    ),
    (
      'bento-6', 'Pro ANC Earbuds', 'True Noise Shield Buds',
      'Hybrid ANC with transparency mode and 45 hours total playback.',
      '/products/uag-crystal-gaming-anc',
      '{"localImagePath": "/images/categories/earbuds.png", "tileType": "product", "layout": "standard", "badgeText": "ANC Mode", "accentColor": "#a855f7", "ctaLabel": "View Product"}'::jsonb,
      60
    ),
    (
      'bento-7', 'Sport Neckbands', 'Magnetic Sensor Buds',
      'Magnetic instant-connect sensors with 12 hours of bass-boosted playback.',
      '/products/uag-magnetic-sensor-neckband-pro',
      '{"localImagePath": "/images/categories/neckbands.png", "tileType": "product", "layout": "standard", "badgeText": "12hr Play", "accentColor": "#0ea5e9", "ctaLabel": "View Product"}'::jsonb,
      70
    ),
    (
      'bento-8', 'Armour Speed', '240W Heavy Duty USB-C',
      'Kevlar-reinforced braided cable with 240W Power Delivery and E-Marker chip.',
      '/products/uag-fastcharge-240w-braided-cable',
      '{"localImagePath": "/images/categories/cables.png", "tileType": "product", "layout": "standard", "badgeText": "240W Type-C", "accentColor": "#f59e0b", "ctaLabel": "View Product"}'::jsonb,
      80
    ),
    (
      'bento-9', 'Omni Speakers', 'Clear Bass Acoustics',
      'Dual 10W stereo speakers with a bass-reflex system and 12-hour battery.',
      '/products/uag-omnisound-portable-speaker',
      '{"localImagePath": "/images/categories/speakers.png", "tileType": "product", "layout": "standard", "badgeText": "True Bass", "accentColor": "#ec4899", "ctaLabel": "View Product"}'::jsonb,
      90
    )
) as seed(item_key, title, subtitle, body, href, settings, sort_order)
on conflict (section_id, item_key) do nothing;

/* -------------------------------------------------------------------------- */
/* Merchandising banners                                                      */
/* -------------------------------------------------------------------------- */
insert into public.cms_sections (section_key, section_type, name, is_enabled, settings)
values (
  'homepage.merchandising_banners',
  'merchandising_banners',
  'Homepage Merchandising Banners',
  true,
  '{
    "autoplaySeconds": 7,
    "eyebrow": "EXCLUSIVE LAUNCH"
  }'::jsonb
)
on conflict (section_key) do nothing;

with section as (
  select id from public.cms_sections where section_key = 'homepage.merchandising_banners'
)
insert into public.cms_section_items (
  section_id, item_key, title, subtitle, body, href, media_asset_id, settings, sort_order, is_enabled
)
select
  section.id, seed.item_key, seed.title, seed.subtitle, seed.body, seed.href, null, seed.settings, seed.sort_order, true
from section
cross join (
  values
    (
      'slide-1', 'EARBUDS 300 PRO', 'Cybernetic Sound & Hybrid ANC',
      'Premium active noise cancellation and thumping dual bass drivers in a rugged tactical chassis with LED charge display.',
      '/categories/earbuds',
      '{"localImagePath": "/images/carousel/banner1.png", "badgeText": "EXCLUSIVE LAUNCH", "accentColor": "#fbbf24", "primaryCtaLabel": "Buy Now", "secondaryCtaLabel": "Specifications", "secondaryCtaHref": "/categories/earbuds", "features": [{"text": "40dB Hybrid ANC", "icon": "volume"}, {"text": "BassBoost Driver", "icon": "sparkles"}]}'::jsonb,
      10
    ),
    (
      'slide-2', 'OMNI SPEAKER BEAT', 'High Definition Audio & Light Sync',
      'Double subwoofers deliver cinematic, room-filling sound. IPX7 chassis with customizable dual LED ring visualizers.',
      '/categories/bluetooth-speakers',
      '{"localImagePath": "/images/carousel/banner2.png", "badgeText": "EXCLUSIVE LAUNCH", "accentColor": "#ef4444", "primaryCtaLabel": "Buy Now", "secondaryCtaLabel": "Specifications", "secondaryCtaHref": "/categories/bluetooth-speakers", "features": [{"text": "Rich Stereo System", "icon": "volume"}, {"text": "Reactive Ambient Glow", "icon": "sparkles"}]}'::jsonb,
      20
    ),
    (
      'slide-3', 'TACTICAL WATCH V2', 'Military Spec Biometric Watch',
      'Real-time heart rate, body temperature scanning, GPS tracker, and a 30-day battery cell built for extreme conditions.',
      '/categories/smart-watches',
      '{"localImagePath": "/images/carousel/banner1.png", "badgeText": "EXCLUSIVE LAUNCH", "accentColor": "#34d399", "primaryCtaLabel": "Buy Now", "secondaryCtaLabel": "Specifications", "secondaryCtaHref": "/categories/smart-watches", "features": [{"text": "Biometric Tracking", "icon": "cpu"}, {"text": "Mil-Spec Durability", "icon": "shield"}]}'::jsonb,
      30
    ),
    (
      'slide-4', 'SOLAR FORCE CORE', 'Outdoor Heavy Duty Power Bank',
      'Ultra-high 50,000mAh solar charging cell wrapped in impact-absorbing shockproof housing with twin flashlights.',
      '/categories/power-banks',
      '{"localImagePath": "/images/carousel/banner2.png", "badgeText": "EXCLUSIVE LAUNCH", "accentColor": "#f97316", "primaryCtaLabel": "Buy Now", "secondaryCtaLabel": "Specifications", "secondaryCtaHref": "/categories/power-banks", "features": [{"text": "Fast Charge Output", "icon": "zap"}, {"text": "Twin Solar Panels", "icon": "sparkles"}]}'::jsonb,
      40
    ),
    (
      'slide-5', 'KIP ARMOUR SPEED', 'Reinforced Braided USB-C Cable',
      'Dual-braided ballistic nylon and reinforced aramid fiber handling heavy 240W Power Delivery and high data rates.',
      '/categories/data-cables',
      '{"localImagePath": "/images/carousel/banner1.png", "badgeText": "EXCLUSIVE LAUNCH", "accentColor": "#60a5fa", "primaryCtaLabel": "Buy Now", "secondaryCtaLabel": "Specifications", "secondaryCtaHref": "/categories/data-cables", "features": [{"text": "240W Power Delivery", "icon": "zap"}, {"text": "Ballistic Nylon Shell", "icon": "link"}]}'::jsonb,
      50
    )
) as seed(item_key, title, subtitle, body, href, settings, sort_order)
on conflict (section_id, item_key) do nothing;

commit;
