# Bundled plugins

Plugins in this directory are embedded into the Nuclear binary with `rust-embed`
and installed into the managed plugins directory on first launch. They exist so
that a fresh install has a working streaming source without downloading anything
first, which matters most on Android where the plugin store install is not yet
reliable.

Each plugin here is **pre-built to CommonJS JavaScript**. The runtime TypeScript
compiler (`esbuild-wasm`) is skipped for `.js` entry points, so bundled plugins
load without initialising WebAssembly.

## Contents

### nuclear-plugin-soundcloud

- Upstream: https://github.com/NuclearPlayer/nuclear-plugin-soundcloud
- Version: 0.3.0 (release tag `v0.3.0`)
- Author: nukeop
- License: AGPL-3.0-only

The upstream release ships TypeScript sources. `index.js` here is built from
those unmodified sources; no plugin code was changed. The corresponding source
is available from the upstream repository at the tag above.

## Rebuilding

Download and unpack the upstream `plugin.zip`, then:

```bash
node packages/player/scripts/build-bundled-plugin.mjs <unpacked-plugin-dir> packages/player/src-tauri/bundled-plugins/<plugin-id>
```

The script bundles the plugin's entry point, keeps the host-provided modules
external, and writes `index.js` plus a `package.json` whose `main` points at it.
