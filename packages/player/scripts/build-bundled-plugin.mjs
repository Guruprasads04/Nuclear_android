import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import * as esbuild from 'esbuild-wasm';

const EXTERNAL = [
  '@nuclearplayer/plugin-sdk',
  '@nuclearplayer/ui',
  'react',
  'react/jsx-runtime',
];

const [sourceDir, outputDir] = process.argv.slice(2);

if (!sourceDir || !outputDir) {
  console.error(
    'Usage: node build-bundled-plugin.mjs <plugin-source-dir> <output-dir>',
  );
  process.exit(1);
}

const manifest = JSON.parse(
  await readFile(join(sourceDir, 'package.json'), 'utf8'),
);
const entryPoint = join(sourceDir, manifest.main);

await esbuild.initialize({});

const result = await esbuild.build({
  entryPoints: [entryPoint],
  outfile: join(outputDir, 'index.js'),
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  external: EXTERNAL,
  logLevel: 'warning',
});

if (result.errors.length > 0) {
  console.error(result.errors);
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });
for (const file of result.outputFiles) {
  await mkdir(dirname(file.path), { recursive: true });
  await writeFile(file.path, file.contents);
}

await writeFile(
  join(outputDir, 'package.json'),
  `${JSON.stringify({ ...manifest, main: 'index.js' }, null, 2)}\n`,
);

console.log(
  `Built ${manifest.name}@${manifest.version} to ${outputDir} (${result.outputFiles[0].contents.length} bytes)`,
);
