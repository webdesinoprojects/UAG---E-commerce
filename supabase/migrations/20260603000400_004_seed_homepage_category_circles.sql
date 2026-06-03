-- Seed the category circles section
INSERT INTO cms_sections (section_key, section_type, name, is_enabled, settings)
VALUES (
    'homepage.category_circles',
    'category_circles',
    'Homepage Category Circles',
    true,
    '{}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

-- Seed the initial categories
INSERT INTO cms_section_items (section_id, item_key, title, subtitle, body, href, sort_order, is_enabled, media_asset_id, settings)
SELECT 
    s.id,
    item.item_key,
    item.title,
    NULL,
    NULL,
    item.href,
    item.sort_order,
    true,
    NULL,
    item.settings
FROM cms_sections s
CROSS JOIN (
    VALUES
        ('cat-1', 'Earbuds', '/categories/earbuds', 10, '{"slug": "earbuds", "productCount": 32, "image": "/images/categories/earbuds.png", "hoverMediaAssetId": null}'::jsonb),
        ('cat-2', 'Neckbands', '/categories/neckbands', 20, '{"slug": "neckbands", "productCount": 25, "image": "/images/categories/neckbands.png", "hoverMediaAssetId": null}'::jsonb),
        ('cat-3', 'Smart Watch', '/categories/smart-watches', 30, '{"slug": "smart-watches", "productCount": 1, "image": "/images/categories/watches.png", "hoverMediaAssetId": null}'::jsonb),
        ('cat-4', 'Power Banks', '/categories/power-banks', 40, '{"slug": "power-banks", "productCount": 1, "image": "/images/categories/powerbanks.png", "hoverMediaAssetId": null}'::jsonb),
        ('cat-5', 'Bluetooth Speaker', '/categories/bluetooth-speakers', 50, '{"slug": "bluetooth-speakers", "productCount": 1, "image": "/images/categories/speakers.png", "hoverMediaAssetId": null}'::jsonb),
        ('cat-6', 'Data Cable', '/categories/data-cables', 60, '{"slug": "data-cables", "productCount": 34, "image": "/images/categories/cables.png", "hoverMediaAssetId": null}'::jsonb)
) AS item(item_key, title, href, sort_order, settings)
WHERE s.section_key = 'homepage.category_circles'
ON CONFLICT (section_id, item_key) DO NOTHING;
