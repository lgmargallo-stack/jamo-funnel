/* bump.mjs — run this before every push.
   Stamps a fresh version onto funnel.css, copy.js and funnel.js in all four
   pages, so browsers fetch the new files instead of serving yesterday's from
   cache. Without it you push a copy change, reload, and see the old words —
   which looks exactly like the change never worked.

   Usage:  node bump.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs';

const PAGES = ['index.html', 'scratch.html', 'plan.html', 'offer.html'];
const ASSETS = ['funnel.css', 'funnel.config.js', 'copy.js', 'funnel.js'];
const v = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);   // yyyymmddhhmm

for (const page of PAGES) {
  let s = readFileSync(page, 'utf8');
  for (const a of ASSETS) {
    // matches href="funnel.css", href="funnel.css?v=…", same for src=
    const re = new RegExp('((?:href|src)=")' + a.replace('.', '\\.') + '(?:\\?v=[^"]*)?(")', 'g');
    s = s.replace(re, `$1${a}?v=${v}$2`);
  }
  writeFileSync(page, s);
}
console.log('stamped ?v=' + v + ' on', PAGES.join(', '));
