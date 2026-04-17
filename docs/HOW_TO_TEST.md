# HOW TO TEST

## Marketplace Search & Filters

1. Start the dev server with `npm run dev` and open `http://localhost:3000/listings` in a fresh session (no existing query string).
2. Confirm all listings render in newest-first order and the active filter summary shows "No filters applied."
3. Use the search box to enter a keyword (e.g. a brand or model). Wait for results to refresh and verify the `q` parameter appears in the URL and the badge summary shows the search term.
4. Toggle multiple brand and condition checkboxes. Ensure the results narrow, the URL gains repeated `brand=`/`condition=` entries, and clearing a badge removes only that specific filter.
5. Enter comma-separated sizes in the size input, then press Enter. Check that each size is represented in the URL and badge summary, and deselecting a size checkbox updates the text input.
6. Drag the price slider to a narrower range. Confirm the slider labels reflect the selection, listings update, and `minPrice`/`maxPrice` appear in the URL.
7. Switch the sort dropdown through all options (`newest`, `price_asc`, `price_desc`, `size`, `suitScore_desc`) and confirm the cards reorder as expected while the URL `sort` parameter updates.
8. Click "Clear filters" in the badge summary and ensure all query parameters except pagination are removed, the filters reset to defaults, and the full listing set reappears.
9. Page forward and backward with the pagination controls and verify the `page` parameter is added/removed correctly while filters remain applied.

## Favourites

1. Sign in with any user and open `http://localhost:3000/listings`. Click the heart on a few cards and confirm they immediately fill, stay filled after a refresh, and clear when clicked again.
2. In a private window (or after signing out), click a heart and confirm you are redirected to the sign-in flow; after authenticating you should land back on the listing you attempted to save.
3. Visit `http://localhost:3000/listings/[listingId]` for a saved suit and use the inline heart to toggle it off/on. Verify the price row immediately reflects the new state and the page refreshes in place.
4. Navigate to `http://localhost:3000/account/favorites` and confirm saved suits appear in a grid using the standard listing card layout. Un-favouriting from this view should refresh and remove the card.
5. From `/account`, use the "Saved listings" shortcut and ensure it links to the same grid. Confirm pagination and filters still work when you head back to `/listings`.

## Stripe Connect & Payments

1. Populate `.env.local` with `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL`, then run `npx prisma generate` if the schema was pulled fresh.
2. Launch the dev server: `npm run dev`.
3. In a separate terminal, authenticate and listen for webhooks:
   - `stripe login`
   - `stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to http://localhost:3000/api/stripe/webhook`
4. Sign in and navigate to `http://localhost:3000/sell/payouts`. Use **Connect Stripe** to walk through the Standard onboarding flow with a test account.
5. Open an active listing you do not own, follow the **Go to checkout** button, and confirm the `/checkout/[listingId]` page shows the fee breakdown plus any reused PaymentIntent details. Start checkout to create an intent and capture the returned order id.
6. Visit `/orders/<orderId>` to review the timeline, snapshot, and shipping placeholder for the pending order.
7. Confirm the PaymentIntent via CLI: `stripe payment_intents confirm <intent_id> --payment-method pm_card_visa`. Watch the Stripe listener emit `payment_intent.succeeded`, refresh the order timeline to see the `Paid` step, and ensure the buyer receives the Resend email receipt.
8. Reload the listing (now `Sold`) and open `/sell/orders` to verify the seller table reflects the order status, totals, and payout math.
