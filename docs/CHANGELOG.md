# Changelog

## 2025-11-14

### Added
- `src/lib/stripe/status.ts` centralizes the Stripe Connect status descriptor so both the account overview and `/sell/payouts` surface the same label/description/badge logic.
- Account navigation now includes dedicated `/account/listings` and `/account/orders` routes rendered through `DashboardShell`, giving sellers a listings management view and a role-aware orders timeline feed.

### Changed
- `/account` adopted `DashboardShell` with summary stat cards (listings, orders, rating, Stripe readiness), quick links, and the updated profile form so the entire workspace inherits the new dashboard shell.
- `/account/favorites` reuses the refreshed `ListingCard` grid, adds a polished empty state, and exposes a CTA back to `/listings`.
- `/orders/[id]` received a full layout refresh: hero summary, refined vertical timeline, modern shipping/review/help cards, and a buyer-protection callout without touching order logic.
- `src/app/account/orders/page.tsx` shows both buying and selling orders with status badges, cover thumbnails, and quick actions that deep-link to timelines and messages; `/account/listings` now renders listings as responsive cards with status chips and metrics.
- `src/components/layout/SiteHeader.tsx` order links point to `/account/orders`, keeping account navigation consistent on desktop and mobile.
- `src/app/sell/payouts/page.tsx` imports the shared Stripe status helper instead of duplicating copy.

### HOW TO TEST
1. Sign in and open /account; verify the summary cards, quick links, and profile form render inside the new shell.
2. Visit /account/listings, /account/orders, and /account/favorites on desktop and mobile to confirm the sidebar/tabs respond, cards render, and CTAs work.
3. Open an order detail at /orders/[id] and confirm the new timeline, tracking card, review module, and buyer protection callout display while existing actions (messages, tracking, disputes, reviews) still function.

## 2025-11-13

### Added
- `tailwind.config.ts` now defines the v4 design tokens (brand palette, typography stacks, container widths, and box shadows) so utility classes map directly to the Sharetribe-inspired variables.
- `src/components/layout/PageContainer.tsx` centralizes the responsive max-width and padding from the template; it now wraps the home, browse (`/listings`), sell, account, and admin pages to keep spacing consistent.
- `src/components/layout/SiteShell.tsx` plus the new `SiteHeader` and `SiteFooter` components recreate the template's global chrome with responsive navigation, auth-aware account actions, and a multi-column footer.
- `src/components/home/FeatureCard.tsx` powers the new homepage card grid so the "Built for Swimmers" and similar sections stay consistent with the template feel.
- `src/components/listings/ListingsFilterPanel.tsx` and `src/components/listings/ListingCard.tsx` picked up the new template styling (sheet-like filter cards, pill chips, modern listing cards, and empty state copy) while keeping the existing search/pagination logic intact.
- Marketing & policy routes now live at `/about`, `/grading`, `/suitscore`, `/policies/buyer-protection`, `/policies/shipping`, `/policies/returns-refunds`, `/terms`, and `/privacy`, each with template-inspired layouts and SuitCycle-specific copy.

### Changed
- `src/app/globals.css` refreshes the shadcn `new-york` CSS variables for light/dark palettes, spacing scale, and base typography, and sets Inter as the global font to better match the reference marketplace.
- `src/app/layout.tsx` boots the Inter Google Font via `next/font` so Tailwind + shadcn components receive the same `--font-brand-sans` token and now wraps every route with the shared `SiteShell` instead of per-page nav bars.
- `src/app/page.tsx`, `src/app/listings/page.tsx`, `src/app/sell/page.tsx`, `src/app/account/page.tsx`, and `src/app/admin/page.tsx` adopt the new container, typography hierarchy, and pill-style buttons to stay visually aligned with the template without touching backend logic; legacy `NavBar` usage was removed so the global header/footer render once.
- `/` now mirrors the template landing page sequence (hero, Buy & Sell explainer, Built for Swimmers cards, SuitCycle Advantage comparison, and Trust & Safety copy) while keeping all CTAs wired to existing routes.
- `src/app/listings/[id]/page.tsx` now matches the template PDP with a gallery column, rich summary, SuitScore tooltip, seller module, action rail, and structured suit-details grid tied to the existing SuitScore fields.
- `src/lib/suitscore.ts` and `/grading` now describe SuitScore explicitly as SuitCycle's grading system, ensuring buyers understand the standardized rubric appearing across the marketplace.

