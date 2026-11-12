import '../../test/mocks/plugin-fs';

import { isAbsolute } from 'node:path';

import { PluginFsMock } from '../../test/mocks/plugin-fs';
import { getManagedPluginAbsolutePath } from './pluginDir';

describe('getManagedPluginAbsolutePath', () => {
  beforeEach(() => {
    PluginFsMock.reset();
    PluginFsMock.setExists(true);
    PluginFsMock.setMkdir(undefined);
  });

  it('is absolute, so backend commands do not resolve it against the working directory', async () => {
    const path = await getManagedPluginAbsolutePath(
      'nuclear-plugin-soundcloud',
      '0.3.0',
    );

    expect(isAbsolute(path)).toBe(true);
    expect(path).toContain('plugins');
    expect(path).toContain('nuclear-plugin-soundcloud');
    expect(path).toContain('0.3.0');
  });
});
