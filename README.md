# [BRAND] quiz funnel

One responsive codebase. No build step, no dependencies, no framework.

```
funnel.config.js  everything that makes this funnel THIS offer
BRIEF.md       fill this in to spin up a new offer
index.html     the entire quiz — age gate, 11 questions, interstitials,
               loader, email, names. Never navigates.
scratch.html   discount reveal
plan.html      lead page / plan reveal
offer.html     tiers, bump, checkout hand-off
funnel.css     every screen, mobile-first, one breakpoint at 900px
funnel.js      quiz engine, answer store, merge fields, param passthrough
copy.js        every visible string on the site, by id
images/        your photos — the age cards and the dark interstitial
bump.mjs       stamps ?v= on the assets so pushes aren't cached
DEPLOY-FUNNELISH.md  handover notes for whoever hosts it
```

Run `node bump.mjs` before every `git push`. It re-stamps `?v=` on the four
assets in all four pages; without it your browser keeps serving the old
funnel.js and copy.js and a pushed change looks like it did nothing.

Open `index.html` and it runs. Add `?fast=1` to shorten the loader while testing.

## It's a template

`funnel.config.js` holds everything offer-specific: brand name, colours,
fonts, the questions, the sections, the interstitials, the loader phases, the
reviews, the tiers and prices, the discount, the checkout URL, and which
stages the flow includes at all. Turn off `namesStep` and the quiz skips it;
set `bump: null` and the order bump disappears; add a fourth tier and the
offer page renders four.

`funnel.js`, `funnel.css` and the four HTML files are the engine and are
identical in every funnel you build. A new offer is a copy of this folder with
a new config, a fresh `copy.js` and an empty `images/`.

Fill in `BRIEF.md` and hand it to Claude or Cursor to get a config back.

## The quiz is one page

Every step renders into `<main id="quiz">`. Questions come from `questions`
in `funnel.config.js` — add, remove or reorder them and the progress rail, the
step counter and the desktop index all follow. Interstitials are keyed to the
question they follow, in `interstitials`.

The browser back button walks steps through `history.pushState`, so it feels
native without loading anything. Reloading clears the answers and restarts at
the age gate — every visit is a fresh run, deliberately.

The only navigation in the whole quiz is the redirect at the end:
quiz → scratch → plan → offer → your checkout. Those hops go through `routes`
in the config, so the funnel links itself correctly on any host.

## Responsive

One set of markup and one stylesheet. Below 900px everything is a single
column; above it, question screens split into a left column (question,
context, step number) and a right column (answers), the age gate goes to four
across, the plan page gains a sticky summary rail, and the offer tiers sit
side by side. No `isMobile` checks anywhere.

## Answers and merge fields

Answers live in `sessionStorage` under `bq.answers.v1`. Any element with
`data-merge="first_name"` is filled by `Funnel.hydrate()`. Available keys:

`first_name` `her_name` `status` `goal` `goal_lower` `time_since`
`hardest_part` `issue_1` `issue_2` `outcome_1` `outcome_2` `promo_code`

Nothing branches. Every path lands on the same lead page and the same offer —
the merge fields are the only thing that differs between visitors.

## Editing copy without touching code

Add the edit param to any page — `?edit=1` while `flow.edit` is `true`, or
`?edit=<your word>` once you have set a word (see "Turning edit mode off"):

```
http://localhost:5500/index.html?edit=1
http://localhost:5500/offer.html?edit=1
```

Every string on the site gets a dashed outline — headlines, answers, button
labels, the loader's phase names, the sample reviews, the legal line, the
footer. Click one and type. A bar at the bottom counts your changes; on the
quiz it also has ‹ › arrows to walk all 17 screens, because clicking an answer
in edit mode types rather than advances.

Changes are kept in your browser as you work, so you can reload freely.

When you're done, click **Copy copy.js**, open `copy.js` in Cursor, select all
and paste. That is the reliable route — some browsers silently refuse `.js`
downloads. **Download** does the same thing as a file if your browser allows
it. Either way, `copy.js` is what the site reads from then on; the strings in
the markup become fallbacks.