### HOW TO TEST
1. Run `npm run dev` and review `/` on desktop and mobile—confirm the hero, Buy & Sell, Built for Swimmers, SuitCycle Advantage, and Trust & Safety sections match the template flow and that the CTAs route to `/listings`, `/sell`, and `/grading`.
2. Visit `/about`, `/grading` (or `/suitscore`), `/policies/buyer-protection`, `/policies/shipping`, `/policies/returns-refunds`, `/terms`, and `/privacy` via the header/footer to confirm each static page renders new content.
3. Visit `/listings`, `/sell`, `/account`, `/admin`, `/orders/[id]`, `/listings/[id]`, and `/checkout/[listingId]` to confirm the new header/footer render once, retain working navigation links, and keep page content centered.
4. On `/listings`, exercise the filter accordions (brand search, size chips, SuitScore sliders, etc.) and verify the search params + pagination behave exactly as before; favorite toggles on the refreshed cards should still update.
5. Open a product detail page (`/listings/[id]`) to confirm the new gallery/info/action layout, SuitScore tooltip/link to `/grading`, seller module, buyer-protection snippet (`/#buyer-protection`), "Buy now" checkout flow, and favorite toggle all behave as before.
6. Sign out/in via the header actions to verify the auth state toggles between the Sign in/Sign up buttons, the avatar menu (Account, Orders, Admin, Sign out), and that admin users see the Admin link.
7. Shrink the viewport below 768px to ensure the hamburger icon opens the mobile sheet, all nav links work, and auth actions match the desktop experience.
8. Toggle dark mode (e.g., add class="dark" to <html>) to ensure shadcn components read the updated CSS variables for buttons, inputs, dialogs, and cards.
9. Interact with buttons and filter forms to confirm focus rings and hover states use the refreshed Tailwind tokens while existing data + routes continue to function unchanged.

## 2025-11-12

### Added
- Every server action and account-facing API route now uses the shared `parseWithZod` helper, so validation failures bubble up with consistent field errors, and the new in-memory rate limiter guards profile, address, avatar, reporting, order, and Stripe onboarding flows by user + IP.
- Orders now emit audit entries for ship, deliver, dispute, and refund transitions; the Stripe webhook listens for `charge.refunded` events, marks orders as refunded, and records the audit metadata for traceability.
- Role-based admin dashboard at `/admin` with searchable tabs for Users, Listings, Orders, Disputes, Payouts, and Flags, including CSV export links plus inline actions (ban/unban, archive/restore, manual refunds, dispute resolution).
- `User.role` and the dedicated `Dispute` model (`DisputeStatus`) unlock richer moderation workflows and give admins visibility into manual refunds/resolutions with Audit trails.

### Changed
- Account profile + address APIs, avatar upload, and Stripe Connect onboarding routes short-circuit unauthorized requests, enforce sane rate limits, and forward unexpected errors through the Sentry wrapper instead of console logs.
- Order server actions (tracking, delivery confirmation, disputes, messaging, reviews) share the same validation + error helpers, capture errors in Sentry, and throttle abusive access.
- Reporting / admin moderation actions rely on the shared validation helper and now fail fast with user-friendly errors while logging any backend issues to Sentry.
- NextAuth sessions/jwt now carry `user.role`, middleware blocks `/admin` unless the token role is `admin`, and admin helpers fall back to the legacy `ADMIN_EMAILS` list for backwards compatibility.

