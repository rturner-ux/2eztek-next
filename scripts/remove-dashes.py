"""
Replace em dashes and en dashes in public-facing files only.
 — (em dash with spaces) → ,
— (bare em dash) → (removed)
 – (en dash with spaces) → ,
– (bare en dash in ranges like Mon–Fri) → to
"""
import os, re

PUBLIC_FILES = [
    'app/areas/page.tsx',
    'app/blog/BlogClient.tsx',
    'app/blog/[slug]/page.tsx',
    'app/brands/page.tsx',
    'app/brands/[slug]/BrandPageClient.tsx',
    'app/commercial-gym-maintenance/page.tsx',
    'app/contact/page.tsx',
    'app/equipment-for-sale/listings/[id]/ListingContact.tsx',
    'app/equipment-for-sale/new/page.tsx',
    'app/equipment-for-sale/page.tsx',
    'app/gym-equipment-repair-dallas/page.tsx',
    'app/HomePageClient.tsx',
    'app/layout.tsx',
    'app/manuals/page.tsx',
    'app/manuals/[slug]/page.tsx',
    'app/reviews/ReviewsClient.tsx',
    'app/smartgymops-features/SmartGymOpsClient.tsx',
    'app/tools/repair-or-replace/RepairOrReplaceClient.tsx',
    'app/treadmill-maintenance/page.tsx',
    'app/about-2ez-tek/AboutClient.tsx',
    'app/areas/[slug]/AreaContent.tsx',
    'app/faqs/page.tsx',
    'app/brands/nordictrack/page.tsx',
    'app/brands/proform/page.tsx',
    'app/brands/peloton/page.tsx',
    'app/brands/bowflex/page.tsx',
    'app/brands/life-fitness/page.tsx',
    'app/brands/marcy/page.tsx',
    'app/brands/goalrilla/page.tsx',
    'app/manuals/nordictrack/page.tsx',
    'components/BookingModal.tsx',
    'components/ChatWidget.tsx',
    'components/site-footer.tsx',
    'components/site-header.tsx',
    'lib/areaData.ts',
    'lib/brandData.ts',
    'lib/serviceData.ts',
    'scripts/blog-post-nordictrack.html',
]

total_changes = 0

for filepath in PUBLIC_FILES:
    if not os.path.exists(filepath):
        continue

    with open(filepath, encoding='utf-8') as f:
        original = f.read()

    text = original
    # em dash with spaces on both sides → comma space
    text = text.replace(' — ', ', ')
    # em dash with space before (end of clause) → comma
    text = text.replace(' —', ',')
    # bare em dash → remove
    text = text.replace('—', '')
    # en dash with spaces → comma
    text = text.replace(' – ', ', ')
    # bare en dash → " to "
    text = text.replace('–', ' to ')

    if text != original:
        changes = sum([
            original.count(' — '),
            original.count(' —'),
            original.count('—'),
            original.count(' – '),
            original.count('–'),
        ])
        total_changes += changes
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'Fixed {changes:3d} dashes  {filepath}')

print(f'\nTotal: {total_changes} dashes removed across {len(PUBLIC_FILES)} files checked.')
