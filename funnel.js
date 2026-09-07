/* ==========================================================================
   Jamo Dating Protocols funnel — shared runtime.

   Loaded by every page. Exposes:
     Funnel.answers      read/write the quiz answer store (localStorage)
     Funnel.link(href)   carries ad params across page loads
     Funnel.hydrate()    fills [data-merge] slots on plan/offer pages
     Funnel.quiz()       boots the single-page quiz (index.html only)

   The quiz never navigates. Every question is a step rendered into one
   container; the browser back button walks steps via history state. The only
   real navigation is the redirect at the end -> scratch.html.
   ========================================================================== */
(function (global) {
  'use strict';

  /* -------------------------------------------------------------- config
     funnel.config.js is the only file that changes between offers. Every
     default below is a fallback for when it is missing, so the engine still
     runs (and still says something sensible) if the config fails to load. */
  var CFG = global.FUNNEL_CONFIG || {};
  function cfg(path, fallback) {
    var node = CFG, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (node == null || node[parts[i]] === undefined) return fallback;
      node = node[parts[i]];
    }
    return node;
  }

  /* Theme and fonts come from the config as CSS custom properties, so a new
     offer restyles without touching funnel.css. Runs before first paint. */
  function applyTheme() {
    var t = cfg('theme', {}), r = document.documentElement;
    var MAP = {
      cold: '--cold', coldTint: '--cold-tint', coldLine: '--cold-line',
      warm: '--warm', warmTint: '--warm-tint', warmLine: '--warm-line',
      ink: '--ink', ink2: '--ink-2', slate: '--slate', mute: '--mute',
      faint: '--faint', line: '--line', line2: '--line-2',
      shade: '--shade', paper: '--paper'
    };
    Object.keys(MAP).forEach(function (k) { if (t[k]) r.style.setProperty(MAP[k], t[k]); });
    var b = cfg('brand', {});
    if (b.display) r.style.setProperty('--disp', b.display);
    if (b.body) r.style.setProperty('--body', b.body);
    if (b.mono) r.style.setProperty('--mono', b.mono);
    if (b.fonts && !document.querySelector('link[data-funnel-fonts]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = b.fonts; l.setAttribute('data-funnel-fonts', '');
      document.head.appendChild(l);
    }
  }
  applyTheme();

  /* Registered before any page renders, so markup placeholders like [BRAND]
     and [COMPANY] resolve to this offer's names without being edited. */
  function seedBrandCopy() {
    t('brand.wordmark', cfg('brand.name', 'Jamo Dating Protocols'));
    t('foot.company', cfg('brand.company', 'Jamo Health Consulting') + ' · ' + cfg('brand.address', '82 Wendell Ave., Ste 100, Pittsfield, MA 01201, United States'));
  }

  /* ---------------------------------------------------------------- data */

  // Ad/tracking params that must survive every hop in the funnel.
  var PASS_THROUGH = [
    'sid', 'source', 'adset_name', 'ad_name', 'placement', 'campaign_id',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'fbclid', 'ttclid', 'gclid', 'lang'
  ];

  /* sessionStorage, not localStorage: answers live as long as the tab does.
     Close it, or come back tomorrow from a new ad click, and the quiz starts
     from the age gate. They still survive the hops to scratch / plan / offer,
     because those are the same tab. */
  var STORE = 'bq.answers.v1';

  /* ---------------------------------------------------------------- copy
     Every string on the site can be overridden by an id. Defaults live in the
     markup and in QUESTIONS below; copy.js (window.COPY) overrides them; the
     edit-mode draft in localStorage overrides that. Nothing here changes what
     visitors see unless copy.js has a value for the id. */
  var COPY = global.COPY || {};
  var DEFAULTS = {};                 // id -> the string as authored
  /* Edit mode is gated by flow.edit in funnel.config.js:
       true          ?edit=1 works — use while you are building
       false         edit mode is off entirely — the launch setting
       'some-word'   ?edit=some-word works, ?edit=1 does not

     The key is a guard against a stray ?edit=1 in a shared link, NOT a
     security control: funnel.config.js is served to the browser, so anyone
     who looks can read it. That is acceptable because edit mode only ever
     changes what that one browser sees — it cannot touch your live copy. */
  var EDIT = (function () {
    var want = new URLSearchParams(location.search).get('edit');
    if (want == null) return false;
    var allow = cfg('flow.edit', true);
    if (allow === false || allow == null) return false;
    if (allow === true) return want === '1';
    return want === String(allow);
  })();

  /* Drafts apply ONLY in edit mode. Without this, copy you typed on the live
     URL and never discarded keeps overriding copy.js in your own browser —
     so you check the live site, see your unpushed words, and conclude the
     deploy worked when it did not. */
  var DRAFT_KEY = 'bq.copydraft.v1';
  var draft = {};
  if (EDIT) { try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch (e) {} }

  function t(id, fallback) {
    DEFAULTS[id] = fallback;
    if (draft[id] != null) return draft[id];
    if (COPY[id] != null) return COPY[id];
    return fallback;
  }
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
  }
  /* Copy strings may carry markdown-style links: "our [Terms](#) apply".
     Editors see the raw form and can move or reword them; visitors get real
     anchors. Everything is escaped first — the copy file is data, not markup. */
  function linkify(str) {
    return esc(str).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
      return '<a href="' + href + '">' + label + '</a>';
    });
  }
  function hasLink(str) { return /\[[^\]]+\]\([^)\s]+\)/.test(str); }
  var store = window.sessionStorage;

  // One question = one object. Add, remove or reorder freely: the progress
  // rail, the step count and the desktop index all read from this array.
  var QUESTIONS = cfg('questions', [
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
        { value: 'sleep',    label: 'Sleep',             sub: "I'm awake at 3am" },
        { value: 'energy',   label: 'Energy',            sub: 'Flat by mid-afternoon' },
        { value: 'training', label: 'Training and drive', sub: "I've stopped showing up for myself" },
        { value: 'appetite', label: 'Appetite',          sub: 'Eating badly or barely' },
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
  ]);

  var SECTION_NAMES = cfg('sections', { 1: 'Your situation', 2: 'Her signals & your patterns', 3: 'Readiness' });

  // Interstitials sit between questions, keyed by the question they follow.
  var INTERSTITIALS = cfg('interstitials', {
    age: { id: 'authority', kind: 'authority' },
    goal: { id: 'relief', kind: 'relief',
      title: "That's fixable — and faster than you think",
      body: 'Wanting to {goal_lower} is not the hard part. Knowing the order to do things in is, and that is the whole of what your plan gives you.' },
    slipped: { id: 'insight', kind: 'insight',
      title: 'Every one of those is trainable',
      body: "Trust and emotional distance aren't personality flaws — they're patterns, and patterns respond to a sequence. Your plan starts with the two you picked." }
  });

  var LOADER_PHASES = cfg('loader.phases', ['Mapping your situation', 'Scoring her signals', 'Selecting your modules']);

  /* Sample social proof for the loader screen.
     These are SAMPLE copy so the funnel is presentable in review — every card
     says so on its face, and the names are initials, not invented people with
     verified badges. Replace all three with real reviews before you spend a
     dollar on traffic; do not remove the SAMPLE meta until you do. */
  var REVIEWS = cfg('reviews', [
    { initials: 'M T', name: 'Marcus T.', meta: 'Sample review',
      body: 'Week one was mostly about me, not about her. That turned out to be the part I had been getting wrong.' },
    { initials: 'D R', name: 'Daniel R.', meta: 'Sample review',
      body: 'The order was what made the difference. I had been doing roughly the right things at completely the wrong time.' },
    { initials: 'J O', name: 'James O.', meta: 'Sample review',
      body: 'First time in two months I got through a whole day without checking her profile. That alone was worth it.' }
  ]);

  // The micro-commitment asked mid-loader. Edit mode never runs the loader, so
  // this and the modal's buttons are registered by hand below to keep them in
  // copy.js.
  var COMMITMENT_Q = cfg('loader.commitment', 'Are you someone who finishes what you start?');

  /* -------------------------------------------------------------- store */

  function read() {
    try { return JSON.parse(store.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function write(data) {
    try { store.setItem(STORE, JSON.stringify(data)); } catch (e) {}
  }
  function set(key, value) {
    var d = read(); d[key] = value; d.updatedAt = Date.now(); write(d); return d;
  }
  function clear() { try { store.removeItem(STORE); } catch (e) {} }



  /* ------------------------------------------------------------- params */

  function currentParams() {
    var out = new URLSearchParams();
    var here = new URLSearchParams(location.search);
    PASS_THROUGH.forEach(function (k) { if (here.get(k)) out.set(k, here.get(k)); });
    return out;
  }
  function link(href) {
    var qs = currentParams().toString();
    return qs ? href + (href.indexOf('?') > -1 ? '&' : '?') + qs : href;
  }
  /* Stage names resolve through config.routes so the funnel works on a page
     builder where 'scratch.html' is really /your-discount. Anything that is
     already a path or URL passes through untouched. */
  function route(name) { return cfg('routes.' + name, null) || name; }
  function go(href) { location.href = link(route(href)); }

  /* ------------------------------------------------------------- merges */

  function first(v, fallback) {
    if (Array.isArray(v)) return v.length ? v[0] : fallback;
    return v || fallback;
  }
  function promoCode(name) {
    var d = new Date();
    var mon = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][d.getMonth()];
    return (name || 'you').toLowerCase().replace(/[^a-z]/g, '') + '_' + mon + String(d.getFullYear()).slice(2);
  }
  function mergeValues() {
    var a = read();
    var issues = a.issues || [];
    var outcomes = a.outcomes || [];
    /* Fallbacks are per-offer vocabulary, so they live in the config. They
       only ever show if someone lands on a later page without taking the
       quiz — but "Your  plan," reads as broken, so they have to say
       something in this offer's language. */
    var d = cfg('merges', {});
    var goal = a.goal || d.goal || 'your plan';
    return {
      first_name: a.first_name || d.first_name || 'there',
      her_name: a.her_name || d.her_name || 'her',
      status: a.status || d.status || '',
      goal: goal,
      goal_lower: String(goal).toLowerCase(),
      time_since: a.time_since || d.time_since || 'recently',
      hardest_part: a.hardest_part || d.hardest_part || '',
      issue_1: issues[0] || d.issue_1 || '',
      issue_2: issues[1] || d.issue_2 || '',
      issue_1_lower: String(issues[0] || d.issue_1 || '').toLowerCase(),
      issue_2_lower: String(issues[1] || d.issue_2 || '').toLowerCase(),
      outcome_1: outcomes[0] || d.outcome_1 || '',
      outcome_2: outcomes[1] || d.outcome_2 || '',
      promo_code: promoCode(a.first_name),
      discount: String(cfg('flow.discountPct', 64)),
      brand: cfg('brand.name', 'Jamo Dating Protocols'),
      company: cfg('brand.company', 'Jamo Health Consulting'),
      address: cfg('brand.address', '82 Wendell Ave., Ste 100, Pittsfield, MA 01201, United States')
    };
  }
  function hydrate(root) {
    var v = mergeValues();
    (root || document).querySelectorAll('[data-merge]').forEach(function (el) {
      var key = el.getAttribute('data-merge');
      if (v[key] != null) el.textContent = v[key];
    });
  }
  function fillTemplate(str) {
    var v = mergeValues();
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
  }

  /* -------------------------------------------------------------- icons */

  var ICON = {
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square"><path d="M15 5l-7 7 7 7"/></svg>',
    chev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A1AD" stroke-width="2" stroke-linecap="square"><path d="M9 5l7 7-7 7"/></svg>',
    tick: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="square"><path d="M4 12l6 6L20 6"/></svg>',
    done: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B34F0" stroke-width="2.5" stroke-linecap="square"><path d="M4 12l6 6L20 6"/></svg>',
    quote: '<svg width="22" height="16" viewBox="0 0 22 16" fill="#2B34F0"><path d="M0 16V8.6C0 3.9 2.7.8 7 0l1 2.6C5.4 3.4 4 5 3.9 7.2H8V16H0zm13 0V8.6c0-4.7 2.7-7.8 7-8.6l1 2.6c-2.6.8-4 2.4-4.1 4.6H21V16h-8z"/></svg>'
  };
  var LETTERS = 'ABCDEFG';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function opt(o) { return typeof o === 'string' ? { value: o, label: o } : o; }

  /* IMG — emit one swappable image slot.
     The value is just a path string, so it rides the same copy.js the words
     do: nothing new to deploy, and ?edit=1 can set it. Empty value = show the
     grey placeholder, which is what keeps an unfilled slot obvious. */
  function IMG(id, wrapClass, placeholder, attrs) {
    t(id, '');                       // register it, so it reaches copy.js
    return '<span class="' + wrapClass + ' phslot"' + (attrs ? ' ' + attrs : '') +
      ' data-img="' + id + '" data-ph="' + esc(placeholder) + '" data-default=""></span>';
  }

  /* C — emit one editable string.
     Every visible word in the quiz goes through this, so every visible word
     shows up in copy.js and can be retyped on the page with ?edit=1. */
  function C(id, def, tag, attrs) {
    tag = tag || 'span';
    return '<' + tag + (attrs ? ' ' + attrs : '') +
      ' data-copy="' + id + '" data-default="' + esc(def) + '">' +
      esc(t(id, def)) + '</' + tag + '>';
  }

  /* --------------------------------------------------------------- quiz */

  function quiz(opts) {
    opts = opts || {};
    var mount = document.getElementById(opts.mount || 'quiz');
    if (!mount) return;

    // Build the flat step list: questions with their interstitials woven in.
    var steps = [];
    QUESTIONS.forEach(function (q) {
      steps.push({ kind: 'question', q: q });
      if (INTERSTITIALS[q.id]) steps.push({ kind: 'interstitial', data: INTERSTITIALS[q.id] });
    });
    steps.push({ kind: 'loader' });
    if (cfg('flow.emailStep', true) !== false) steps.push({ kind: 'email' });
    if (cfg('flow.namesStep', true) !== false) steps.push({ kind: 'names' });

    var qCount = QUESTIONS.length;                       // 11
    var groups = [0, 0, 0];
    QUESTIONS.forEach(function (q) { groups[q.section - 1]++; });   // 5 / 4 / 2

    var i = 0;
    var loaderTimer = null;

    /* Screens that never render in edit mode still need their ids in copy.js */
    t('modal.eyebrow', 'One quick thing');
    t('modal.question', COMMITMENT_Q);
    t('modal.no', 'No');
    t('modal.yes', 'Yes');

    function questionNumber(q) { return QUESTIONS.indexOf(q) + 1; }

    function railHTML(filled) {
      var n = 0;
      return '<div class="rail">' + groups.map(function (g) {
        var segs = '';
        for (var k = 0; k < g; k++) { n++; segs += '<span class="rail__seg' + (n <= filled ? ' is-on' : '') + '"></span>'; }
        return '<div class="rail__group" style="flex-grow:' + g + '">' + segs + '</div>';
      }).join('') + '</div>';
    }

    function topbar(o) {
      o = o || {};
      return '<header class="topbar">' +
        '<div class="topbar__side">' +
          (o.back === false ? '' : '<button class="iconbtn" type="button" data-act="back" aria-label="Go back">' + ICON.back + '</button>') +
        '</div>' +
        (o.section
          ? '<span class="eyebrow topbar__section">' + esc(o.section) + '</span>'
          : C('brand.wordmark', cfg('brand.name', 'Jamo Dating Protocols'), 'span', 'class="wordmark"')) +
        '<div class="topbar__side topbar__side--end">' +
          (o.count ? '<span class="eyebrow">' + o.count + '</span>' : '') +
        '</div>' +
      '</header>';
    }

    /* --- renderers --- */

    function renderAge(q) {
      return '<div class="app fade">' +
        topbar({ back: false }) +
        '<div class="panel" style="padding-bottom:26px">' +
          '<h1 class="h1" style="margin-bottom:10px" data-copy="q:age:title">' + esc(t('q:age:title', q.title)) + '</h1>' +
          '<p class="eyebrow" data-copy="q:age:sub">' + esc(t('q:age:sub', q.sub)) + '</p>' +
        '</div>' +
        '<div class="panel" style="padding-bottom:28px">' +
          '<div class="agegrid">' + q.options.map(function (o, idx) {
            var oid = 'q:age:opt:' + idx;
            return '<button class="agecard" type="button" data-value="' + esc(o.value) + '">' +
              IMG('img.age' + idx, 'agecard__ph', '[PHOTO ' + o.label + ']') +
              '<span class="agecard__foot">' +
                C(oid, o.label, 'span', 'class="agecard__label"') + ICON.chev +
              '</span>' +
            '</button>';
          }).join('') + '</div>' +
        '</div>' +
        /* Page-level fine print, not a control: it belongs at the foot of the
           page, not 28px under the last thing you touched. .legalfoot takes
           margin-top:auto so it sits on the bottom edge at any height. */
        C('age.legal',
          'By continuing you agree to our [Terms](#), [Privacy Policy](#) and [Subscription Terms](#).',
          'p', 'class="legalfoot"') +
      '</div>';
    }

    function renderQuestion(q) {
      var n = questionNumber(q);
      var multi = q.kind === 'multi';
      var picked = read()[q.id] || (multi ? [] : null);

      var options = q.options.map(function (raw, idx) {
        var o = opt(raw);
        var oid = 'q:' + q.id + ':opt:' + idx;
        var olabel = t(oid, o.label);
        var osub = o.sub ? t(oid + ':sub', o.sub) : null;
        var on = multi ? picked.indexOf(o.value) > -1 : picked === o.value;
        var marker = multi
          ? '<span class="opt__box">' + ICON.tick + '</span>'
          : '<span class="opt__key">' + LETTERS[idx] + '</span>';
        var text = osub
          ? '<span class="opt__text"><span class="opt__label" data-copy="' + oid + '">' + esc(olabel) + '</span>' +
              '<span class="opt__sub" data-copy="' + oid + ':sub">' + esc(osub) + '</span></span>'
          : '<span class="opt__label" data-copy="' + oid + '">' + esc(olabel) + '</span>';
        return '<button class="opt' + (on ? ' is-on' : '') + '" type="button" data-value="' + esc(o.value) + '"' +
          (multi ? ' aria-pressed="' + (on ? 'true' : 'false') + '"' : '') + '>' + marker + text + '</button>';
      }).join('');

      return '<div class="app fade">' +
        topbar({ section: t('section.' + q.section, SECTION_NAMES[q.section]),
                 count: String(n).padStart(2, '0') + '/' + qCount }) +
        '<div class="quiz__rail">' + railHTML(n) + '</div>' +
        '<div class="step">' +
          '<div class="step__body">' +
            '<div class="step__lede">' +
              C('section.' + q.section, SECTION_NAMES[q.section], 'span', 'class="eyebrow eyebrow--cold"') +
              '<h1 class="q-title" data-copy="q:' + q.id + ':title">' + esc(t('q:' + q.id + ':title', q.title)) + '</h1>' +
              (q.sub && !multi ? '<p class="q-sub" data-copy="q:' + q.id + ':sub">' + esc(t('q:' + q.id + ':sub', q.sub)) + '</p>' : '') +
              (multi ? '<p class="eyebrow" data-copy="q:' + q.id + ':sub">' + esc(t('q:' + q.id + ':sub', q.sub || 'Choose all that apply')) + '</p>' : '') +
              (q.note ? '<p class="q-sub" data-copy="q:' + q.id + ':note">' + esc(t('q:' + q.id + ':note', q.note)) + '</p>' : '') +
              '<div class="q-index"><span class="q-index__n">' + String(n).padStart(2, '0') + '</span>' +
                '<span class="q-index__of">/ ' + qCount + '</span></div>' +
            '</div>' +
            '<div class="options">' + options +
              '<div class="step__foot">' +
                (multi
                  ? '<p class="foot-note foot-note--live" data-count>' +
                      esc(t('ui.selected', '{n} selected').replace('{n}', picked.length)) + '</p>' +
                    C('ui.continue', 'Continue', 'button', 'class="btn" type="button" data-act="next"' + (picked.length ? '' : ' disabled'))
                  : C('ui.tap_hint', 'Tap an answer to continue', 'p', 'class="foot-note"')) +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function renderAuthority() {
      return '<div class="app fade">' +
        topbar({}) +
        '<div class="panel panel--narrow" style="padding-top:26px">' +
          C('i:authority:number', '51,000+', 'p', 'class="h1" style="color:var(--cold);margin-bottom:6px"') +
          C('i:authority:number_sub', 'men have run this plan', 'p', 'class="h2" style="margin-bottom:26px"') +
          '<div class="card card--shade" style="display:flex;flex-direction:column;gap:16px">' +
            ICON.quote +
            C('i:authority:quote',
              "You don't need to beg or chase. You need to change what she feels when your name comes up.",
              'p', 'class="h2" style="font-weight:600"') +
            C('i:authority:attrib', 'The Jamo Dating Protocols team',
              'p', 'class="q-sub" style="border-top:1px solid var(--line);padding-top:14px;margin:0"') +
          '</div>' +
          C('i:authority:sources',
            'Built on published research into attachment and re-connection — [SOURCE 1](#), [SOURCE 2](#). Cite what you actually used.',
            'p', 'class="q-sub" style="margin-top:22px"') +
          '<div class="step__foot">' +
            C('i:authority:cta', 'Continue', 'button', 'class="btn" type="button" data-act="next"') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function renderBeat(d) {
      /* The insight beat carries a photo, so it splits. The relief beat is
         copy only — it gets the same single column as every other text screen
         rather than sitting in an empty half. */
      var dark = d.kind === 'insight';
      return '<div class="app fade' + (dark ? ' dark' : '') + '">' +
        topbar({}) +
        '<div class="' + (dark ? 'split' : '') + '">' +
          '<div class="' + (dark ? 'split__col' : '') + '">' +
            '<div class="panel panel--narrow" style="padding-top:26px;display:flex;flex-direction:column;gap:16px">' +
              C('i:' + d.id + ':eyebrow', 'Worth knowing', 'span', 'class="eyebrow eyebrow--cold"') +
              C('i:' + d.id + ':title', d.title, 'h1', 'class="h1"') +
              C('i:' + d.id + ':body', d.body, 'p', 'class="lede"') +
              '<div class="step__foot">' +
                C('i:' + d.id + ':cta', 'Continue', 'button',
                  'class="btn' + (dark ? ' btn--light' : '') + '" type="button" data-act="next"') +
              '</div>' +
            '</div>' +
          '</div>' +
          (dark ? '<div class="split__col split__col--media">' +
                    IMG('img.insight', 'media', '[PHOTO — MAN, EARLY MORNING, CALM]') +
                  '</div>' : '') +
        '</div>' +
      '</div>';
    }

    function renderLoader() {
      return '<div class="app fade">' +
        topbar({ back: false }) +
        '<div class="panel" style="padding-bottom:30px">' +
          C('loader.h1', 'Building your plan', 'h1', 'class="h2" style="margin-bottom:6px"') +
          C('loader.sub', 'Based on your ' + qCount + ' answers', 'p', 'class="q-sub"') +
        '</div>' +
        '<div class="panel"><div class="phases">' + LOADER_PHASES.map(function (name, idx) {
          var segs = '';
          for (var k = 0; k < 12; k++) segs += '<span class="rail__seg"></span>';
          return '<div class="phase is-idle" data-phase="' + idx + '">' +
            '<div class="phase__head">' +
              C('loader.phase' + (idx + 1), name, 'span', 'class="phase__name"') +
              '<span class="phase__pct">—</span><span class="phase__check">' + ICON.done + '</span></div>' +
            '<div class="rail__group">' + segs + '</div>' +
          '</div>';
        }).join('') + '</div></div>' +
        '<div class="panel" style="padding-top:40px;padding-bottom:34px">' +
          C('loader.reviews_label', 'What men say after week one', 'p', 'class="eyebrow" style="margin-bottom:14px"') +
          '<div class="reviews">' + REVIEWS.map(function (r, idx) {
            var n = idx + 1;
            /* The avatar is an image slot whose empty state is the monogram,
               not a grey box — an unfilled review still looks finished. The
               initials stay editable in copy.js under review<n>.initials. */
            return '<div class="card"><div class="review__head">' +
              IMG('img.review' + n, 'review__av', t('review' + n + '.initials', r.initials)) +
              '<span class="review__id">' +
                C('review' + n + '.name', r.name, 'span', 'class="review__name"') +
                C('review' + n + '.meta', r.meta, 'span', 'class="review__meta"') +
              '</span></div>' +
              C('review' + n + '.body', r.body, 'p', 'class="review__body"') +
            '</div>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>';
    }

    function renderEmail() {
      return '<div class="app fade">' +
        topbar({}) +
        '<div class="panel panel--centred" style="padding-top:26px">' +
          C('email.eyebrow', 'Plan ready', 'span', 'class="eyebrow eyebrow--cold"') +
          C('email.h1', 'Where should we send your plan?', 'h1', 'class="h1"') +
          C('email.lede', "We'll email you a copy so you can come back to it. Your results open on the next screen either way.", 'p', 'class="lede"') +
        '</div>' +
        '<div class="panel panel--centred" style="padding-top:26px;gap:18px">' +
          '<label class="field" style="width:100%">' +
            '<input type="email" name="email" inputmode="email" autocomplete="email" placeholder="' +
              esc(t('email.placeholder', 'you@email.com')) + '" required>' +
          '</label>' +
          '<label class="checkrow"><input type="checkbox" name="optin"><span class="checkrow__box">' + ICON.tick + '</span>' +
            C('email.optin', 'Also send me weekly tactics and updates. Separate from your plan — skip it and still continue.',
              'span', 'class="checkrow__text"') + '</label>' +
          C('email.privacy', "We don't sell your data and one click unsubscribes you. [Privacy Policy](#).",
            'p', 'class="checkrow__text" style="text-align:left"') +
          '<div class="step__foot">' +
            C('email.cta', 'Send my plan', 'button', 'class="btn" type="button" data-act="email"') +
            C('email.foot', 'Next: your name and hers', 'p', 'class="foot-note"') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function renderNames() {
      return '<div class="app fade">' +
        topbar({}) +
        '<div class="panel panel--centred" style="padding-top:26px">' +
          C('names.eyebrow', 'Last step', 'span', 'class="eyebrow eyebrow--cold"') +
          C('names.h1', 'Who is this plan for?', 'h1', 'class="h1"') +
          C('names.lede', "Both names go into your plan so the scripts read like something you'd actually send.", 'p', 'class="lede"') +
        '</div>' +
        '<div class="panel panel--centred" style="padding-top:26px;gap:16px">' +
          '<div style="width:100%">' + C('names.label_you', 'Your first name', 'span', 'class="field__label"') +
            '<label class="field"><input type="text" name="first_name" autocomplete="given-name" placeholder="' +
              esc(t('names.placeholder_you', 'Alex')) + '" required></label></div>' +
          '<div style="width:100%">' + C('names.label_her', 'Her name', 'span', 'class="field__label"') +
            '<label class="field"><input type="text" name="her_name" placeholder="' +
              esc(t('names.placeholder_her', 'Type her name')) + '" required></label></div>' +
          C('names.privacy', 'Names stay on your plan. We never message anyone on your behalf.',
            'p', 'class="checkrow__text" style="text-align:left"') +
          '<div class="step__foot">' +
            C('names.cta', 'Continue', 'button', 'class="btn" type="button" data-act="names"') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    /* --- step machine --- */

    function render() {
      if (loaderTimer) { clearInterval(loaderTimer); loaderTimer = null; }
      var s = steps[i];
      var html;
      if (s.kind === 'question') html = s.q.kind === 'age' ? renderAge(s.q) : renderQuestion(s.q);
      else if (s.kind === 'interstitial') html = s.data.kind === 'authority' ? renderAuthority() : renderBeat(s.data);
      else if (s.kind === 'loader') html = renderLoader();
      else if (s.kind === 'email') html = renderEmail();
      else html = renderNames();

      mount.innerHTML = html;
      window.scrollTo(0, 0);
      applyCopy(mount);
      if (EDIT) {
        enableEditing(mount);
        var lbl = document.getElementById('editStep');
        if (lbl) lbl.textContent = (i + 1) + '/' + steps.length;
      }
      if (s.kind === 'loader' && !EDIT) runLoader();
      var input = mount.querySelector('input');
      if (input && window.matchMedia('(min-width:900px)').matches) input.focus();
    }

    function goTo(n, push) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      if (push !== false) history.pushState({ step: i }, '', '#' + (i + 1));
      render();
    }
    function next() { if (i < steps.length - 1) goTo(i + 1); else finish(); }

    /* The scratch page is optional; without it the quiz hands straight to
       the plan. Nothing else in the flow needs to know. */
    function finish() { go(cfg('flow.scratch', true) === false ? 'plan' : 'scratch'); }

    /* --- loader: three phases, one micro-commitment modal at phase 2 --- */

    function runLoader() {
      /* Four seconds, end to end. Long enough to read as work, short enough
         that nobody bails. The modal pauses the clock, so the visible progress
         is always ~4s of motion regardless of how long they take to answer. */
      var fast = new URLSearchParams(location.search).get('fast') === '1';
      var total = fast ? 1200 : cfg('flow.loaderSeconds', 4) * 1000;
      var phaseMs = total / LOADER_PHASES.length;
      var tick = 40;                        // smooth bar, not a 250ms stutter
      var phase = 0, pct = 0, paused = false, asked = false;
      var els = mount.querySelectorAll('.phase');

      function paint() {
        els.forEach(function (el, idx) {
          var segs = el.querySelectorAll('.rail__seg');
          var p = idx < phase ? 100 : idx === phase ? pct : 0;
          el.className = 'phase ' + (idx < phase ? 'is-done' : idx === phase ? 'is-live' : 'is-idle');
          el.querySelector('.phase__pct').textContent = idx === phase ? Math.round(p) + '%' : '—';
          segs.forEach(function (seg, k) {
            seg.classList.toggle('is-on', (k + 1) / segs.length * 100 <= p);
          });
        });
      }
      paint();

      loaderTimer = setInterval(function () {
        if (paused) return;
        pct += 100 / (phaseMs / tick);
        if (phase === 1 && pct >= 50 && !asked) {
          asked = true; paused = true;
          ask(COMMITMENT_Q, function () { paused = false; });
        }
        if (pct >= 100) { pct = 0; phase++; }
        if (phase >= LOADER_PHASES.length) { clearInterval(loaderTimer); loaderTimer = null; next(); return; }
        paint();
      }, tick);
    }

    function ask(question, done) {
      var wrap = document.createElement('div');
      wrap.className = 'modal';
      wrap.innerHTML = '<div class="modal__card" role="dialog" aria-modal="true">' +
        C('modal.eyebrow', 'One quick thing', 'span', 'class="eyebrow"') +
        C('modal.question', question, 'h2', 'class="modal__title"') +
        '<div class="modal__actions">' +
          C('modal.no', 'No', 'button', 'class="btn btn--quiet" type="button" data-a="no"') +
          C('modal.yes', 'Yes', 'button', 'class="btn" type="button" data-a="yes"') +
        '</div></div>';
      applyCopy(wrap);
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('[data-a]');
        if (!b) return;
        set('commitment', b.getAttribute('data-a'));
        wrap.remove();
        done();
      });
      document.body.appendChild(wrap);
      wrap.querySelector('[data-a="yes"]').focus();
    }

    /* --- events --- */

    mount.addEventListener('click', function (e) {
      var s = steps[i];

      var back = e.target.closest('[data-act="back"]');
      if (back) { history.back(); return; }

      var nextBtn = e.target.closest('[data-act="next"]');
      if (nextBtn) {
        if (s.kind === 'question' && s.q.kind === 'multi') {
          var picked = read()[s.q.id] || [];
          if (!picked.length) return;
        }
        next(); return;
      }

      if (e.target.closest('[data-act="email"]')) {
        var email = mount.querySelector('input[name="email"]');
        if (!email || !email.checkValidity() || !email.value) { email && email.reportValidity(); return; }
        set('email', email.value.trim());
        set('marketing_optin', !!mount.querySelector('input[name="optin"]:checked'));
        next(); return;
      }

      if (e.target.closest('[data-act="names"]')) {
        var fn = mount.querySelector('input[name="first_name"]');
        var hn = mount.querySelector('input[name="her_name"]');
        if (!fn.value.trim()) { fn.reportValidity(); return; }
        set('first_name', fn.value.trim());
        set('her_name', hn.value.trim());
        next(); return;
      }

      var choice = e.target.closest('[data-value]');
      if (!choice || s.kind !== 'question') return;
      if (EDIT) return;   // editing copy, not taking the quiz
      var value = choice.getAttribute('data-value');
      var q = s.q;

      if (q.kind === 'multi') {
        var list = read()[q.id] || [];
        var at = list.indexOf(value);
        if (at > -1) list.splice(at, 1); else list.push(value);
        set(q.id, list);
        choice.classList.toggle('is-on');
        choice.setAttribute('aria-pressed', at > -1 ? 'false' : 'true');
        var label = mount.querySelector('[data-count]');
        var btn = mount.querySelector('[data-act="next"]');
        if (label) label.textContent = t('ui.selected', '{n} selected').replace('{n}', list.length);
        if (btn) btn.disabled = !list.length;
        return;
      }

      set(q.id, value);
      mount.querySelectorAll('.opt, .agecard').forEach(function (el) { el.classList.remove('is-on'); });
      choice.classList.add('is-on');
      setTimeout(next, 160);   // brief confirmation, then advance
    });

    window.addEventListener('popstate', function (e) {
      var n = (e.state && typeof e.state.step === 'number') ? e.state.step : 0;
      i = Math.max(0, Math.min(steps.length - 1, n));
      render();
    });

    /* Render every step once into nothing, so every id the quiz can ever show
       is registered before anyone clicks Download. Without this, downloading
       copy.js from screen 2 would only contain screens 1 and 2. */
    steps.forEach(function (s) {
      try {
        if (s.kind === 'question') s.q.kind === 'age' ? renderAge(s.q) : renderQuestion(s.q);
        else if (s.kind === 'interstitial') s.data.kind === 'authority' ? renderAuthority() : renderBeat(s.data);
        else if (s.kind === 'loader') renderLoader();
        else if (s.kind === 'email') renderEmail();
        else renderNames();
      } catch (e) {}
    });

    /* Every load of the quiz is a fresh start — no half-finished state, no
       landing on a screen you don't remember reaching. Refreshing restarts it
       too; that is the deliberate trade for predictability. */
    clear();
    i = 0;
    history.replaceState({ step: 0 }, '', '#1');
    render();

    if (EDIT) {
      initCopy({
        label: '1/' + steps.length,
        prev: function () { goTo(Math.max(0, i - 1)); },
        next: function () { goTo(Math.min(steps.length - 1, i + 1)); }
      });
    }
  }

  /* --------------------------------------------------------- edit mode
     ?edit=1 turns every [data-copy] element into a text field in place. Edits
     land in a localStorage draft so they survive reloads, and Download writes
     a copy.js you drop into the project. Visitors never see any of this. */

  function applyCopy(root) {
    (root || document).querySelectorAll('[data-copy]').forEach(function (el) {
      var id = el.getAttribute('data-copy');
      var def = el.getAttribute('data-default');
      /* A default already registered from funnel.config.js wins over the
         placeholder sitting in the markup — that is how [BRAND] becomes the
         real name on pages the engine does not render itself. */
      if (def == null) def = DEFAULTS[id] != null ? DEFAULTS[id] : el.textContent.trim();
      if (DEFAULTS[id] == null) DEFAULTS[id] = def;
      var raw = draft[id] != null ? draft[id] : (COPY[id] != null ? COPY[id] : def);
      /* {first_name} and friends — and [label](href) links — stay visible while
         editing so they can be moved or removed; visitors get them resolved */
      if (EDIT) { el.textContent = raw; return; }
      var filled = fillTemplate(raw);
      if (hasLink(filled)) el.innerHTML = linkify(filled);
      else el.textContent = filled;
    });

    /* Image slots: a path fills the frame, an empty value shows the label.
       previewSrc is a blob URL held only for the tab you picked the file in,
       so edit mode can show the picture before the file is in the repo. */
    (root || document).querySelectorAll('[data-img]').forEach(function (el) {
      var id = el.getAttribute('data-img');
      if (DEFAULTS[id] == null) DEFAULTS[id] = el.getAttribute('data-default') || '';
      var path = draft[id] != null ? draft[id] : (COPY[id] != null ? COPY[id] : DEFAULTS[id]);
      var src = previewSrc[id] || path;
      if (src) {
        el.classList.add('is-filled');
        el.innerHTML = '<img src="' + esc(src) + '" alt="" loading="lazy">';
      } else {
        el.classList.remove('is-filled');
        el.textContent = el.getAttribute('data-ph') || '';
      }
      if (EDIT) el.setAttribute('title', path ? path : 'Click to choose an image');
    });
  }

  /* blob previews, this tab only — never written to the draft or to copy.js */
  var previewSrc = {};

  function pickImage(el) {
    var id = el.getAttribute('data-img');
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      /* The site is static: we can't write the file into the repo from here.
         So we record the path it will have and preview the local file, and
         the bar tells you which file to drop into images/. */
      var name = f.name.replace(/[^A-Za-z0-9._-]/g, '-');
      draft[id] = 'images/' + name;
      saveDraft();
      previewSrc[id] = URL.createObjectURL(f);
      applyCopy();
      pending[name] = true;
      updateBar();
    });
    input.click();
  }
  var pending = {};

  function updateBar() {
    var c = document.getElementById('editCount');
    if (c) c.textContent = Object.keys(draft).length;
    var n = document.getElementById('editFiles');
    if (!n) return;
    var files = Object.keys(pending);
    n.textContent = files.length ? 'Copy into images/: ' + files.join(', ') : '';
    n.hidden = !files.length;
  }

  function enableEditing(root) {
    (root || document).querySelectorAll('[data-img]').forEach(function (el) {
      if (el.dataset.imgReady) return;
      el.dataset.imgReady = '1';
      el.classList.add('is-swappable');
      el.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        pickImage(el);
      });
    });
    (root || document).querySelectorAll('[data-copy]').forEach(function (el) {
      if (el.dataset.editReady) return;
      el.dataset.editReady = '1';
      el.classList.add('is-editable');
      el.setAttribute('contenteditable', 'plaintext-only');
      el.setAttribute('spellcheck', 'true');
      el.addEventListener('input', function () {
        draft[el.getAttribute('data-copy')] = el.innerText.replace(/\s+$/, '');
        saveDraft();
        updateBar();
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
        e.stopPropagation();
      });
      /* a label inside a button must not fire the button while you type */
      el.addEventListener('click', function (e) { e.stopPropagation(); });
    });
  }

  /* Clipboard, with the old-school fallback for anything that refuses the
     async API. If both fail the text is left selected, so Cmd+C still works. */
  function toClipboard(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) ta.remove(); else setTimeout(function () { ta.remove(); }, 8000);
      done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }

  function download(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copyFile() {
    /* Union of everything known: strings seen on this page, strings already in
       copy.js from other pages, and anything edited. Downloading from the quiz
       must never drop the offer page's copy. */
    var seen = {};
    [DEFAULTS, COPY, draft].forEach(function (src) {
      Object.keys(src).forEach(function (k) { seen[k] = 1; });
    });
    var all = {}, keys = Object.keys(seen).sort();
    keys.forEach(function (k) {
      var v = draft[k] != null ? draft[k] : (COPY[k] != null ? COPY[k] : DEFAULTS[k]);
      all[k] = v == null ? '' : v;
    });
    var lines = keys.map(function (k) {
      return '  ' + JSON.stringify(k) + ': ' + JSON.stringify(all[k]) + ',';
    });
    return '/* copy.js — every string on the site, by id.\n' +
           '   Generated from edit mode. Edit here or on the page with ?edit=1.\n' +
           '   Loaded before funnel.js on every page. */\n' +
           'window.COPY = {\n' + lines.join('\n') + '\n};\n';
  }

  function editBar(nav) {
    if (document.getElementById('editBar')) return;
    var bar = document.createElement('div');
    bar.id = 'editBar';
    bar.className = 'editbar';
    bar.innerHTML =
      '<span class="editbar__dot"></span>' +
      '<span class="editbar__label">Editing copy · <b id="editCount">' + Object.keys(draft).length + '</b> changed</span>' +
      '<span class="editbar__files" id="editFiles" hidden></span>' +
      (nav ? '<span class="editbar__nav">' +
        '<button type="button" data-ed="prev" aria-label="Previous screen">‹</button>' +
        '<span id="editStep">' + nav.label + '</span>' +
        '<button type="button" data-ed="next" aria-label="Next screen">›</button>' +
      '</span>' : '') +
      /* Copy first, Download second. Chrome and Safari quietly refuse .js
         downloads on some machines, and a button that does nothing is worse
         than no button — the clipboard always works. */
      '<button type="button" class="editbar__btn" data-ed="clip">Copy copy.js</button>' +
      '<button type="button" class="editbar__btn editbar__btn--quiet" data-ed="save">Download</button>' +
      '<button type="button" class="editbar__btn editbar__btn--quiet" data-ed="reset">Discard</button>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ed]');
      if (!b) return;
      var a = b.getAttribute('data-ed');
      if (a === 'save') download('copy.js', copyFile());
      if (a === 'clip') {
        toClipboard(copyFile(), function (ok) {
          var was = b.textContent;
          b.textContent = ok ? 'Copied — paste into copy.js' : 'Press Cmd+C now';
          setTimeout(function () { b.textContent = was; }, ok ? 2600 : 4000);
        });
      }
      if (a === 'reset' && confirm('Discard all copy and image edits made in this browser?')) {
        draft = {}; previewSrc = {}; pending = {}; saveDraft(); location.reload();
      }
      if (a === 'prev' && nav) nav.prev();
      if (a === 'next' && nav) nav.next();
    });
    document.body.appendChild(bar);
    document.body.classList.add('is-editing');
  }

  /* static pages call this once; the quiz calls it after every render */
  function initCopy(nav) {
    applyCopy();
    if (!EDIT) return;
    enableEditing();
    editBar(nav);
  }

  /* ------------------------------------------------------------- export */

  seedBrandCopy();

  global.Funnel = {
    QUESTIONS: QUESTIONS,
    answers: { read: read, write: write, set: set, clear: clear },
    link: link,
    go: go,
    route: route,
    hydrate: hydrate,
    merges: mergeValues,
    fill: fillTemplate,
    quiz: quiz,
    config: CFG,
    cfg: cfg,
    copy: { init: initCopy, apply: applyCopy, file: copyFile, editing: EDIT, text: t }
  };
})(window);