### HOW TO TEST
1. Run `npm run dev`, open `/account`, and try to submit an invalid handle (uppercase or too short) plus a blank address formÃ¢â‚¬"the UI should surface the new validation copy without server crashes, and the terminal should stay clean.
2. Rapid-fire the manual tracking form on an order more than five times within a minute; the server action should return the Ã¢â‚¬Å“Too many requestsÃ¢â‚¬Â error and Sentry should capture the rate-limit exception if you configured `SENTRY_DSN`.
3. From the Stripe CLI, issue `stripe trigger charge.refunded --add payment_intent:<id>` for a paid order; confirm `/orders/[id]` shows `Refunded`, `/admin/audit` lists the `order.refunded` record, and the database row now has `refundedAt` + appended event metadata.
4. Hit `/api/account/profile` with an invalid payload via `curl` (e.g., missing `fullName`) and verify it returns a 400 with structured validation JSON; repeat valid requests quickly to ensure the route responds until the rate limit returns a 429.
5. Submit a listing/review report twice in quick successionÃ¢â‚¬"the second attempt should respond with a throttling toast and the server log should show the captured rate-limit error.
6. Sign in as an admin user, open `/admin`, and move through each tab: search/filter data, ban/unban a test account, archive/restore a listing, trigger a manual refund (provide a note) and confirm the corresponding order + audit entries update.
7. From the Disputes tab, open a buyer dispute via `/orders/[id]`, then use the admin form to mark it `seller_responded`, then `resolved`, and finally `refunded`; verify the dispute row updates, the order timeline reflects the change, and audits capture each transition.
8. Click Ã¢â‚¬Å“Download CSVÃ¢â‚¬Â on the Users/Listings/Orders/Payouts tabs and ensure the exported file contains the filtered rows; confirm non-admin accounts receive a 401/redirect when attempting to access `/admin` or `/admin/export`.

## 2025-11-09

### Added
- Shipping configuration toggle (`SHIPPING_MODE` + `MANUAL_SHIPPING_FLAT_FEE_CENTS`) surfaced via `src/lib/config.ts`, plus Shippo integration stubs in `src/lib/shipping/shippo.ts` that stay behind the feature flag.
- Manual shipping fee capture at checkout: PaymentIntents now include the flat fee, order snapshots persist `shippingFee`/`shippingMode`, and checkout + order detail pages render the new line items.
- Seller tracking workflow on `/orders/[id]` with the `saveManualTracking` server action and client form so a tracking URL moves orders from paid Ã¢â€ ' shipped and shares the link with buyers.
- Resend email infrastructure (`src/lib/emails/*`) with React templates for order placed, receipt, shipped, delivered, dispute, and new-message notifications; emails are fired during each order status transition.
- Lightweight messaging threads at `/orders/[id]/messages` powered by the new `Message` model plus the `postOrderMessage` server action; recipients receive email alerts so conversations stay in sync.
- Seller reviews unlock once an order is delivered: the buyer can submit a 1Ã¢â‚¬"5 rating with optional comments, and seller snippets on PDP + `/sell` now reflect the aggregated average + review count.
- Moderation scaffolding: `Flag` + `Audit` models, `/admin/flags` for triage, `/admin/audit` for the read-only trail, and reusable helpers in `src/lib/admin.ts` + `src/lib/audit.ts`.
- Reporting surfaces on listings and reviews create flags with reasons, while admins can resolve, unlist, hide, or ban directly from the dashboard.
- SuitScore grading rubric with automatic scoring (stitch wear, elasticity, pilling, seams, logos) and a public `/grading` explainer that walks sellers through photos + expectations.
- SEO & analytics baseline: per-listing OpenGraph images, JSON-LD on PDPs, `/sitemap.xml` + `robots.txt`, and an optional GA4 snippet controlled by `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### Changed
- Prisma `Order` model now stores `shippingMode`, `shippingFee`, and `trackingUrl`; run a schema update before testing.
- Seller orders copy points to the interim manual tracking flow until Shippo automation lands, and the order detail page now surfaces delivery confirmation + dispute tooling for buyers.
- Users now carry a `status` (`active|banned`); banned accounts are blocked from sign-in and all server mutations, and login surfaces a clear banner.

### HOW TO TEST
1. Update `.env.local` with `SHIPPING_MODE=manual` and `MANUAL_SHIPPING_FLAT_FEE_CENTS=1500`, then run `npx prisma migrate dev` (or `npx prisma db push`) followed by `npx prisma generate`.
2. Add `ADMIN_EMAILS="you@example.com"` (comma-separated) so the admin routes unlock for your account.
3. Start the dev server (`npm run dev`) and ensure your Stripe Connect seller account is onboarded as before.
3. Visit `/checkout/[listingId]` for a listing you do not own: confirm the summary shows the flat shipping fee, click **Buy now**, and use the Stripe CLI to confirm the intent; verify the corresponding order row stores the higher total and shows the shipping fee line item on `/orders/[id]`. Check Resend for the order placed + receipt emails.
4. As the seller, open that order, use the tracking form to paste a carrier URL, and confirm the page revalidates with status `Shipped`, the timeline adds a shipped event, and the buyer receives the shipped email with the tracking link.
5. Switch to the buyer, open `/orders/[id]`, click **Messages**, send a few notes, and ensure the other party receives the message notification emails. Confirm dispute/delivery controls render appropriately.
6. From the buyer view, confirm delivery and then open a disputeÃ¢â‚¬"verify the seller (and support) receive those emails and the dispute banner locks the form.
7. After confirming delivery, use **Leave a review** on `/orders/[id]` and ensure the success state hides the dialog, the order card shows the rating, and the seller summary on the PDP + `/sell` hub reflects the new average/count.
8. List a new suit at `/listings/new`, fill out the five rubric questions (note the SuitScore preview updates), and follow the call-to-action to `/grading` to verify the table renders.
9. Click **Report listing** on any PDP and **Report review** on a delivered order; confirm new entries appear on `/admin/flags`, take an action (resolve/unlist/hide/ban), and verify `/admin/audit` logs the operation.
10. Fetch `/sitemap.xml` and `/robots.txt` to confirm live entries include active listings, then share a listing URL on Slack/Discord to see the new OG image.
11. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` locally, reload the app, and confirm GA starts sending events (use the GA DebugView) while the PDP HTML now contains the Product JSON-LD snippet.

