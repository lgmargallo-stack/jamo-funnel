# Handover: putting this funnel on Funnelish

For the developer taking these files. Read the two gotchas first — they are
the only things about this codebase that are not obvious.

## What this is

Four static pages, plain HTML/CSS/ES5-compatible JS. No build step, no
framework, no npm dependencies, no package.json. Nothing to compile.

```
index.html        the entire quiz (17 screens, never navigates)
scratch.html      discount reveal
plan.html         lead page
offer.html        tiers, bump, checkout hand-off

funnel.config.js  offer config — questions, theme, tiers, flow, routes
copy.js           every visible string, by id
funnel.css        all styling, one breakpoint at 900px
funnel.js         the engine
images/           photos
```

Load order on every page is **funnel.css, then funnel.config.js, then copy.js,
then funnel.js**. `funnel.js` reads globals set by the two files before it, so
the order is not optional.

---

## Gotcha 1: page URLs

The pages link to each other by *stage name*, not filename. Stage names
resolve through `routes` in `funnel.config.js`:

```js
routes: {
  quiz:    'index.html',
  scratch: 'scratch.html',
  plan:    'plan.html',
  offer:   'offer.html'
}
```

When each stage becomes a Funnelish page with its own URL, put those URLs
here — that is the only place they need to change:

```js
routes: {
  quiz:    '/quiz',
  scratch: '/your-discount',
  plan:    '/your-plan',
  offer:   '/checkout'
}
```

**Do not put a bare `href` or `location.href` between funnel pages anywhere.**
Use `Funnel.go('offer')` or `Funnel.link(Funnel.route('offer'))`. Those carry
the ad params (`sid`, `adset_name`, `ad_name`, `placement`, utm, click ids)
across the hop; a bare link drops them and the attribution breaks silently.
The full list is `PASS_THROUGH` at the top of `funnel.js`.

## Gotcha 2: asset paths

Every page references its assets relatively:

```html
<link rel="stylesheet" href="funnel.css?v=…">
<script src="funnel.config.js?v=…"></script>
<script src="copy.js?v=…"></script>
<script src="funnel.js?v=…"></script>
```

If Funnelish serves uploaded assets from a CDN path rather than alongside the
page, swap these four for the absolute URLs it gives you. Same for image
paths — `images/whatever.jpg` in `copy.js` (the `img.*` keys) will need the
same prefix.

Either way, keep `?v=` on the end. `node bump.mjs` restamps it on all four
pages; run it before every deploy or browsers will serve a cached `copy.js`
and a copy change will look like it silently failed. This has already caught
us once.

If inlining is easier than uploading assets, `funnel.css`, `funnel.config.js`,
`copy.js` and `funnel.js` can all go inline in `<style>`/`<script>` tags in
that same order. Nothing depends on them being separate files. The trade is
that a copy change then means re-pasting the page instead of replacing one
file.

---

## Before it goes live

**Edit mode must be off or keyed.** `flow.edit` in `funnel.config.js`:

| Value | Behaviour |
|---|---|
| `true` | `?edit=1` opens the copy editor — build-time only |
| `false` | edit mode is off entirely |
| `'some-word'` | only `?edit=some-word` opens it; `?edit=1` does nothing |

Ship `false` or a word. Not `true`, and not the placeholder
`'CHANGE-THIS-WORD'`.

To be precise about what this is: `funnel.config.js` is served to the browser,
so the word is readable by anyone who looks. It is a guard against a stray
`?edit=1` in a shared link, not access control. That is fine — edit mode
writes to `localStorage` and only ever changes what that one browser sees. It
cannot alter live copy for anyone else.

**Placeholders still in the files:** `[BRAND]` `[COMPANY]` `[ADDRESS]`
`[REAL NUMBER]` `[N]` `[SOURCE 1]` `[SOURCE 2]` `[PHOTO …]` `[VISA]` `[MC]`
`[APPLE]` `[PAYPAL]` `[CHECKOUT_URL]` `[CC_PRODUCT_*]`, plus two FAQ answers
in `offer.html`.

**The three reviews on the loader screen are sample copy**, labelled "Sample
review" on each card with monogram avatars instead of faces. They are there so
the funnel demos properly. They must be replaced with real reviews — and only
then should that label change — before the funnel takes paid traffic.

**Checkout hand-off:** `checkoutUrl` plus the `cc` product id per tier in
`funnel.config.js`. The button appends `product`, `bump`, `goal`, `status`,
`email`, `first_name` and everything in `PASS_THROUGH`.

**Pixel wiring** (not done, deliberately — depends on your stack):

- `step_view` on quiz step change (listen for `popstate`)
- `Lead` on the email step
- `quiz_complete` on the redirect out of the quiz
- Purchase server-side from the Checkout Champ postback, with `sid` as the
  dedup key. Do not fire purchase in the browser.

---

## Things that look like bugs but are not

- **The quiz never navigates.** All 17 screens render into `#quiz` in
  `index.html` and the back button walks them via `history.pushState`. Do not
  turn steps into pages.
- **Nothing branches on answers.** Every path lands on the same plan and the
  same offer; answers are merge fields, not routing. There are no conditional
  paths to find.
- **Reloading the quiz restarts it.** Answers live in `sessionStorage` and are
  cleared on every load of `index.html`. That is deliberate, not a broken
  resume feature.
- **The offer countdown does not reset on refresh.** When it runs out it says
  so. Do not "fix" it into a fresh clock.
- **The loader is a fixed 4-second pause**, not a real computation.
- **The scratch page stalls 2s on arrival** with a deliberately uneven
  progress bar. A linear bar reads as a countdown; this is tuned.

`AGENTS.md` has the full constraint list, including the layout rules that took
several rounds to settle. Worth ten minutes before changing any CSS.
