use std::fs;
use std::path::{Path, PathBuf};

use rust_embed::RustEmbed;
use tauri::command;

#[derive(RustEmbed)]
#[folder = "bundled-plugins/"]
struct BundledPluginAssets;

#[derive(serde::Serialize, Debug, PartialEq, specta::Type)]
pub struct BundledPlugin {
    pub id: String,
    pub version: String,
}

#[derive(serde::Deserialize)]
struct BundledPluginManifest {
    name: String,
    version: String,
}

fn plugin_ids() -> Vec<String> {
    let mut ids: Vec<String> = BundledPluginAssets::iter()
        .filter_map(|path| {
            path.split('/')
                .next()
                .filter(|id| !id.is_empty())
                .map(str::to_string)
        })
        .collect();
    ids.sort();
    ids.dedup();
    ids
}

fn read_manifest(id: &str) -> Option<BundledPluginManifest> {
    let file = BundledPluginAssets::get(&format!("{}/package.json", id))?;
    serde_json::from_slice(&file.data).ok()
}

#[command]
#[specta::specta]
pub fn list_bundled_plugins() -> Vec<BundledPlugin> {
    plugin_ids()
        .into_iter()
        .filter_map(|id| {
            read_manifest(&id).map(|manifest| BundledPlugin {
                id: manifest.name,
                version: manifest.version,
            })
        })
        .collect()
}

fn write_asset(path: &str, relative: &str, destination: &Path) -> Result<(), String> {
    let file = BundledPluginAssets::get(path)
        .ok_or_else(|| format!("Bundled plugin file {} is missing", path))?;
    let target = destination.join(relative);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(&target, file.data.as_ref()).map_err(|error| error.to_string())
}

#[command]
#[specta::specta]
pub fn install_bundled_plugin(id: String, destination: PathBuf) -> Result<(), String> {
    let prefix = format!("{}/", id);
    let files: Vec<String> = BundledPluginAssets::iter()
        .filter(|path| path.starts_with(&prefix))
        .map(|path| path.to_string())
        .collect();

    if files.is_empty() {
        return Err(format!("No bundled plugin named {}", id));
    }

    fs::create_dir_all(&destination).map_err(|error| error.to_string())?;

    for path in &files {
        let relative = &path[prefix.len()..];
        write_asset(path, relative, &destination)?;
    }

    log::info!(
        "Installed bundled plugin {} ({} files) to {:?}",
        id,
        files.len(),
        destination
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn lists_the_soundcloud_plugin() {
        let plugins = list_bundled_plugins();

        assert!(plugins
            .iter()
            .any(|plugin| plugin.id == "nuclear-plugin-soundcloud"));
    }

    #[test]
    fn writes_plugin_files_to_the_destination() {
        let dir = tempdir().unwrap();
        let destination = dir.path().join("soundcloud");

        install_bundled_plugin("nuclear-plugin-soundcloud".into(), destination.clone()).unwrap();

        assert!(destination.join("package.json").exists());
        assert!(destination.join("index.js").exists());
    }

    #[test]
    fn reports_an_unknown_plugin() {
        let dir = tempdir().unwrap();

        let result = install_bundled_plugin("nope".into(), dir.path().to_path_buf());

        assert_eq!(result, Err("No bundled plugin named nope".to_string()));
    }
}