Then `node bump.mjs`, commit, push — and click **Discard** on the live page so
your local draft stops masking what actually deployed.

`copy.js` ships complete: all 223 ids are already in it, from every page. So a
download taken while editing the quiz still carries the offer page's copy, and
you can equally edit the file directly in Cursor instead of on the page.

Two things stay visible while editing and resolve for visitors:

- **Merge tokens** — `Your {goal_lower} plan, {first_name}` — so you can move
  or remove them. Available: `{first_name}` `{her_name}` `{goal}` `{goal_lower}`
  `{status}` `{time_since}` `{hardest_part}` `{issue_1}` `{issue_2}`
  `{outcome_1}` `{outcome_2}` `{promo_code}`.
- **Links** — `our [Terms](#) apply` — write the label in brackets and the URL
  in parentheses, and it renders as a link. That is how you point the legal
  line and the footer at your real pages.

## Photos

Eight slots take images: the four age-gate cards, the dark interstitial, and
the three review avatars. The first five show a grey `[PHOTO …]` frame when
empty, so you can see at a glance what is unfilled; the avatars fall back to
the monogram initials instead, so an unfilled review still looks finished.

To fill one, in `?edit=1` click the frame and choose a file. Three things
happen: the page previews your file immediately, it records the path
`images/<filename>`, and the edit bar lists the filename under "Copy into
images/". Then:

1. Put that same file in the `images/` folder.
2. **Copy copy.js** → paste into `copy.js` → save.
3. `node bump.mjs`, commit, push.

The preview is local to your browser, so the picture only becomes real for
everyone else once the file is in `images/` and pushed. If a path is set but
the file is missing you get an empty frame — that is the symptom of skipping
step 1.

Keep filenames lowercase with hyphens and no spaces. The age cards render
236px tall on desktop (~800×600 is plenty); the interstitial runs full height
beside the copy (~1200×1600 portrait); the avatars render 36px square, so
crop them square at ~200×200. Compress before committing.

The avatar initials themselves live in `copy.js` as `review1.initials` and so
on — edit them there rather than on the page, since clicking the box now opens
the file picker.

One caution on avatar photos: a face next to a review is a claim that the
person exists. Put a photo there when the review is real and the person agreed
to it. While the cards still say "Sample review", leave the monograms.

**Discard** clears your local edits and reloads. Nothing about edit mode is
visible to visitors — no bar, no outlines, no editable text.

Two things aren't editable on purpose: prices and rebill terms live in `tiers`
in `funnel.config.js`, because a price that can be edited in two places is a
price that will eventually disagree with the checkout; and photo slots
(`[PHOTO …]`) and the monogram avatars are image placeholders, not copy.

## Turning edit mode off for launch

`flow.edit` in `funnel.config.js`:

| Value | Behaviour |
|---|---|
| `true` | `?edit=1` opens the editor — while you're building |
| `false` | off entirely |
| `'some-word'` | only `?edit=some-word` opens it |

The word is a guard against a stray `?edit=1` in a shared link, not access
control — `funnel.config.js` is served to the browser, so the word is readable
by anyone who looks for it. That's acceptable, because edit mode only changes
what that one browser sees and can never alter live copy for anyone else.

Pick the word if you want to keep fixing copy on the live site. Pick `false`
if you don't.

Note that drafts only apply while edit mode is on. Loading the page without
the param always shows exactly what's in `copy.js` — so the live URL is a
true preview of what visitors get, whether or not you remembered to Discard.

## Before you ship

- `[BRAND]`, `[COMPANY]`, `[ADDRESS]`, `[REAL NUMBER]`, `[N]`, `[SOURCE n]`,
  photo slots and two FAQ answers are placeholders.
- The three reviews on the loader screen are **sample copy**, labelled "Sample
  review" on each card, with monogram initials instead of faces. They are there
  so the funnel demos properly. Replace them with real reviews — and only then
  change the "Sample review" line — before you run traffic.
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