## 2025-10-22

### Added
- Stripe client bootstrap at `src/lib/stripe.ts` with shared Connect helpers in `src/lib/stripe/connect.ts`.
- Seller payouts dashboard at `/sell/payouts` plus `POST /api/stripe/account-link` and a server action that creates Stripe Connect onboarding links.
- Marketplace checkout bootstrap: `POST /api/listings/[id]/buy` creates a PaymentIntent with a 10% platform fee, persists a draft `Order`, and surfaces the client secret via the new `BuyNowButton`.
- Stripe webhook handler at `POST /api/stripe/webhook` that verifies signatures and marks orders as paid when `payment_intent.succeeded` arrives.
- Pre-checkout confirmation flow at `/checkout/[listingId]` with platform fee callouts and Stripe intent reuse messaging.
- Order timelines at `/orders/[id]` that render status events, snapshots, and (for now) a tracking placeholder; buyers receive a Resend email receipt on payment success.

### Changed
- Prisma schema introduces an `Order` model with buyer/seller relations, listing linkage, and payment tracking; run `npx prisma generate` after pulling the schema.
- `/sell` hub card for payouts now sends sellers to `/sell/payouts` where onboarding status is surfaced with messaging and disabled-buy reasons.
- Listing detail pages trade the placeholder checkout button for the interactive `BuyNowButton`, surfacing PaymentIntent status and reuse notices.
- Orders now include JSON event timelines, frozen listing snapshots, expanded statuses (`pending|paid|shipped|delivered|canceled|refunded`), and Resend-powered receipts; the seller orders table reads from real `Order` rows with status badges and payout math.

### HOW TO TEST
1. Ensure `.env.local` includes `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL`; update the database with `npx prisma migrate dev` (or `prisma db push`) and regenerate the client with `npx prisma generate`.
2. Start the dev server: `npm run dev`.
3. In another terminal, authenticate to Stripe (`stripe login`) and forward webhooks:  
   `stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to http://localhost:3000/api/stripe/webhook`.
