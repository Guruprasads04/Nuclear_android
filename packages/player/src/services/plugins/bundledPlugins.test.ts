import '../../test/mocks/plugin-fs';

import { mockIPC } from '@tauri-apps/api/mocks';

import { PluginFsMock } from '../../test/mocks/plugin-fs';
import { resetInMemoryTauriStore } from '../../test/utils/inMemoryTauriStore';
import { installBundledPlugins } from './bundledPlugins';
import { getRegistryEntry, upsertRegistryEntry } from './pluginRegistry';

const SOUNDCLOUD = { id: 'nuclear-plugin-soundcloud', version: '0.3.0' };

type InstallCall = { id: string; destination: string };

const mockBackend = (bundled: unknown, calls: InstallCall[] = []) => {
  mockIPC((command, payload) => {
    if (command === 'list_bundled_plugins') {
      if (bundled instanceof Error) {
        throw bundled;
      }
      return bundled;
    }
    if (command === 'install_bundled_plugin') {
      calls.push(payload as InstallCall);
      return undefined;
    }
  });
  return calls;
};

describe('installBundledPlugins', () => {
  beforeEach(() => {
    resetInMemoryTauriStore();
    PluginFsMock.setMkdir(undefined);
  });

  it('installs a bundled plugin and registers it enabled', async () => {
    const calls = mockBackend([SOUNDCLOUD]);

    await installBundledPlugins();

    expect(calls).toHaveLength(1);
    expect(calls[0].id).toBe(SOUNDCLOUD.id);

    const entry = await getRegistryEntry(SOUNDCLOUD.id);
    expect(entry).toMatchObject({
      id: SOUNDCLOUD.id,
      version: SOUNDCLOUD.version,
      installationMethod: 'bundled',
      enabled: true,
    });
    expect(entry?.path).toContain(SOUNDCLOUD.version);
  });

  it('leaves an already installed version alone', async () => {
    const now = new Date().toISOString();
    await upsertRegistryEntry({
      ...SOUNDCLOUD,
      path: '/plugins/nuclear-plugin-soundcloud/0.3.0',
      installationMethod: 'bundled',
      enabled: false,
      installedAt: now,
      lastUpdatedAt: now,
    });
    const calls = mockBackend([SOUNDCLOUD]);

    await installBundledPlugins();

    expect(calls).toHaveLength(0);
    expect(await getRegistryEntry(SOUNDCLOUD.id)).toMatchObject({
      enabled: false,
    });
  });

  it('keeps a plugin disabled when upgrading it', async () => {
    const now = new Date().toISOString();
    await upsertRegistryEntry({
      id: SOUNDCLOUD.id,
      version: '0.2.0',
      path: '/plugins/nuclear-plugin-soundcloud/0.2.0',
      installationMethod: 'bundled',
      enabled: false,
      installedAt: now,
      lastUpdatedAt: now,
    });
    const calls = mockBackend([SOUNDCLOUD]);

    await installBundledPlugins();

    expect(calls).toHaveLength(1);
    expect(await getRegistryEntry(SOUNDCLOUD.id)).toMatchObject({
      version: SOUNDCLOUD.version,
      enabled: false,
    });
  });

  it('does not throw when the backend has no bundled plugins command', async () => {
    mockBackend(new Error('command not found'));

    await expect(installBundledPlugins()).resolves.toBeUndefined();
  });
});
