import { mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import ReactDOM from 'react-dom/client';

import '@nuclearplayer/tailwind-config';
import '@nuclearplayer/themes';
import '@nuclearplayer/i18n';

type PreviewWindow = Window & {
  __TAURI_OS_PLUGIN_INTERNALS__?: Record<string, string>;
  __PREVIEW_UNHANDLED__?: Set<string>;
};

const previewWindow = window as PreviewWindow;
previewWindow.__TAURI_OS_PLUGIN_INTERNALS__ = {
  platform: 'android',
  family: 'unix',
  os_type: 'android',
  arch: 'aarch64',
  version: '15',
  exe_extension: '',
  eol: '\n',
};
previewWindow.__PREVIEW_UNHANDLED__ = new Set();

const storeData = new Map<number, Map<string, unknown>>();
let nextResourceId = 1;

const handleStore = (command: string, payload: Record<string, unknown>) => {
  const resourceId = payload.rid as number;
  const store = storeData.get(resourceId) ?? new Map<string, unknown>();
  switch (command) {
    case 'load':
    case 'get_store': {
      const id = nextResourceId++;
      storeData.set(id, new Map());
      return id;
    }
    case 'get':
      return [
        store.get(payload.key as string) ?? null,
        store.has(payload.key as string),
      ];
    case 'has':
      return store.has(payload.key as string);
    case 'set':
      store.set(payload.key as string, payload.value);
      storeData.set(resourceId, store);
      return null;
    case 'delete':
      return store.delete(payload.key as string);
    case 'entries':
      return [...store.entries()];
    case 'keys':
      return [...store.keys()];
    case 'values':
      return [...store.values()];
    case 'length':
      return store.size;
    default:
      return null;
  }
};

const handleFs = (command: string) => {
  switch (command) {
    case 'exists':
      return false;
    case 'read_dir':
      return [];
    case 'watch':
      return nextResourceId++;
    case 'read_text_file':
    case 'read_file':
      throw new Error('No file in browser preview');
    default:
      return null;
  }
};

const handleAppCommand = (command: string) => {
  if (command.startsWith('history_')) {
    return command === 'history_fetch' ? { items: [], nextCursor: null } : [];
  }
  switch (command) {
    case 'is_flatpak':
      return false;
    case 'get_startup_logs':
      return [];
    case 'stream_server_port':
      return 0;
    case 'ytdlp_ensure_installed':
      throw 'yt-dlp is not available on mobile';
    case 'version':
      return '1.52.2';
    case 'name':
      return 'Nuclear';
    case 'tauri_version':
      return '2.7.0';
    default:
      previewWindow.__PREVIEW_UNHANDLED__?.add(command);
      return null;
  }
};

mockWindows('main');
mockIPC(
  (command, payload) => {
    const args = (payload ?? {}) as Record<string, unknown>;
    console.debug('[preview ipc]', command);
    const [scope, name] = command.startsWith('plugin:')
      ? command.slice('plugin:'.length).split('|')
      : ['app', command];
    switch (scope) {
      case 'store':
        return handleStore(name, args);
      case 'fs':
        return handleFs(name);
      case 'path':
        return name === 'resolve_directory' ? '/preview' : '/preview/path';
      case 'app':
        return handleAppCommand(name);
      default:
        return null;
    }
  },
  { shouldMockEvents: true },
);

window.history.replaceState(null, '', '/');

const root = ReactDOM.createRoot(document.getElementById('root')!);
const { initPlayerApp } = await import('./initPlayerApp');
await initPlayerApp(root);
