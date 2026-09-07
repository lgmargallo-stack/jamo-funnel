# [BRAND] quiz funnel

One responsive codebase. No build step, no dependencies, no framework.

```
index.html     the entire quiz — age gate, 11 questions, interstitials,
               loader, email, names. Never navigates.
scratch.html   discount reveal
plan.html      lead page / plan reveal
offer.html     tiers, bump, checkout hand-off
funnel.css     every screen, mobile-first, one breakpoint at 900px
funnel.js      quiz engine, answer store, merge fields, param passthrough
```

Open `index.html` and it runs. Add `?fast=1` to shorten the loader while testing.

## The quiz is one page

Every step renders into `<main id="quiz">`. Questions come from the `QUESTIONS`
array in `funnel.js` — add, remove or reorder them and the progress rail, the
step counter and the desktop index all follow. Interstitials are keyed to the
question they follow in `INTERSTITIALS`.

The browser back button walks steps through `history.pushState`, so it feels
native without loading anything. Reloading mid-quiz resumes at the first
unanswered question.

The only navigation in the whole quiz is the redirect at the end:
`index.html → scratch.html → plan.html → offer.html → your checkout`.

## Responsive

One set of markup and one stylesheet. Below 900px everything is a single
column; above it, question screens split into a left column (question,
context, step number) and a right column (answers), the age gate goes to four
across, the plan page gains a sticky summary rail, and the offer tiers sit
side by side. No `isMobile` checks anywhere.

## Answers and merge fields

Answers live in `localStorage` under `bq.answers.v1`. Any element with
`data-merge="first_name"` is filled by `Funnel.hydrate()`. Available keys:

`first_name` `her_name` `status` `goal` `goal_lower` `time_since`
`hardest_part` `issue_1` `issue_2` `outcome_1` `outcome_2` `promo_code`

Nothing branches. Every path lands on the same lead page and the same offer —
the merge fields are the only thing that differs between visitors.

## Editing copy without touching code

Add `?edit=1` to any page:

```
http://localhost:5500/index.html?edit=1
http://localhost:5500/offer.html?edit=1
```

Every editable string gets a dashed outline. Click it and type. A bar at the
bottom counts your changes; on the quiz it also has ‹ › arrows to walk all 17
screens, because clicking an answer in edit mode types rather than advances.

Changes are kept in your browser as you work, so you can reload freely. When
you're done, click **Download copy.js** and replace the `copy.js` in the
project with it. That file is what the site reads from then on — the strings in
the markup become fallbacks.

Merge tokens stay visible while editing (`Your {goal_lower} plan,
{first_name}`) so you can move or remove them; visitors see them filled in.
Available: `{first_name}` `{her_name}` `{goal}` `{goal_lower}` `{status}`
`{time_since}` `{hardest_part}` `{issue_1}` `{issue_2}` `{outcome_1}`
`{outcome_2}` `{promo_code}`.

**Discard** clears your local edits and reloads. Nothing about edit mode is
visible to visitors — no bar, no outlines, no editable text.

A few lines aren't in edit mode on purpose: prices and rebill terms live in
`TIERS` in `offer.html`, because a price that can be edited in two places is a
price that will eventually disagree with the checkout.

## Before you ship

- `[BRAND]`, `[COMPANY]`, `[ADDRESS]`, `[REAL NUMBER]`, `[N]`, `[SOURCE n]`,
  photo slots, review text and two FAQ answers are placeholders.
- Prices in `offer.html` are drafts. Replace `TIERS` with your real Checkout
  Champ products and set `[CHECKOUT_URL]`.
- Ad params (`sid`, `adset_name`, `ad_name`, `placement`, utm, click ids) ride
  every hop automatically — see `PASS_THROUGH` in `funnel.js`. Add any your
  setup needs.
- Wire the pixel: `step_view` on step change, `Lead` on email, `quiz_complete`
  on the scratch redirect, and fire the purchase server-side from Checkout
  Champ's postback with `sid` as the dedup key.
- Collect real reviews before launch, and keep the cancel-in-one-click promise
  in the disclosure true — it is the cheapest chargeback insurance you have.
