# SuitCycle Notes

## Listings rollout
- Supabase storage: ensure a public bucket named `listing-images` exists alongside `avatars`. RLS can remain disabled because we publish public URLs; cached responses honour the `cacheControl` set in `uploadPublicImage`.
- Archiving keeps images in storage for now so we can restore listings later; we only delete objects the seller drops during an edit.
- Multi-photo validation is shared between client and server. The UI surfaces limit errors before submit, but the action enforces the ceiling and MIME/size guards as a backstop.
- SuitScore styling lives in `src/lib/suitscore.ts` so badges stay consistent across cards, PDP, and any future dashboards.

## Admin console refresh

### CHANGELOG
- Added `AdminShell` plus supporting admin UI primitives (status badge + confirm dialog) to give every `/admin` surface a consistent layout, top bar, and navigation.
- `/admin` dashboard now uses shadcn tables with contextual search + dropdown filters per tab while keeping existing exports and server actions intact.
- `/admin/flags` reorganized into filterable cards with confirmation dialogs for banning/unlisting/hiding and `/admin/audit` gained actor/entity/action filters with the same shell.

### HOW TO TEST
- Log in with an admin account and visit `/admin`, `/admin/flags`, and `/admin/audit`.
- Verify the guard still blocks non-admins and that every server action (ban/unban, archive/restore, refunds, dispute updates, flag actions) succeeds.
- Confirm the new filters/search inputs change the underlying queries and that the UI styling matches the rest of the site (badges, tables, shell header).

## UI polish + feedback system

### CHANGELOG
- Added a shared `AppToaster`, `Skeleton`, and `ListingCardSkeleton` plus motion-enhanced `FeatureCard` so toasts, placeholders, and hero cards look consistent across the app.
- Wired favorites, checkout intents, reviews, reports, dispute actions, manual tracking, delivery confirmations, inbox messages, and listing owner archive actions into the toast system while aligning every confirmation flow with shadcn `Dialog`.
- Introduced streaming skeleton routes for `/listings`, `/listings/[id]`, `/orders/[id]`, and `/account/orders` so the marketplace grid, PDP, and dashboard tables show friendly placeholders while data loads, and cleaned up empty-state copy for seller listings.

### HOW TO TEST
- Fan through browsing flow: hit `/listings` (observe skeleton) and open a PDP to confirm loading placeholders transition cleanly into data.
- Toggle favorites, start checkout, send an order message, submit a review/report/flag, add tracking, confirm delivery, and archive a listing—each action should render the new confirmation modal (where applicable) and a toast with success/error messaging.
- Visit `/account/orders` and an order detail route to see the new loading skeletons and ensure empty states still show CTAs; also confirm the homepage feature cards animate smoothly on scroll/hover.
