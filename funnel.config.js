/* ==========================================================================
   funnel.config.js — THE ONLY FILE THAT CHANGES BETWEEN OFFERS.

   Everything that makes this funnel *this* offer lives here: the brand, the
   colours, the questions, the loader, the reviews, the tiers, the checkout.
   funnel.js and funnel.css are the engine and never need editing to launch a
   new offer.

   Words are not here — they live in copy.js and are edited on the page with
   ?edit=1. The rule of thumb: this file is STRUCTURE (how many questions,
   how many tiers, what colour, what price), copy.js is WORDING.

   The strings that do appear here are seeds. They become the defaults in
   copy.js the first time the page renders, and the owner can rewrite any of
   them in edit mode without coming back to this file.
   ========================================================================== */
window.FUNNEL_CONFIG = {

  /* ---------------------------------------------------------------- brand */
  brand: {
    name: '[BRAND]',
    company: '[COMPANY]',
    address: '[ADDRESS]',
    /* Google Fonts URL. Swap the families and the theme below together —
       a new typeface with the old spacing rarely lands. */
    fonts: 'https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=Martian+Mono:wght@400;500&display=swap',
    display: "'Archivo Expanded', 'Archivo', system-ui, sans-serif",
    body: "'Instrument Sans', system-ui, -apple-system, sans-serif",
    mono: "'Martian Mono', ui-monospace, 'SF Mono', monospace"
  },

  /* ---------------------------------------------------------------- theme
     One accent, one price colour, one ink. Resist adding a third accent:
     the discipline is what makes these pages read as considered rather than
     assembled. Warm is reserved for price, discount and savings ONLY. */
  theme: {
    cold: '#2B34F0',        // the single accent
    coldTint: '#F4F5FE',    // its 4% wash, for selected states
    coldLine: '#C9CDF7',
    warm: '#FF5A1F',        // price / discount / savings only
    warmTint: '#FFF3EC',
    warmLine: '#FFD9C6',
    ink: '#0B0D10',         // headings, buttons
    ink2: '#3A4048',        // body
    slate: '#5C6470',
    mute: '#8A929E',
    faint: '#AEB5BF',
    line: '#E4E7EC',
    line2: '#EEF0F3',
    shade: '#F6F7F9',
    paper: '#FFFFFF'
  },

  /* ----------------------------------------------------------------- flow
     Turn stages off and the funnel re-links itself around them. */
  flow: {
    /* Edit mode. true while you build, then EITHER false to switch it off
       for good, OR a word of your choosing so ?edit=<word> still works and
       you can keep fixing copy on the live site. See README before you pick. */
    edit: false,

    ageGate: true,          // first screen is the age grid
    scratch: true,          // discount reveal between quiz and plan
    emailStep: true,
    namesStep: true,        // asks his name and hers, for the merge fields
    discountPct: 64,        // must be true against your list price
    timerMinutes: 10,       // offer-page countdown; does not reset on refresh
    loaderSeconds: 4        // manufactured-effort pause. Do not exceed 6.
  },

  /* ------------------------------------------------------------- sections
     Question groups. The progress rail splits by these. */
  sections: {
    1: 'Your situation',
    2: 'Her signals & your patterns',
    3: 'Readiness'
  },

  /* ------------------------------------------------------------ questions
     kind: 'age' (photo grid, first screen only) | 'single' | 'multi'
     Add, remove or reorder freely — the rail, the counter and the step
     machine all derive from this array. 9–13 is the working range: fewer
     feels unearned, more bleeds completions.

     id is what the answer is stored under and what merge fields read. */
  questions: [
    { id: 'age', section: 1, kind: 'age',
      title: 'The smartest way to get her back',
      sub: 'Select your age to begin',
      options: [
        { value: '18-29', label: '18–29' },
        { value: '30-39', label: '30–39' },
        { value: '40-49', label: '40–49' },
        { value: '50+',   label: '50+' }
      ] },

    { id: 'status', section: 1, kind: 'single',
      title: "What's your current relationship status?",
      note: 'A one-tap opener. Whatever you pick, the next screen is the same — this shapes what your plan opens with, not where you go.',
      options: ['Recently broke up', 'Single', "It's complicated", 'In a relationship', 'Married'] },

    { id: 'goal', section: 1, kind: 'single',
      title: 'What do you want most right now?',
      note: 'This becomes the name of your plan on the results page.',
      options: ['Get her back', 'Make her miss me', 'Rekindle the spark', 'Move on with confidence'] },

    { id: 'who_ended', section: 1, kind: 'single',
      title: 'Who ended it?',
      note: 'The answer here changes the first line of your plan, not the plan itself.',
      options: ['She left', 'I walked away and regret it', 'It was mutual'] },

    { id: 'time_since', section: 1, kind: 'single',
      title: 'How long ago did it end?',
      note: 'How recent it is decides what week one asks you to do first.',
      options: ['Days ago', 'A few weeks', '1–3 months', 'More than 3 months', "It's complicated"] },

    { id: 'her_behaviour', section: 2, kind: 'single',
      title: 'How is she acting since it ended?',
      note: "There's no wrong answer. Every option describes a kind of uncertainty the plan is built to resolve.",
      options: ['Hot and cold, hard to read', 'Cold and distant', 'Only messages when she needs something', 'Total silence', "She's seeing someone else"] },

    { id: 'hardest_part', section: 2, kind: 'single',
      title: "What's the hardest part right now?",
      sub: "Pick the one that's loudest today.",
      note: 'It becomes the opening line of your results.',
      options: ["I can't stop thinking about her", "I keep checking what she's doing", 'I never know what to say', "I don't feel like myself"] },

    { id: 'issues', section: 2, kind: 'multi',
      title: 'What went wrong between you?',
      sub: 'Choose all that apply',
      note: 'Each one maps to a module in the plan you see at the end.',
      options: ['Trust', 'Emotional distance', 'Different priorities', 'We argued too much', 'Outside interference', 'I stopped showing up', 'Something else'] },

    { id: 'slipped', section: 2, kind: 'multi',
      title: 'Since the breakup, which of these have slipped?',
      sub: 'Choose all that apply',
      note: 'Physical things slip after a breakup. Saying which ones lets the plan run alongside the rest.',
      options: [
        { value: 'sleep',    label: 'Sleep',              sub: "I'm awake at 3am" },
        { value: 'energy',   label: 'Energy',             sub: 'Flat by mid-afternoon' },
        { value: 'training', label: 'Training and drive', sub: "I've stopped showing up for myself" },
        { value: 'appetite', label: 'Appetite',           sub: 'Eating badly or barely' },
        { value: 'none',     label: 'Nothing physical' }
      ] },

    { id: 'readiness', section: 3, kind: 'single',
      title: 'If she messaged you tonight, would you know what to say?',
      note: 'Be honest — this is the gap the plan closes first.',
      options: ['No idea', "I'd probably get it wrong", 'Roughly', 'Yes'] },

    { id: 'outcomes', section: 3, kind: 'multi',
      title: 'Where do you want to be in 30 days?',
      sub: 'Choose all that apply',
      note: 'These become the outcomes listed on your results page.',
      options: ["She's texting first", "We're talking again", "I've stopped overthinking", 'Back together', 'Sleeping properly', 'Fit and sharp again'] }
  ],

  /* --------------------------------------------------------- interstitials
     Keyed by the question they follow. Three kinds:
       'authority' — the proof screen (number, quote, sources)
       'relief'    — light, copy only
       'insight'   — dark, splits with a photo
     Two or three across a quiz is the ceiling; more and they read as filler. */
  interstitials: {
    age: { id: 'authority', kind: 'authority' },
    goal: { id: 'relief', kind: 'relief',
      title: "That's fixable — and faster than you think",
      body: 'Wanting to {goal_lower} is not the hard part. Knowing the order to do things in is, and that is the whole of what your plan gives you.' },
    slipped: { id: 'insight', kind: 'insight',
      title: 'Every one of those is trainable',
      body: "Trust and emotional distance aren't personality flaws — they're patterns, and patterns respond to a sequence. Your plan starts with the two you picked." }
  },

  /* ---------------------------------------------------------------- merges
     What {first_name}, {goal} and friends fall back to when someone reaches
     a page without having taken the quiz. Write them in this offer's own
     vocabulary — they appear in headlines. */
  merges: {
    first_name: 'there',
    her_name: 'her',
    status: 'Recently broke up',
    goal: 'Get her back',
    time_since: 'recently',
    hardest_part: 'I never know what to say',
    issue_1: 'Emotional distance',
    issue_2: 'Different priorities',
    outcome_1: "She's texting first",
    outcome_2: "I've stopped overthinking"
  },

  /* ---------------------------------------------------------------- loader */
  loader: {
    phases: ['Mapping your situation', 'Scoring her signals', 'Selecting your modules'],
    commitment: 'Are you someone who finishes what you start?'
  },

  /* --------------------------------------------------------------- reviews
     SAMPLE copy so the funnel demos properly. Each card carries its own
     "Sample review" meta line. Replace the words AND that line together when
     you have real ones — never strip the label off invented text. */
  reviews: [
    { initials: 'M T', name: 'Marcus T.', meta: 'Sample review',
      body: 'Week one was mostly about me, not about her. That turned out to be the part I had been getting wrong.' },
    { initials: 'D R', name: 'Daniel R.', meta: 'Sample review',
      body: 'The order was what made the difference. I had been doing roughly the right things at completely the wrong time.' },
    { initials: 'J O', name: 'James O.', meta: 'Sample review',
      body: 'First time in two months I got through a whole day without checking her profile. That alone was worth it.' }
  ],

  /* ----------------------------------------------------------------- offer
     Prices live HERE and nowhere else — deliberately outside copy.js, so a
     price can never be edited in two places and disagree with the checkout.

     `pick` marks the tier that carries the badge and starts selected.
     `cc` is the Checkout Champ product id the button hands off. */
  tiers: {
    pick: '12w',
    items: [
      { key: '4w',  name: '4-week plan',  perDay: '$0.86 per day', was: '$54.99', now: '$23.99',
        rebill: '$54.99 every 30 days', cc: '[CC_PRODUCT_4W]',
        blurb: 'Enough to run the first reset and the opening message.' },

      { key: '12w', name: '12-week plan', perDay: '$0.47 per day', was: '$84.99', now: '$39.99',
        rebill: '$89.99 every 90 days', cc: '[CC_PRODUCT_12W]', badge: 'Most men choose this', save: 'SAVE 53%',
        blurb: 'The full sequence, with enough runway for the conversation to actually restart.' },

      { key: '24w', name: '24-week plan', perDay: '$0.44 per day', was: '$114.99', now: '$74.99',
        rebill: '$149.00 every 180 days', cc: '[CC_PRODUCT_24W]',
        blurb: 'For long relationships, where rebuilding takes more than one season.' }
    ]
  },

  /* Order bump. Set to null to remove it entirely. */
  bump: {
    title: 'Add: 30 Texts That Reopen the Conversation',
    detail: 'The exact messages, scripted per situation.',
    price: '+$24',
    tail: 'one time, added to this order.'
  },

  /* ---------------------------------------------------------------- routes
     Where each stage lives. Relative filenames work when the four pages sit
     in one folder (GitHub Pages, a plain host). On a page builder such as
     Funnelish each stage is its own page with its own URL — put those URLs
     here and the funnel links itself correctly. Ad params ride along either
     way; never hard-code a link between pages anywhere else. */
  routes: {
    quiz: 'index.html',
    scratch: 'scratch.html',
    plan: 'plan.html',
    offer: 'offer.html'
  },

  /* Where the order goes. Ad params ride along automatically. */
  checkoutUrl: '[CHECKOUT_URL]'
};
