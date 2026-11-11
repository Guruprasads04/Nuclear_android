import '../../test/mocks/plugin-fs';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PluginFsMock } from '../../test/mocks/plugin-fs';
import { PluginLoader } from './PluginLoader';

const BUNDLED_DIR = join(
  __dirname,
  '../../../src-tauri/bundled-plugins/nuclear-plugin-soundcloud',
);

const readBundledFile = (name: string) =>
  readFileSync(join(BUNDLED_DIR, name), 'utf8');

describe('the bundled SoundCloud plugin artifact', () => {
  beforeEach(() => {
    PluginFsMock.reset();
    PluginFsMock.setExists(true);
    PluginFsMock.setReadTextFileByMap({
      'package.json': readBundledFile('package.json'),
      'index.js': readBundledFile('index.js'),
    });
  });

  it('is pre-built so the runtime compiler is never needed', () => {
    const manifest = JSON.parse(readBundledFile('package.json'));

    expect(manifest.main).toBe('index.js');
  });

  it('loads and exposes its lifecycle hooks', async () => {
    const loader = new PluginLoader(BUNDLED_DIR);

    const metadata = await loader.loadMetadata();
    const { instance } = await loader.load({} as never);

    expect(metadata.id).toBe('nuclear-plugin-soundcloud');
    expect(metadata.displayName).toBe('SoundCloud');
    expect(typeof instance.onEnable).toBe('function');
    expect(typeof instance.onDisable).toBe('function');
  });
});
