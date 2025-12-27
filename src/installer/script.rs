use crate::installer::{Installer, InstallResult};
use crate::installers::base::run_command;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptInstallerConfig {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub dependencies: Vec<String>,
    pub scripts: ScriptPaths,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScriptPaths {
    pub install: Option<String>,
    pub update: Option<String>,
    pub uninstall: Option<String>,
    pub check: Option<String>,
    pub version: Option<String>,
    pub latest_version: Option<String>,
}

pub struct ScriptInstaller {
    config: ScriptInstallerConfig,
    base_path: PathBuf,
}

impl ScriptInstaller {
    pub fn new(config: ScriptInstallerConfig, base_path: PathBuf) -> Self {
        Self { config, base_path }
    }

    fn script_path(&self, script_name: &str) -> Option<PathBuf> {
        if script_name.is_empty() {
            return None;
        }
        let path = self.base_path.join(script_name);
        if path.exists() {
            Some(path)
        } else {
            None
        }
    }

    async fn run_script(&self, script_path: Option<PathBuf>) -> Result<String, String> {
        let path = script_path.ok_or_else(|| "Скрипт не найден".to_string())?;
        
        if !path.exists() {
            return Err(format!("Скрипт не существует: {}", path.display()));
        }

        let script_str = path.to_string_lossy().to_string();
        tokio::task::spawn_blocking(move || {
            run_command("bash", &[&script_str])
        })
        .await
        .map_err(|e| format!("Ошибка выполнения задачи: {}", e))?
    }
}

#[async_trait]
impl Installer for ScriptInstaller {
    fn id(&self) -> &str {
        &self.config.id
    }

    fn name(&self) -> &str {
        &self.config.name
    }

    fn description(&self) -> &str {
        &self.config.description
    }

    fn category(&self) -> &str {
        &self.config.category
    }

    fn dependencies(&self) -> Vec<String> {
        self.config.dependencies.clone()
    }

    async fn check_installed(&self) -> bool {
        if let Some(check_script) = &self.config.scripts.check {
            let script_path = self.script_path(check_script);
            if let Ok(output) = self.run_script(script_path).await {
                output.trim() == "1" || output.trim().to_lowercase() == "true" || output.trim().to_lowercase() == "installed"
            } else {
                false
            }
        } else {
            false
        }
    }

    async fn get_current_version(&self) -> Option<String> {
        if let Some(version_script) = &self.config.scripts.version {
            let script_path = self.script_path(version_script);
            self.run_script(script_path).await.ok().map(|v| v.trim().to_string())
        } else {
            None
        }
    }

    async fn get_latest_version(&self) -> Option<String> {
        if let Some(latest_script) = &self.config.scripts.latest_version {
            let script_path = self.script_path(latest_script);
            self.run_script(script_path).await.ok().map(|v| v.trim().to_string())
        } else {
            None
        }
    }

    async fn install(&self) -> Result<InstallResult, String> {
        let script_path = self.script_path(self.config.scripts.install.as_deref().unwrap_or(""));
        match self.run_script(script_path).await {
            Ok(output) => Ok(InstallResult {
                success: true,
                message: format!("Установка завершена: {}", output.trim()),
            }),
            Err(e) => Err(format!("Ошибка установки: {}", e)),
        }
    }

    async fn update(&self) -> Result<InstallResult, String> {
        let script_path = self.script_path(self.config.scripts.update.as_deref().unwrap_or(""));
        match self.run_script(script_path).await {
            Ok(output) => Ok(InstallResult {
                success: true,
                message: format!("Обновление завершено: {}", output.trim()),
            }),
            Err(e) => Err(format!("Ошибка обновления: {}", e)),
        }
    }

    async fn uninstall(&self) -> Result<InstallResult, String> {
        let script_path = self.script_path(self.config.scripts.uninstall.as_deref().unwrap_or(""));
        match self.run_script(script_path).await {
            Ok(output) => Ok(InstallResult {
                success: true,
                message: format!("Удаление завершено: {}", output.trim()),
            }),
            Err(e) => Err(format!("Ошибка удаления: {}", e)),
        }
    }
}

