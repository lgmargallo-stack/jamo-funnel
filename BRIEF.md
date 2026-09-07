# New funnel brief

Fill this in, hand it to Claude or to Cursor, and you get back a working
`funnel.config.js` plus a first-draft `copy.js`. Everything else is unchanged
engine.

Leave anything blank that you want decided for you — a blank is a decision
delegated, not a hole. What you must not leave blank: the price ladder, the
rebill terms, and the discount, because those have to be true.

---

## 1. The offer

**Product:**
<!-- e.g. 12-week digital protocol + monthly subscription -->

**Who it's for, in one sentence:**
<!-- The person, their situation, and what they've already tried. -->

**What they're afraid of:**
<!-- The fear that makes them click the ad. This becomes the interstitials. -->

**What they want in 30 days:**
<!-- Concrete outcomes. These become the final multi-select question and the
     outcome chips on the plan page. -->

**What makes this different from the last thing they bought:**
<!-- The mechanism. This is the authority interstitial. -->

---

## 2. Brand

**Name:**
**Legal entity and address** (for the footer):
**Existing brand colours, if any:**
**Fonts, if any:**
**Tone** — pick one and say why: blunt / warm / clinical / conspiratorial

If you leave colours and fonts blank you get the house system: one accent,
warm reserved for price, Archivo Expanded over Instrument Sans.

---

## 3. The quiz

**How many questions?** (9–13 works; 11 is the default)

**The first question** — this one is the ad-to-page match, so it should echo
the ad's promise almost word for word:

**The rest, roughly.** Don't write them finished — list what you need to know
and why it matters to the plan. Mark each as single-choice or multi-select.

| # | What you're asking | single/multi | What it feeds |
|---|--------------------|--------------|---------------|
| 1 |                    |              |               |
| 2 |                    |              |               |

**Sections** — the quiz splits into 2–3 named groups for the progress rail:

**Merge fields** — which answers should appear by name on the plan page?
<!-- Default set: first name, a second name, goal, time since, two problems,
     two outcomes. Say if this offer needs different ones. -->

---

## 4. The offer page

**Tiers** — one row each, and the rebill has to match what the checkout
actually charges:

| Key | Name | Was | Now | Rebills | Checkout Champ product id |
|-----|------|-----|-----|---------|---------------------------|
|     |      |     |     |         |                           |

**Which tier carries the badge?**
**Badge text:**
**Order bump** (title, price, one-line description) — or "none":
**Discount %:** <!-- Must be true against the list price above. -->
**Checkout URL:**

---

## 5. Flow

Tick what this offer needs. Anything unticked is switched off in the config
and the funnel re-links around it.

- [ ] Age gate first screen
- [ ] Scratch-card discount reveal
- [ ] Email capture
- [ ] Name capture (his and hers / his only)
- [ ] Order bump
- [ ] Countdown timer on the offer page — how long?

---

## 6. Proof

**Do you have real reviews yet?** yes / no

If no, the funnel ships with sample reviews labelled "Sample review" on each
card and monogram avatars. That is deliberate and it stays until you have real
ones — see the honesty rules in AGENTS.md.

If yes, paste them with names as they should appear and whether each person
agreed to a photo.

**Real user count for the authority screen** — a number you can defend, or
blank to leave `[REAL NUMBER]` in place.

**Research you're citing:** <!-- Actual sources. These get linked. -->

---

## 7. Images

List what you have, or what you want shot:

- Age-gate cards (4): 
- Interstitial photo (1, portrait): 
- Review avatars (3, square): 

Nothing here is blocking — every slot shows a labelled placeholder until a
file lands in `images/`.

---

## What you get back

1. `funnel.config.js` — questions, theme, tiers, flow, all of it
2. `copy.js` — every string, first draft, ready to rewrite in `?edit=1`
3. A note of anything in the brief that conflicted or was left dangerous

## What you do next

```
node bump.mjs && git add -A && git commit -m "new offer" && git push
```

Then `?edit=1` on the live URL and rewrite the copy until it sounds like you.
