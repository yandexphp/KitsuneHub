use crate::installer::{Installer, script::{ScriptInstaller, ScriptInstallerConfig}};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::fs;
use serde_json;
use tokio::time::{interval, Duration};
use tokio::sync::broadcast;

pub struct InstallerLoader {
    installers: Arc<RwLock<HashMap<String, Arc<dyn Installer>>>>,
    scripts_dir: PathBuf,
    reload_tx: broadcast::Sender<()>,
}

impl InstallerLoader {
    pub fn new(scripts_dir: PathBuf) -> Self {
        let (tx, _) = broadcast::channel(16);
        Self {
            installers: Arc::new(RwLock::new(HashMap::new())),
            scripts_dir,
            reload_tx: tx,
        }
    }

    #[allow(dead_code)]
    pub fn subscribe_reload(&self) -> broadcast::Receiver<()> {
        self.reload_tx.subscribe()
    }

    pub async fn load_all(&self) -> Result<(), String> {
        let mut loaded = HashMap::new();

        if !self.scripts_dir.exists() {
            fs::create_dir_all(&self.scripts_dir)
                .map_err(|e| format!("Не удалось создать директорию скриптов: {}", e))?;
        }

        let entries = fs::read_dir(&self.scripts_dir)
            .map_err(|e| format!("Не удалось прочитать директорию скриптов: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| format!("Ошибка чтения файла: {}", e))?;
            let path = entry.path();

            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(installer) = self.load_installer_from_file(&path).await {
                    loaded.insert(installer.id().to_string(), Arc::new(installer) as Arc<dyn Installer>);
                }
            }
        }

        let mut installers = self.installers.write().unwrap();
        *installers = loaded;
        Ok(())
    }

    async fn load_installer_from_file(&self, config_path: &Path) -> Result<ScriptInstaller, String> {
        let content = fs::read_to_string(config_path)
            .map_err(|e| format!("Не удалось прочитать файл конфигурации: {}", e))?;

        let config: ScriptInstallerConfig = serde_json::from_str(&content)
            .map_err(|e| format!("Ошибка парсинга JSON: {}", e))?;

        let base_path = config_path.parent()
            .ok_or_else(|| "Не удалось получить родительскую директорию".to_string())?
            .to_path_buf();

        Ok(ScriptInstaller::new(config, base_path))
    }

    pub fn get_all(&self) -> Vec<Arc<dyn Installer>> {
        let installers = self.installers.read().unwrap();
        installers.values().map(|i| Arc::clone(i)).collect()
    }

    pub fn get(&self, id: &str) -> Option<Arc<dyn Installer>> {
        let installers = self.installers.read().unwrap();
        installers.get(id).map(Arc::clone)
    }

    pub fn start_watcher(&self) {
        let scripts_dir = self.scripts_dir.clone();
        let installers = Arc::clone(&self.installers);
        let reload_tx = self.reload_tx.clone();

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(2));
            let mut last_modified = HashMap::new();

            loop {
                interval.tick().await;

                if let Ok(entries) = fs::read_dir(&scripts_dir) {
                    let mut changed = false;

                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                            if let Ok(metadata) = fs::metadata(&path) {
                                if let Ok(modified) = metadata.modified() {
                                    let path_str = path.to_string_lossy().to_string();
                                    if let Some(&last) = last_modified.get(&path_str) {
                                        if modified > last {
                                            changed = true;
                                        }
                                    } else {
                                        changed = true;
                                    }
                                    last_modified.insert(path_str, modified);
                                }
                            }
                        }
                    }

                    if changed {
                        let mut loaded = HashMap::new();
                        if let Ok(entries) = fs::read_dir(&scripts_dir) {
                            for entry in entries.flatten() {
                                let path = entry.path();
                                if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(config) = serde_json::from_str::<crate::installer::script::ScriptInstallerConfig>(&content) {
                                            let base_path = path.parent().unwrap().to_path_buf();
                                            let installer = crate::installer::script::ScriptInstaller::new(config, base_path);
                                            loaded.insert(installer.id().to_string(), Arc::new(installer) as Arc<dyn Installer>);
                                        }
                                    }
                                }
                            }
                        }
                        let mut installers_guard = installers.write().unwrap();
                        *installers_guard = loaded;
                        let _ = reload_tx.send(());
                    }
                }
            }
        });
    }
}

