/* ==========================================================================
   funnel.config.js - the only file that changes between offers.

   Everything that makes this funnel *this* offer lives here: the brand, the
   colours, the questions, the loader, the reviews, the tiers, the checkout.
   funnel.js and funnel.css are the engine and never need editing to launch a
   new offer.

   Words are not here: they live in copy.js and are edited on the page with
   ?edit=1. The rule of thumb: this file is STRUCTURE (how many questions,
   how many tiers, what colour, what price), copy.js is WORDING.

   The strings that do appear here are seeds. They become the defaults in
   copy.js the first time the page renders, and the owner can rewrite any of
   them in edit mode without coming back to this file.
   ========================================================================== */
window.FUNNEL_CONFIG = {

  /* ---------------------------------------------------------------- brand */
  brand: {
    name: 'Jamo Dating Protocols',
    company: 'Jamo Health Consulting',
    address: '82 Wendell Ave., Ste 100, Pittsfield, MA 01201, United States',
    /* Google Fonts URL. Swap the families and the theme below together;
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
    /* Edit mode: true while you build, then EITHER false to switch it off
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
     Add, remove or reorder freely; the rail, the counter and the step
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
      note: 'Where things stand today, not where they have been.',
      options: ['Recently broke up', 'Single', "It's complicated", 'In a relationship', 'Married'] },

    { id: 'goal', section: 1, kind: 'single',
      title: 'What do you want most right now?',
      note: 'Pick the one you would actually say out loud.',
      options: ['Get her back', 'Make her miss me', 'Rekindle the spark', 'Move on with confidence'] },

    { id: 'who_ended', section: 1, kind: 'single',
      title: 'Who ended it?',
      note: 'There is no better or worse answer here.',
      options: ['She left', 'I walked away and regret it', 'It was mutual'] },

    { id: 'time_since', section: 1, kind: 'single',
      title: 'How long ago did it end?',
      note: 'Timing changes what to do first more than anything else does.',
      options: ['Days ago', 'A few weeks', '1–3 months', 'More than 3 months', "It's complicated"] },

    { id: 'her_behaviour', section: 2, kind: 'single',
      title: 'How is she acting since it ended?',
      note: 'Pick the closest. None of these are dead ends.',
      options: ['Hot and cold, hard to read', 'Cold and distant', 'Only messages when she needs something', 'Total silence', "She's seeing someone else"] },

    { id: 'hardest_part', section: 2, kind: 'single',
      title: "What's the hardest part right now?",
      sub: "Pick the one that's loudest today.",
      options: ["I can't stop thinking about her", "I keep checking what she's doing", 'I never know what to say', "I don't feel like myself"] },

    { id: 'issues', section: 2, kind: 'multi',
      title: 'What went wrong between you?',
      sub: 'Choose all that apply',
      note: 'Be honest. Nobody reads this but you.',
      options: ['Trust', 'Emotional distance', 'Different priorities', 'We argued too much', 'Outside interference', 'I stopped showing up', 'Something else'] },

    { id: 'slipped', section: 2, kind: 'multi',
      title: 'Since the breakup, which of these have slipped?',
      sub: 'Choose all that apply',
      note: 'Most of this slips after a breakup. Saying which helps.',
      options: [
        { value: 'sleep',    label: 'Sleep',              sub: "I'm awake at 3am" },
        { value: 'energy',   label: 'Energy',             sub: 'Flat by mid-afternoon' },
        { value: 'training', label: 'Training and drive', sub: "I've stopped showing up for myself" },
        { value: 'appetite', label: 'Appetite',           sub: 'Eating badly or barely' },
        { value: 'none',     label: 'Nothing physical' }
      ] },

    { id: 'readiness', section: 3, kind: 'single',
      title: 'If she messaged you tonight, would you know what to say?',
      note: 'Be honest. This is usually the gap that matters most.',
      options: ['No idea', "I'd probably get it wrong", 'Roughly', 'Yes'] },

    { id: 'outcomes', section: 3, kind: 'multi',
      title: 'Where do you want to be in 30 days?',
      sub: 'Choose all that apply',
      options: ["She's texting first", "We're talking again", "I've stopped overthinking", 'Back together', 'Sleeping properly', 'Fit and sharp again'] }
  ],

  /* --------------------------------------------------------- interstitials
     Keyed by the question they follow. Three kinds:
       'authority'. the proof screen (number, quote, sources)
       'relief'   . light, copy only
       'insight'  . dark, splits with a photo
     Two or three across a quiz is the ceiling; more and they read as filler. */
  interstitials: {
    age: { id: 'authority', kind: 'authority' },
    goal: { id: 'relief', kind: 'relief',
      title: "That's fixable, and faster than you think",
      body: 'Wanting to {goal_lower} is not the hard part. Knowing the order to do things in is, and that is the whole of what your plan gives you.' },
    slipped: { id: 'insight', kind: 'insight',
      title: 'Every one of those is trainable',
      body: "Trust and emotional distance aren't personality flaws. They're patterns, and patterns respond to a sequence. Your plan starts with the two you picked." }
  },

  /* -------------------------------------------------------------- variants
     Copy that changes with the answers. `key` names the answers that decide
     the segment; `segments` maps "answer | answer" patterns to a segment name
     (first match wins, so specific rows go above general ones, and `*` is a
     wildcard); `copy` gives each segment its text for chosen copy ids.

     WORDS ONLY. Every visitor still walks the same steps and lands on the
     same offer; a segment decides what a paragraph says, never where anyone
     goes. See constraint 4 in AGENTS.md.

     Each entry becomes a real copy id (offer.faq1_a#reconcile_fresh), so all
     of them are editable in ?edit=1 and all ship in copy.js. Preview one with
     ?as=reconcile_fresh without taking the quiz.

     Anything with no entry for the matched segment falls back to `default`,
     and anything not listed here at all is the same for everyone. */
  variants: {
    key: ['status', 'goal'],
    fallback: 'default',

    segments: {
      'Recently broke up | Get her back':            'reconcile_fresh',
      '* | Get her back':                            'reconcile',
      '* | Make her miss me':                        'distance',
      'In a relationship | Rekindle the spark':      'together',
      'Married | Rekindle the spark':                'together',
      '* | Rekindle the spark':                      'rekindle',
      "It's complicated | *":                        'ambiguous',
      '* | Move on with confidence':                 'moveon',
      '* | *':                                       'default'
    },

    copy: {
      /* He is days or weeks out and wants her back. The largest segment, and
         the one most likely to act on urgency, so the answers deliberately
         slow him down rather than promise a reply. */
      reconcile_fresh: {
        'offer.faq1_q': "It only just ended. Is it too early?",
        'offer.faq1_a': "The opposite. The first two weeks are the ones most men spend making it worse, because it is when the urge to explain yourself is strongest. The plan opens with what to do while it is still raw.",
        'offer.faq2_q': "What if she doesn't reply?",
        'offer.faq2_a': "Then you find that out in week one instead of month three. Nothing in the early work depends on her replying, and it is the part that decides whether a reply, if it comes, goes anywhere."
      },

      /* Wants her back, but it has been a while or the status is murkier. */
      reconcile: {
        'offer.faq1_q': "My situation is messier than the quiz allowed for.",
        'offer.faq1_a': "Most are. The sequence does not assume a clean break; it assumes you have limited contact and limited credit with her, and it starts by rebuilding both.",
        'offer.faq2_q': "What if she never replies?",
        'offer.faq2_a': "That is possible, and nobody can promise you otherwise. What this stops is another three months of messages that make a reply less likely, and it gives you work that is worth doing either way."
      },

      /* Wants distance to do the work. The risk here is he hears "go quiet
         and wait", which is the version that fails. */
      distance: {
        'offer.faq1_q': "Isn't this just going quiet on her?",
        'offer.faq1_a': "No. Silence on its own reads as sulking, and she has seen that before. What matters is what you do with the time and what she sees when she looks. Most of the plan is the second part.",
        'offer.faq2_q': "How long before she notices?",
        'offer.faq2_a': "Unknowable, honestly: that depends on her. What is in your control is being worth noticing when she does look, and that starts in week one."
      },

      /* Still together. Easier ground, and the objection is different: he is
         worried this is breakup tactics aimed at someone he lives with. */
      together: {
        'offer.faq1_q': "We're still together, is this for us?",
        'offer.faq1_a': "Yes, and it is easier from here than after a breakup. Nothing asks you to manufacture distance or play games with someone you share a life with; it works on what changed in the day to day, because that is usually where it went.",
        'offer.faq2_q': "Do I have to tell her I'm doing this?",
        'offer.faq2_a': "Your call. Nothing in the plan needs a conversation about the plan. Most of week one is things she will notice without being told, which is generally the better order."
      },

      /* Wants the spark back, but not currently in the relationship. */
      rekindle: {
        'offer.faq1_q': "Can you get it back once it's gone flat?",
        'offer.faq1_a': "Often, yes. Flat is usually a pattern rather than a verdict, and patterns respond to a sequence. What nobody can tell you is whether she wants the same thing, and the plan is honest about testing that early.",
        'offer.faq2_q': "What if she's already checked out?",
        'offer.faq2_a': "Then you will see it sooner rather than after another six months of hoping. That is not the answer you want, but knowing it early is worth more than a plan that pretends otherwise."
      },

      /* "It's complicated": the defining feature is that the rules keep
         moving, so the copy addresses that rather than any one outcome. */
      ambiguous: {
        'offer.faq1_q': "My situation doesn't really fit a category.",
        'offer.faq1_a': "Complicated usually means the rules keep changing and you are the one adapting. The plan starts by making your side predictable, because that is the only half you control.",
        'offer.faq2_q': "What if it never resolves either way?",
        'offer.faq2_a': "Then at least you stop living in the gap. Deciding gets much easier once you are sleeping and not checking her profile, which is what the first two weeks are for."
      },

      /* He said move on. Do not sell him a reconciliation plan. */
      moveon: {
        'offer.faq1_q': "Will this try to talk me into getting her back?",
        'offer.faq1_a': "No. You said move on, so the plan moves on: no reopening scripts, no strategy for making her miss you. It is about getting your sleep, your attention and your weeks back.",
        'offer.faq2_q': "What if I change my mind?",
        'offer.faq2_a': "You might, and that is allowed. The early work is the same either way, and you will be in a far better position to make that call in six weeks than you are tonight."
      },

      /* Anyone the rows above did not catch. */
      default: {
        'offer.faq1_q': "What if my situation is different?",
        'offer.faq1_a': "In the details it will be. The sequence is not built on one story. It is built on the order things have to happen in, and that order holds across most of them.",
        'offer.faq2_q': "What if it doesn't work?",
        'offer.faq2_a': "It might not. Anything involving another person cannot be promised, and you should be suspicious of anyone who does. What is in your control is doing the right things in the right order rather than too early, which is where most of this goes wrong."
      }
    }
  },

  /* ---------------------------------------------------------------- merges
     What {first_name}, {goal} and friends fall back to when someone reaches
     a page without having taken the quiz. Write them in this offer's own
     vocabulary, because they appear in headlines. */
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
     you have real ones, and never strip the label off invented text. */
  reviews: [
    { initials: 'M T', name: 'Marcus T.', meta: 'Sample review',
      body: 'Week one was mostly about me, not about her. That turned out to be the part I had been getting wrong.' },
    { initials: 'D R', name: 'Daniel R.', meta: 'Sample review',
      body: 'The order was what made the difference. I had been doing roughly the right things at completely the wrong time.' },
    { initials: 'J O', name: 'James O.', meta: 'Sample review',
      body: 'First time in two months I got through a whole day without checking her profile. That alone was worth it.' }
  ],

  /* ----------------------------------------------------------------- offer
     Prices live HERE and nowhere else. deliberately outside copy.js, so a
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
     Funnelish each stage is its own page with its own URL; put those URLs
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
