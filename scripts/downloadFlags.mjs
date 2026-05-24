import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const flagsDir = resolve(root, 'public/flags');

const html = await (await fetch('https://flagpedia.net/index')).text();
const codes = [
  ...new Set(
    [
      ...html.matchAll(
        /<img src="\/data\/flags\/h80\/([^".?]+)\.png[^>]*alt="Flag of [^"]+"/g,
      ),
    ].map((match) => match[1]),
  ),
].sort();

if (codes.length !== 254) {
  throw new Error(`Expected 254 flags, got ${codes.length}`);
}

await mkdir(flagsDir, { recursive: true });

for (const code of codes) {
  const url = `https://flagcdn.com/w320/${code}.png`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cannot download ${url}: ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(resolve(flagsDir, `${code}.png`), bytes);
  console.log(`saved public/flags/${code}.png`);
}

console.log(`Downloaded ${codes.length} flags.`);
