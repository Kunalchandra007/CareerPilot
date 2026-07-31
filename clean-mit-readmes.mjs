import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'README.ar.md','README.cn.md','README.da.md','README.de.md','README.es.md',
  'README.fr.md','README.hi.md','README.ja.md','README.ko-KR.md','README.pl.md',
  'README.pt-BR.md','README.ru.md','README.ta.md','README.tr.md','README.ua.md',
  'README.zh-TW.md',
];

const badgeRe = /^\s*<img src="https:\/\/img\.shields\.io\/badge\/License-MIT-blue\.svg"[^>]*>\s*\r?\n/m;
// [ ...MIT... ](LICENSE)  ->  [LICENSE](LICENSE)   (keeps sentence grammatical in any language)
const linkRe = /\[[^\]]*MIT[^\]]*\]\(LICENSE\)/g;
// a line whose only content is "MIT" (the license-section body)
const bareRe = /^MIT\s*$/gm;

let totalChanged = 0;
for (const f of files) {
  let src;
  try { src = readFileSync(f, 'utf8'); }
  catch { console.log(`SKIP  ${f} (not found)`); continue; }

  const before = src;
  const hits = { badge: 0, link: 0, bare: 0 };

  src = src.replace(badgeRe, () => { hits.badge++; return ''; });
  src = src.replace(linkRe,  () => { hits.link++;  return '[LICENSE](LICENSE)'; });
  src = src.replace(bareRe,  () => { hits.bare++;  return 'See [LICENSE](LICENSE).'; });

  // report any residual in-prose "MIT" mentions we deliberately did NOT touch
  const residual = (src.match(/\bMIT\b/g) || []).length;

  if (src !== before) {
    writeFileSync(f, src, 'utf8');
    totalChanged++;
    console.log(`EDIT  ${f}  badge:${hits.badge} link:${hits.link} bare:${hits.bare}  residual-MIT:${residual}`);
  } else {
    console.log(`--    ${f}  no change  residual-MIT:${residual}`);
  }
}
console.log(`\n${totalChanged} file(s) changed.`);
