import '../../test/mocks/plugin-fs';

import { isAbsolute } from 'node:path';

import { PluginFsMock } from '../../test/mocks/plugin-fs';
import { ensurePluginsDir, getManagedPluginPath } from './pluginDir';

describe('plugin directories', () => {
  beforeEach(() => {
    PluginFsMock.reset();
    PluginFsMock.setExists(true);
    PluginFsMock.setMkdir(undefined);
  });

  it('resolves the plugins directory to an absolute path', async () => {
    const dir = await ensurePluginsDir();

    expect(isAbsolute(dir)).toBe(true);
  });

  it('resolves a managed plugin path to an absolute path', async () => {
    const path = await getManagedPluginPath(
      'nuclear-plugin-soundcloud',
      '0.3.0',
    );

    expect(isAbsolute(path)).toBe(true);
    expect(path).toContain('plugins');
    expect(path).toContain('nuclear-plugin-soundcloud');
    expect(path).toContain('0.3.0');
  });
});
