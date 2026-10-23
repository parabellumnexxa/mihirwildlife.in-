# PRD — Mihirkumar Ranva · Wildlife Photography Portfolio

## Problem Statement
Portfolio for wildlife photographer Mihirkumar Ranva. User provided About/Achievements/Articles/Book docx content + a portrait photo. Requested an award-worthy (Awwwards-level), kinetic, motion-rich site, and Cloudinary file/media storage so the photographer can upload his own logo + wildlife photos.

## Stack
- React 19 + FastAPI + MongoDB
- Motion: framer-motion + lenis (smooth scroll); react-fast-marquee
- Media storage: Cloudinary (signed uploads)
- Design: dark editorial theme, Cormorant Garamond + Manrope + JetBrains Mono, muted gold accent (#C9A25E)

## Personas
- Visitors / curators / conservation orgs browsing work
- Admin = Mihir, managing photos + branding via /admin

## Implemented (2026-07-27)
- Kinetic hero: line-by-line masked reveal, parallax background, scroll fade
- Gallery: bento "tetris" grid, category filters (All/Birds/Wildlife/Behavior/Ecosystems), spotlight hover, lightbox
- Numbered manifesto chapters (ethos)
- About section with real portrait + parallax + affiliations + quote
- Achievements timeline (2011–2026)
- Works: book "Untold Stories" (Amazon) + Hornbill article
- Slow editorial marquee, contact form (stores messages), footer
- Admin panel (/admin, password gated): photo upload/delete via Cloudinary, branding tab (logo/hero/about image upload + contact email/instagram), messages inbox
- Backend: /api photos CRUD, /api/site settings, /api/contact, /api/cloudinary/signature (signed), /api/admin/login

## Verified
- curl: photos, site, signature (401 when unauth), contact, admin login
- Cloudinary upload + delete end-to-end via admin UI
- Screenshots: hero, gallery, manifesto, about, marquee, contact, admin

## Backlog / Next
- P2: Per-photo EXIF auto-extraction from uploads
- P2: Instagram feed embed
- P2: Verify own domain in Resend to email any address (currently owner/verified inbox only)

## Update 2026-07-27 (v8 — admin password + content protection)
- Admin password changed to Mihir@282878 (backend/.env ADMIN_PASSWORD); verified new=200, old=401. Existing localStorage tokens invalidated — re-login required.
- Content protection (useContentProtection hook + CSS): right-click/context menu disabled, image drag & long-press-save blocked, Ctrl+S / Ctrl+U / Ctrl+P / F12 / Ctrl+Shift+I/J/C blocked, PrintScreen clears clipboard. Gallery images already watermarked. NOTE: OS-level screenshots cannot be fully blocked by any website — strong deterrent only.

## Update 2026-07-27 (v6 — dedupe/sections/names/captions/admin editing) [testing_agent verified 100%]
- Removed duplicate images; all 16 photos now assigned to a Series. 5 collections: Big Cats of Gir (3), Raptors & Owls (5), Wetlands of Junagadh (3), Songbirds of Gujarat (3), After Dark (2).
- Corrected species/animal names (White-breasted Kingfisher with a Kill, Short-toed Snake Eagle, Ashy-crowned Sparrow Lark, Taiga Flycatcher, Oriental Magpie Robin at Sunset, Mottled Wood Owls, Lesser Flamingos & the Skyline, Shikra, Spotted Owlet, Black-winged Kite, Indian Pitta, leopard, lion cubs).
- Series section: cover image no longer duplicated inside its own thumbnail row.
- Added per-photo 'story' one-line caption (shown in gallery + series lightboxes).
- Admin: per-photo Edit dialog (title/category/location/series/story/camera) via PUT /api/photos/{id}; can reassign photos to any/new series. Series stories editor can add brand-new collections (e.g. Reptiles, Monsoon).
- Font: hero title on Fraunces (no specific font requested by user).
- Instagram: footer link renders only when site.instagram set in admin (Branding tab).

## Update 2026-07-27 (v5 — curate/watermark/series/font)
- Curated 16 of Mihir's real Cloudinary photos with correct species titles (leopard, lion cubs, snake eagle, kingfisher-with-kill, waterhen, sparrow lark, pitta, flamingos+skyline, owls, kite, shikra, taiga flycatcher, milky way, magpie-robin sunset). Organised into 4 series: Big Cats of Gir, Raptors & Owls, Wetlands of Junagadh, After Dark.
- Signature watermark: `withWatermark()` injects the white logo overlay (g_south_east, 16% relative, 58% opacity) into every gallery/series/lightbox Cloudinary URL.
- Series section rebuilt as alternating photo-essay: cover frame + numbered title + italic caption + thumbnail row. Metadata stored in site.collections (cover_public_id + caption). Admin Branding tab has a "Series stories" editor (caption + cover picker per collection).
- Hero title font changed to Fraunces (font-display); section headings stay Cormorant Garamond.
- Verified: 16 photos seeded, series essay renders, watermark visible, collections PUT save/restore, hero font applied.

## Update 2026-07-27 (v4 — visual edits)
- Swapped all gallery photos to Mihir's own Cloudinary uploads (waterhen, kingfisher, snake eagle, lion cubs, sparrow lark, flycatcher, milky way, sunset sentinel); collections regrouped (Wetlands of Junagadh, Gir Wilderness, After Dark).
- Nav + Footer now show Mihir's white brand logo (Brown_2_bsk3ns from Cloudinary); logo sizes increased.
- Hero background set to his sunset-silhouette photo; hero overline changed to "Wildlife Photographer · Birding Educator · Conservation Advocate" (removed Junagadh, India).
- Footer copy changed to serif "© Mihir Ranva Photography" (removed Junagadh, India).
- Contact email updated to mihirwildlife@gmail.com (site setting + default).
- OPEN: "change font" on hero title reveal was ambiguous — left current Cormorant Garamond, awaiting user's preferred font.

## Update 2026-07-27 (v3)
- Print Pricing: site_settings now holds currency + print_options (size/price list, seeded A4–A1). PrintRequestDialog shows selectable sizes with prices; admin Branding tab has a full pricing editor (add/edit/remove). Request stores print_size + print_price and emails them.
- Auto Camera Tags: exifr reads camera/lens/settings from the photo's EXIF on upload and auto-fills blank fields (frontend, Admin PhotosTab). Falls back gracefully when no EXIF present.
- Featured Series: photos carry a `collection` field (admin input). New public "Field Series" section groups photos by collection into numbered editorial rows with its own lightbox + print request. Nav link added.
- Verified: Series renders 2 collections; pricing dialog shows INR sizes; print request stores size/price; admin pricing editor renders.
- Email alerts: Resend wired to contact + print/license requests → OWNER_EMAIL (mihirkumar.dev09@gmail.com), sender onboarding@resend.dev
- Photo reordering: drag-and-drop in admin Photos tab, persisted via PUT /api/photos/reorder
- Camera details: camera/lens/settings fields on photos, shown as field-notebook meta in lightbox + admin inputs
- Print sales: PrintRequestDialog in gallery lightbox (buy print / license image), stored in print_requests, admin "Prints" tab, triggers owner email
- Verified: print request submit (toast + email), reorder API, camera meta render, admin tabs render
