pub mod module;
pub mod script;
pub mod loader;
pub mod logger;

pub use logger::{LogEntry, Logger};

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallerInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub installed: bool,
    pub current_version: Option<String>,
    pub latest_version: Option<String>,
    pub can_update: bool,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallResult {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallProgress {
    pub id: String,
    pub status: InstallStatus,
    pub progress: u8,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum InstallStatus {
    Pending,
    Installing,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchInstallRequest {
    pub ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchInstallResponse {
    pub total: usize,
    pub completed: usize,
    pub failed: usize,
    pub progress: Vec<InstallProgress>,
}

#[async_trait]
pub trait Installer: Send + Sync {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn category(&self) -> &str;
    fn dependencies(&self) -> Vec<String>;

    async fn check_installed(&self) -> bool;
    async fn get_current_version(&self) -> Option<String>;
    async fn get_latest_version(&self) -> Option<String>;
    async fn install(&self) -> Result<InstallResult, String>;
    async fn update(&self) -> Result<InstallResult, String>;
    async fn uninstall(&self) -> Result<InstallResult, String>;

    async fn get_info(&self) -> InstallerInfo {
        let installed = self.check_installed().await;
        let current_version = if installed {
            self.get_current_version().await
        } else {
            None
        };
        let latest_version = self.get_latest_version().await;
        let can_update = installed
            && current_version.is_some()
            && latest_version.is_some()
            && current_version != latest_version;

        InstallerInfo {
            id: self.id().to_string(),
            name: self.name().to_string(),
            description: self.description().to_string(),
            category: self.category().to_string(),
            installed,
            current_version,
            latest_version,
            can_update,
            dependencies: self.dependencies(),
        }
    }
}
