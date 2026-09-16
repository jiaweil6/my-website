#!/usr/bin/env node
// Development-only differ: compares two HTML files as normalized token streams
// so insignificant whitespace differences don't hide (or fake) real changes.
// Usage: node build/verify.js <a.html> <b.html>
'use strict';

const fs = require('fs');

// Whitespace between/around these tags renders as a visible space, so it is
// preserved (as a single space) instead of being dropped.
const INLINE = new Set(['a', 'i', 'span', 'strong', 'em', 'code']);

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

function decodeEntities(s) {
  return s.replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e]);
}

function tokenize(html) {
  const tokens = [];
  const re = /<!--[\s\S]*?-->|<[^>]+>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', value: html.slice(last, m.index) });
    tokens.push({ type: 'tag', value: m[0] });
    last = re.lastIndex;
  }
  if (last < html.length) tokens.push({ type: 'text', value: html.slice(last) });
  return tokens;
}

function tagName(tok) {
  if (!tok || tok.type !== 'tag') return null;
  const m = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tok.value);
  return m ? m[1].toLowerCase() : null;
}

function isInline(tok) {
  return tok && tok.type === 'tag' && INLINE.has(tagName(tok));
}

function normalize(html) {
  const raw = tokenize(html);
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const tok = raw[i];
    if (tok.type === 'tag') {
      out.push(tok.value.replace(/\s+/g, ' '));
      continue;
    }
    let s = decodeEntities(tok.value).replace(/\s+/g, ' ');
    if (!isInline(raw[i - 1])) s = s.replace(/^ /, '');
    if (!isInline(raw[i + 1])) s = s.replace(/ $/, '');
    if (s !== '') out.push(s);
  }
  return out;
}

function main() {
  const [fileA, fileB] = process.argv.slice(2);
  if (!fileA || !fileB) {
    console.error('Usage: node build/verify.js <a.html> <b.html>');
    process.exit(2);
  }
  const a = normalize(fs.readFileSync(fileA, 'utf8'));
  const b = normalize(fs.readFileSync(fileB, 'utf8'));
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      console.error(`DIFF at token ${i}:`);
      console.error(`  context: ${a.slice(Math.max(0, i - 3), i).join(' | ')}`);
      console.error(`  ${fileA}: ${a[i] === undefined ? '<end of file>' : JSON.stringify(a[i])}`);
      console.error(`  ${fileB}: ${b[i] === undefined ? '<end of file>' : JSON.stringify(b[i])}`);
      process.exit(1);
    }
  }
  console.log(`OK: ${fileA} and ${fileB} are equivalent (${a.length} tokens)`);
}

main();
