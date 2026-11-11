import { invoke } from '@tauri-apps/api/core';

import { errorMessage } from '../../utils/errorMessage';
import { Logger } from '../logger';
import { getManagedPluginPath } from './pluginDir';
import { getRegistryEntry, upsertRegistryEntry } from './pluginRegistry';

type BundledPlugin = {
  id: string;
  version: string;
};

const installBundledPlugin = async (plugin: BundledPlugin): Promise<void> => {
  const existing = await getRegistryEntry(plugin.id);
  if (existing?.version === plugin.version) {
    return;
  }

  const destination = await getManagedPluginPath(plugin.id, plugin.version);
  await invoke('install_bundled_plugin', { id: plugin.id, destination });

  const now = new Date().toISOString();
  await upsertRegistryEntry({
    id: plugin.id,
    version: plugin.version,
    path: destination,
    installationMethod: 'bundled',
    enabled: existing?.enabled ?? true,
    installedAt: existing?.installedAt ?? now,
    lastUpdatedAt: now,
  });

  Logger.plugins.info(
    `Installed bundled plugin ${plugin.id}@${plugin.version}`,
  );
};

export const installBundledPlugins = async (): Promise<void> => {
  let bundled: BundledPlugin[];
  try {
    bundled = await invoke<BundledPlugin[]>('list_bundled_plugins');
  } catch (error) {
    Logger.plugins.warn(
      `Could not list bundled plugins: ${errorMessage(error)}`,
    );
    return;
  }

  for (const plugin of bundled) {
    try {
      await installBundledPlugin(plugin);
    } catch (error) {
      Logger.plugins.error(
        `Failed to install bundled plugin ${plugin.id}: ${errorMessage(error)}`,
      );
    }
  }
};