4. Sign in to the app, open `/sell/payouts`, and click **Connect Stripe**; complete the Standard onboarding flow with a test Stripe account.
5. Visit an active listing you do not own and click **Buy now**. Confirm the UI reports the newly created PaymentIntent and order id.
6. Use the Stripe CLI to confirm the intent: `stripe payment_intents confirm <payment_intent_id> --payment-method pm_card_visa`.
7. Watch the CLI webhook output to ensure the `payment_intent.succeeded` event is delivered. Refresh the listing detail page and verify the status badge now shows `Sold`.
8. Query the database (e.g., `npx prisma studio`) to confirm the corresponding `Order` row is marked `paid` with a `paidAt` timestamp and the stored idempotency key.

## 2025-10-21

### Added
- Server-side search on `/listings` with URL-driven filters, accordion controls, sliders, and active filter badges plus clear-all support.
- Marketplace listings at `/listings`, `/listings/new`, and `/listings/[id]` featuring Supabase `listing-images` storage, multi-photo uploads (max 8), status-aware server actions, and owner-only editing.
- Zod validation for listings in `src/lib/validation/listing.ts`, money and SuitScore helpers, plus Vitest coverage to guard happy and unhappy paths.
- Reusable listing UI primitives: carousel, card grid, and a form component that handles image previews, ownership checks, and server error surfacing.
- Seller hub at `/sell` with quick-action cards, status chips, and dedicated `/sell/listings` and `/sell/orders` tables (orders surface sold listings, metrics currently placeholder 0 values through launch).
- Favourites system with a Prisma `Favorite` join table, `toggleFavorite` server action, optimistic heart toggles on listing cards and detail pages, and a saved listings grid at `/account/favorites`.

### Changed
- `/listings` now builds Prisma queries via `buildListingQuery`, applies sort options, and keeps pagination in sync with active filters.
- New environment variable `SUPABASE_LISTING_BUCKET` (defaults to `listing-images`) and Prisma schema updates introducing `Listing` with supporting enums and indexes.
- Navigation adds a persistent "List a suit" entry and the home hero now directs sellers to the new listing flow.
- Supabase image utilities now back both avatar and listing uploads, with owner actions revalidating `/listings` and detail pages after mutations.
- Auth middleware extends to `/sell` routes and listing status styling now lives in `src/lib/listing-status.ts` for reuse across dashboards.
- Account overview links to the new saved listings page so signed-in swimmers can jump from profile management to favourites.

### HOW TO TEST
1. Copy `.env.local.example` to `.env.local`, fill in secrets, and ensure both Supabase `avatars` and `listing-images` buckets are public.
2. Install dependencies if needed: `npm install`.
3. Generate the Prisma client (if schema changed): `npx prisma generate`.
4. Run the validators: `npm test`.
5. Start the dev server: `npm run dev`.
6. Sign in at `/login`, visit `/account`, and verify profile + avatar management still works.
7. Visit `/account/address`, add/edit/delete addresses, and confirm default toggles persist.
8. Create a listing at `/listings/new` with draft and active statuses, upload multiple photos (try overshooting the limit for validation), and ensure active listings require at least one photo.
9. Check `/listings` for pagination (24/page) and correct card rendering (price, photo, SuitScore badge, heart placeholder).
10. Open `/listings/[id]`, navigate the carousel with keyboard and thumbnails, confirm seller info, test edit/archive controls as the owner, and verify non-owners only see details + disabled checkout.
11. Apply filters on `/listings` (search term, brand, size, condition, gender, stroke) and confirm the URL query string updates while results narrow accordingly.
12. Adjust price and suit score sliders, verify the displayed bands and badge summary update, then use "Clear filters" to reset the URL and results.
13. Switch the sort dropdown through each option and confirm listings reorder (newest, price ascending/descending, size, suit score).
14. Sign in as a seller and visit `/sell`; confirm status chips count each stage (draft, active, sold, archived) and the action cards link to their destinations.
15. Open `/sell/listings` to see a table for every listing; verify price formatting, status badges, and that metrics columns show `0` until tracking launches.
16. Update a listing status to `sold`, then load `/sell/orders` to ensure the entry appears with a sold badge, payout placeholder, and view action.
17. Toggle a listing back to `draft` or `active` and confirm it drops from the orders table but remains in listings with the updated status badge.


