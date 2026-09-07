# Working rules for this repo

Cursor reads this file. Keep it short and keep it true.

## What this is

A four-page acquisition funnel for [BRAND], served as static files. No build
step, no framework, no package.json. `index.html` is the whole quiz; the other
three pages are the post-quiz flow.

## Hard constraints — do not break these without being asked

1. **No framework, no bundler, no npm dependencies.** Plain HTML, CSS and ES5-
   compatible JS. It has to drop into Funnelish and run from a folder.
2. **One stylesheet, one breakpoint (900px).** Never add a second stylesheet,
   never add `isMobile` checks in JS, never build separate mobile/desktop
   markup. If something needs to differ, it differs in CSS.
3. **The quiz never navigates.** Every question renders into `#quiz` in
   `index.html`. The only `location.href` in the quiz is the final redirect to
   `scratch.html`. Do not turn steps into routes or separate pages.
4. **Nothing branches on answers.** Every path ends on the same `plan.html` and
   the same `offer.html`. Answers are display values (merge fields), not
   routing rules. Do not add conditional funnels.
5. **Questions live in the `QUESTIONS` array** in `funnel.js`. Add, remove or
   reorder there — never hard-code a question into markup. The progress rail,
   the step counter and the resume logic all derive from that array.
6. **Warm orange (`--warm`) is for price, discount and savings only.** Every
   other accent is `--cold`. Do not introduce new colours; use the tokens at
   the top of `funnel.css`.
7. **Minimum 44px hit targets** on anything tappable.
7b. **One button placement rule, no exceptions:** the primary action is the
   last element of the column it completes, 28px below it, inheriting that
   column's alignment. Never pin it to the bottom of the viewport (it falls
   below the fold on short-copy screens) and never centre it under
   left-aligned copy (it detaches from what it acts on).
7d. **Every button variant states its own `:hover`.** The base
   `.btn:hover{background:#000}` leaked onto `.btn--light` once and painted a
   white button black on a black screen. A variant without its own hover is a
   bug, not a default.
7c. **The loader runs 4 seconds total** (`total` in `runLoader`). It is a
   pause for effect, not a real computation; do not lengthen it.
7e. **The scratch page stalls 2s on arrival** (`APPLY_STEPS` in scratch.html).
   The bar advances on an uneven schedule — jump, crawl, hang, jump — because
   a linear bar reads as a countdown. Do not "simplify" it back to linear, and
   do not lengthen it.
7g. **The scratch page fits one screen at every size.** No scrollbar: it is a
   single moment. The card is the element that gives — width-led with a
   height cap, never height-led (that made its derived width wider than the
   phone). Height-based media queries compress the stack before anything is
   removed.
7h. **Consent and legal fine print is page furniture, not a control.** It goes
   on the bottom edge of the page (`.legalfoot`, `margin-top:auto` inside the
   `.app` column), never in a `.step__foot` under the action — there it reads
   as part of the button and strands mid-page on short screens.
7f. **Selection states need more than a border.** A chosen tier moves border,
   fill, inset ring and marker together, and `:hover` carries a
   `:not(.is-on)` guard so it cannot out-rank selection on source order.
8. **Ad params must survive every hop.** Use `Funnel.link()` / `Funnel.go()`
   for internal navigation — never a bare `href` between funnel pages.

## Honesty constraints — these are compliance, not taste

- The three reviews on the loader screen are SAMPLE copy, and each card says
  "Sample review" on its face so nobody mistakes them for customers. They exist
  so the funnel is presentable in review. Replace all three with real reviews
  before the first paid click, and change the meta line at the same time —
  never strip the "Sample review" label while the words are still invented.
- No invented user counts, no fabricated ratings, no stock headshots passed off
  as customers (the monogram avatars are placeholders on purpose). Every other
  placeholder stays bracketed until real content replaces it.
- The renewal terms under the checkout button stay in readable type and stay
  accurate to what the checkout actually charges.
- Cancellation stays one click. Do not add email-only cancellation.
- The countdown does not reset on refresh. Do not "fix" that.

## Files

```
index.html    the whole quiz
scratch.html  discount reveal
plan.html     lead page (merge fields)
offer.html    tiers, bump, checkout hand-off
funnel.css    all styling, mobile-first
funnel.js     quiz engine, answer store, merge fields, param passthrough
copy.js       every visible string, by id
build-onefile.mjs  regenerates the single-file preview (optional)
bump.mjs      stamps ?v= on the assets — run before every push
```

## Deploying

Run `node bump.mjs` before committing. It re-stamps `?v=` on funnel.css,
copy.js and funnel.js in all four pages. Without it the browser serves the
cached copies and a pushed copy change looks like it silently failed.

## Copy

Every visible string carries a `data-copy="id"`. In markup, write it by hand
with a `data-default`; in the quiz renderers, emit it with `C(id, default, tag,
attrs)` — never with a bare string, or the owner cannot change that line.
`copy.js` overrides the ids; the default is the fallback. `?edit=1` turns the
page into an editor and downloads a regenerated copy.js.

Two things resolve at render and stay raw while editing: `{merge_tokens}` and
`[label](href)` links. Use the link syntax rather than putting `<a>` in markup,
or the copy around the link stops being editable.

`quiz()` renders every step once into nothing at boot purely to register ids,
and `copyFile()` unions DEFAULTS with the existing COPY, so a download from any
page is complete. Both matter — do not remove either as dead code.

Prices and rebill terms are deliberately NOT editable copy: they live in
`TIERS` in offer.html so they cannot drift from what the checkout charges.
Photo slots (`[PHOTO …]`, `[I]`) are image placeholders, not copy.

## Placeholders to replace

`[BRAND]` `[COMPANY]` `[ADDRESS]` `[REAL NUMBER]` `[N]` `[SOURCE 1]`
`[SOURCE 2]` `[REAL NAME]` `[VERIFIED · DATE]` `[PHOTO …]` `[CHECKOUT_URL]`
`[CC_PRODUCT_4W]` `[CC_PRODUCT_12W]` `[CC_PRODUCT_24W]` `[VISA]` `[MC]`
`[APPLE]` `[PAYPAL]`, plus the two bracketed FAQ answers in `offer.html`.

## Session behaviour

Answers live in `sessionStorage`, not `localStorage`. They survive the hops to
scratch / plan / offer because those are the same tab, and they are gone when
the tab closes. Every load of `index.html` clears the store and starts at the
age gate — refreshing mid-quiz restarts it, deliberately. Do not "improve"
this into a resume feature.

## Testing

Serve over http (not `file://`) and walk the whole funnel on a 390px viewport
and a 1440px one. `?fast=1` shortens the loader. No storage to clear between
runs — reloading the quiz is the reset.
