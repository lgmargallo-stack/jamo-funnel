import { readFileSync, writeFileSync } from 'node:fs';

const css = readFileSync('funnel.css','utf8');
const core = readFileSync('funnel.js','utf8');

function parse(file){
  const s = readFileSync(file,'utf8');
  const body = s.match(/<body>([\s\S]*?)<\/body>/)[1];
  const scripts = [...body.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  const markup = body.replace(/<script[\s\S]*?<\/script>/g,'').trim();
  return { markup, scripts };
}

const quiz   = parse('index.html');
const scr    = parse('scratch.html');
const plan   = parse('plan.html');
const offer  = parse('offer.html');

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>[BRAND] — funnel preview</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=Martian+Mono:wght@400;500&display=swap">
<style>
${css}
/* preview-only: the four pages live in one file, one visible at a time */
[data-view]{display:none}
[data-view].is-active{display:block}
#previewbar{
  position:fixed; right:12px; bottom:12px; z-index:90; display:flex; gap:6px;
  background:rgba(11,13,16,.92); padding:6px; border-radius:2px;
}
#previewbar button{
  font-family:var(--mono); font-size:9px; letter-spacing:.08em; text-transform:uppercase;
  color:#8A93A0; padding:7px 9px; min-height:32px;
}
#previewbar button.is-on{color:#fff; background:#2B34F0}
@media print{ #previewbar{display:none} }
@media (max-width:899px){ body{padding-bottom:56px} }   /* clear of the preview bar */
</style>
</head>
<body>

<div data-view="quiz" class="is-active">
${quiz.markup}
</div>

<div data-view="scratch">
${scr.markup}
</div>

<div data-view="plan">
${plan.markup}
</div>

<div data-view="offer">
${offer.markup}
</div>

<nav id="previewbar" aria-label="Preview navigation">
  <button type="button" data-jump="quiz" class="is-on">Quiz</button>
  <button type="button" data-jump="scratch">Scratch</button>
  <button type="button" data-jump="plan">Plan</button>
  <button type="button" data-jump="offer">Offer</button>
</nav>

<script>
${core}
</script>
<script>
/* ---- preview router -------------------------------------------------------
   In the real build these are four files and Funnel.go() navigates. Here it
   swaps the visible section and runs that page's own script the first time it
   is shown. Nothing else about the pages changes. ------------------------- */
(function () {
  var inits = {
    quiz: function () {
${quiz.scripts}
    },
    scratch: function () {
${scr.scripts}
    },
    plan: function () {
${plan.scripts}
    },
    offer: function () {
${offer.scripts}
    }
  };
  var booted = {};
  /* Jumping straight to Plan or Offer with an empty store would show the
     fallback words. Seed one obvious SAMPLE answer set instead. */
  function seedSample() {
    var a = Funnel.answers.read();
    if (a.first_name) return;
    Funnel.answers.write({
      age: '30-39', status: 'Recently broke up', goal: 'Get her back',
      who_ended: 'She left', time_since: 'A few weeks',
      her_behaviour: 'Hot and cold, hard to read',
      hardest_part: "I can't stop thinking about her",
      issues: ['Trust', 'Emotional distance'],
      slipped: ['sleep', 'energy'],
      readiness: 'No idea',
      outcomes: ["She's texting first", "I've stopped overthinking"],
      email: 'sample@example.com', first_name: 'Alex', her_name: 'Sarah',
      sample: true
    });
  }

  function show(name) {
    if (name !== 'quiz') seedSample();
    document.querySelectorAll('[data-view]').forEach(function (v) {
      v.classList.toggle('is-active', v.getAttribute('data-view') === name);
    });
    document.querySelectorAll('#previewbar [data-jump]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-jump') === name);
    });
    window.scrollTo(0, 0);
    if (!booted[name]) { booted[name] = true; try { inits[name](); } catch (e) { console.error(name, e); } }
    else if (name !== 'quiz') { Funnel.hydrate(document.querySelector('[data-view="' + name + '"]')); }
  }

  // Funnel.go() drives the flow in the real build; here it switches sections.
  Funnel.go = function (href) { show(String(href).replace('.html', '').replace('index', 'quiz')); };

  document.querySelectorAll('#previewbar [data-jump]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-jump')); });
  });

  show('quiz');
})();
</script>

</body>
</html>
`;
writeFileSync('../brand-funnel-preview.html', out);
console.log('wrote brand-funnel-preview.html', (out.length/1024).toFixed(0)+'KB');
