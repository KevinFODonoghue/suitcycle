# SuitCycle — Claude Code Build Instructions

## What This Project Is
SuitCycle is a peer-to-peer marketplace for buying and selling pre-owned technical racing swimsuits (tech suits). Built by a swimmer, for swimmers. Domain: suitcycle.shop

## CRITICAL: What to Keep vs. Rebuild

### DO NOT TOUCH — These work and must stay:
- `prisma/` — schema and migrations (13 models, fully migrated)
- `src/lib/` — all business logic (28 modules: auth, stripe, search, storage, suitscore, price, orders, reviews, shipping, validation, etc.)
- `src/app/api/` — API routes
- `src/app/actions/` — server actions
- `.env`, `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- `instrumentation.ts`, `sentry.client.config.ts`

### REBUILD FROM SCRATCH — New frontend:
- `src/app/layout.tsx` — new global layout
- `src/app/page.tsx` — new homepage
- `src/app/globals.css` — new global styles with brand colors
- All page routes UI (keep the route folders, rebuild the page.tsx files inside them)
- `src/components/` — all new components (delete existing component folders and rebuild)
- Delete `frosted-text-overrides.css` and `globals.tmp.css`

## Brand Identity

**Name:** SuitCycle
**Tagline:** "Your fastest suit doesn't have to be brand new."
**Motto:** "Swim new life into tech suits."

**Colors:**
- Primary: #00B4FF (bright cyan-blue from logo)
- Primary dark: #0066AA (hover states, depth)
- Primary light: #66D4FF (subtle highlights)
- Accent gradient: from #0044AA to #00CCFF
- Background light: #FFFFFF
- Background dark: #0A0F1A (dark blue-black, not pure black)
- Surface: #F0F7FF (very light blue tint for cards/sections)
- Text primary: #1A1A2E (near-black with slight blue)
- Text secondary: #64748B (muted)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

**Typography:**
- Headings: bold, clean sans-serif
- Body: regular weight, readable
- Use next/font with a modern sans-serif (e.g., Outfit, Plus Jakarta Sans, or similar — NOT Inter or Arial)

**Logo files in /public/:**
- BESTSSL_full_new.png — stacked logo (for hero sections)
- BESTSSL_text_new.PNG — text only (for navbar)
- BESTSSL_full_horizontal_new.PNG — horizontal (for footer, social)
- BESTSSL_new.png — icon only (for favicon, mobile)

**Design Direction:**
- Inspired by underwater/pool aesthetics — think deep blues, water textures, clean lines
- Glassmorphic cards with subtle backdrop blur for feature sections
- Smooth animations using Framer Motion (already installed)
- Professional and trustworthy but with energy — this is competitive swimming
- Mobile-first responsive design
- Dark mode optional (nice to have, not required for MVP)

## SuitScore™ Condition System

Five tiers, NO sub-scores. Seller picks one tier per listing:

| Tier | Races | Performance | Color |
|------|-------|-------------|-------|
| Gold | 0-2 | 100% | #EAB308 (gold/yellow) |
| Podium | 3-6 | 90% | #6366F1 (indigo) |
| Prelim | 7-10 | 70-80% | #22C55E (green) |
| Backup | 11-14 | 40-60% | #F97316 (orange) |
| Practice | 15+ | 0-20% | #EF4444 (red) |

Each tier has descriptive criteria across three categories: logo/label condition, elasticity/compression, and water repellency. These are reference descriptions to help sellers pick the right tier, NOT separate scores.

NOTE: The Prisma schema currently has 5 sub-score fields on Listing (stitchWearScore, elasticityScore, fabricPillingScore, seamIntegrityScore, logoWearScore). These should be REMOVED from the schema. SuitScore is a single enum field (condition) only.

## Database Schema Summary (for reference — do not modify)

Key models: User, Listing, Order, Message, Review, Favorite, Address, Dispute, Flag, Audit
Key enums: GenderFit (male/female/unisex), StrokeSuitability (fly/free/breast/back/im), SuitCondition (gold/podium/prelim/backup/practice), ListingStatus (draft/active/sold/archived), OrderStatus (pending/paid/shipped/delivered/canceled/refunded)

## Pages to Build (in order)

### 1. Global Layout (src/app/layout.tsx)
- Navbar: horizontal logo (BESTSSL_full_horizontal_new.PNG) on left, nav links center (Browse, Sell, About, Help), account/login button right
- Navbar should be sticky, with subtle backdrop blur on scroll
- Footer: logo, quick links (Browse, Sell, About, Help, SuitScore Guide), legal links (Terms, Privacy, Policies), social links placeholder, "Swim new life into tech suits." tagline, © 2026 SuitCycle
- Clean, minimal, branded

### 2. Homepage (src/app/page.tsx)
Sections in order:
- **Hero:** Large headline "Your fastest suit doesn't have to be brand new." with subtitle "SuitCycle introduces a smarter way to buy and sell pre-owned technical racing suits with confidence." CTA button "Browse tech suits" linking to /listings. Background: underwater/pool themed (use a gradient or CSS-based water effect, NOT an image dependency).
- **How It Works:** 3 cards — Browse → Buy → Race (or List → Sell → Earn for sellers). Simple icons, brief descriptions.
- **Value Props:** 4 feature cards — "Built for tech suits" (specialized marketplace), "SuitScore™ grading" (standardized condition), "Secure payments" (Stripe-powered), "Swim community" (by swimmers, for swimmers). Use glassmorphic card style.
- **SuitCycle vs Others:** Comparison section — SuitCycle advantages vs generic marketplaces (eBay, Facebook). Can be a visual comparison or side-by-side.
- **Trust & Safety:** Brief section about buyer protection, secure payments, SuitScore standardization.
- **FAQ:** Accordion with common questions (What is a tech suit? How does SuitScore work? How does shipping work? What if my suit doesn't match the listing?)
- **CTA:** Final call to action — "Ready to swim new life into tech suits?" with Browse and Sell buttons.

### 3. Browse/Listings Page (src/app/listings/page.tsx)
- Filter sidebar (or top bar on mobile): brand, size, gender, suit type, SuitScore tier, price range, sort by
- Responsive grid of listing cards
- Each card: primary photo, brand + model, size, SuitScore badge (colored by tier), price, favorite heart button
- Empty state if no listings yet

### 4. Individual Listing Page (src/app/listings/[id]/page.tsx)
- Photo gallery (carousel or grid)
- Suit details: brand, model, size, gender fit, stroke suitability, SuitScore badge with tier description
- Price prominently displayed
- Seller info card: name, avatar, member since, rating
- Action buttons: "Buy Now" and "Message Seller"
- Related listings section at bottom (same brand or size)

### 5. Sell/Create Listing Page (src/app/sell/page.tsx)
- Multi-step form:
  - Step 1: Upload photos (drag and drop, up to 6)
  - Step 2: Suit details (brand dropdown, model text, size, gender fit, suit type, stroke suitability)
  - Step 3: SuitScore selection (visual tier picker with descriptions from the guide)
  - Step 4: Price and description
  - Step 5: Review and publish
- Progress indicator showing current step
- Form validation using existing Zod schemas from src/lib/validation/

### 6. About Page (src/app/about/page.tsx)
Content to include (port from Sharetribe):
- "The SuitCycle Vision" — mission statement
- "How It Started" — founder story (Kevin O., Illinois swimmer, saw how many athletes couldn't afford tech suits and how many suits collected dust after retirement)
- "Who We Serve" — swimmers of all ages, parents, teams
- "How SuitCycle Works" — visual diagram of buy/sell flow

### 7. Help Center (src/app/help/page.tsx)
- SuitScore™ grading guide (link to /suitscore)
- Buyer protection policy
- Shipping information
- Returns & refunds
- Prohibited items
- Contact & support form

### 8. SuitScore Guide Page (src/app/suitscore/page.tsx)
- Visual display of all 5 tiers with colors
- Each tier shows: name, race count range, performance percentage, use case description
- Detailed criteria for each tier across the three categories (logo/label, elasticity, water repellency)
- Sources cited (FINA, Finis, USC)

### 9. Account Page (src/app/account/page.tsx)
- Profile info (avatar, name, handle, bio, member since)
- My listings (active, sold, archived)
- My purchases (order history with status)
- My favorites
- Messages
- Settings (edit profile, change password, manage addresses)

### 10. Login/Auth Pages (src/app/login/page.tsx)
- Clean login form (email + password)
- Google OAuth button
- Link to sign up
- Link to forgot password

### 11. Additional Pages
- Checkout (src/app/checkout/[listingId]/page.tsx) — order summary, address form, payment placeholder (Stripe comes later)
- Orders (src/app/orders/page.tsx) — order history and status tracking
- Terms (src/app/terms/page.tsx) — terms of service
- Privacy (src/app/privacy/page.tsx) — privacy policy
- Policies (src/app/policies/page.tsx) — general policies
- Grading (src/app/grading/page.tsx) — may redirect to /suitscore
- Admin (src/app/admin/page.tsx) — admin dashboard (keep minimal for now)

## Schema Changes Needed

Before building the frontend, apply these Prisma schema changes:

1. REMOVE these fields from the Listing model:
   - stitchWearScore
   - elasticityScore
   - fabricPillingScore
   - seamIntegrityScore
   - logoWearScore

2. ADD to Listing model:
   - isPriority Boolean @default(false)
   - priorityExpiresAt DateTime?
   - isAuthenticated Boolean @default(false)
   - suitScoreVerified Boolean @default(false)
   - suitType SuitType

3. ADD enum:
   enum SuitType {
     jammer
     kneeskin
     fullBody
     openBack
   }

4. ADD Voucher model:
   model Voucher {
     id           String      @id @default(cuid())
     code         String      @unique
     type         VoucherType
     createdAt    DateTime    @default(now())
     expiresAt    DateTime?
     redeemedAt   DateTime?
     redeemedById String?
     redeemedBy   User?       @relation("UserVouchers", fields: [redeemedById], references: [id])
     @@index([code])
   }

   enum VoucherType {
     priority_listing
     authentication
     verified_suitscore
     membership_trial
   }

   (Also add `redeemedVouchers Voucher[] @relation("UserVouchers")` to the User model)

5. ADD Membership model:
   model Membership {
     id                   String   @id @default(cuid())
     userId               String
     user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     plan                 MembershipPlan
     stripeSubscriptionId String?
     status               MembershipStatus @default(active)
     startedAt            DateTime @default(now())
     expiresAt            DateTime
     @@index([userId])
   }

   enum MembershipPlan {
     monthly
     annual
   }

   enum MembershipStatus {
     active
     cancelled
     past_due
   }

   (Also add `membership Membership?` to the User model)

6. Make Message.orderId optional (String?) so pre-purchase messaging works without an order.

After schema changes, run: npx prisma migrate dev --name schema_updates

## Component Architecture

Build these reusable components in src/components/:

### ui/ (base components — extend existing shadcn)
- Button, Input, Label, Textarea (already have some via shadcn)
- Card, Badge, Avatar (new)
- Select, Checkbox, Slider (already have via shadcn)
- Dialog, Accordion (already have via shadcn)
- Toast (using Sonner, already installed)

### layout/
- Navbar
- Footer
- MobileNav (hamburger menu)
- PageContainer (max-width wrapper with padding)

### listings/
- ListingCard (photo, brand, size, SuitScore badge, price, favorite button)
- ListingGrid (responsive grid of ListingCards)
- ListingFilters (sidebar/top filter bar)
- ListingGallery (photo carousel for detail page)
- SuitScoreBadge (colored badge showing tier name)

### home/
- Hero
- HowItWorks
- ValueProps
- ComparisonChart
- TrustSection
- FAQ
- CTASection

### sell/
- PhotoUploader
- SuitDetailsForm
- SuitScorePicker (visual tier selector)
- PriceForm
- ListingPreview
- StepIndicator

### account/
- ProfileCard
- ListingsList
- OrdersList
- MessageThread

## Tech Notes

- Next.js 15.5 with App Router (already configured)
- Tailwind CSS 4 (already configured)
- Framer Motion for animations (already installed)
- shadcn/ui for base components (already partially installed)
- React Hook Form + Zod for forms (already installed)
- Sonner for toasts (already installed)
- Lucide React for icons (already installed)
- Use Server Components by default, Client Components only when needed (interactivity, hooks)
- All data fetching through existing lib modules and Prisma client
- Image optimization through next/image

## Build Order

1. Schema changes + migration
2. Global layout (navbar + footer)
3. Homepage
4. Browse/listings page
5. Individual listing page
6. Sell page
7. About page
8. Help center + SuitScore guide
9. Account page
10. Login/auth pages
11. Remaining pages (checkout, orders, terms, privacy, policies)
12. Mobile responsiveness pass
13. Animation and polish pass
