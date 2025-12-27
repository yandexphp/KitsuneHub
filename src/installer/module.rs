use crate::installer::{Installer, InstallerInfo};
use std::collections::HashMap;
use std::sync::Arc;

#[allow(dead_code)]
pub struct InstallerModule {
    #[allow(dead_code)]
    installers: HashMap<String, Arc<dyn Installer>>,
}

#[allow(dead_code)]
impl InstallerModule {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self {
            installers: HashMap::new(),
        }
    }

    #[allow(dead_code)]
    pub fn register(&mut self, installer: Arc<dyn Installer>) {
        self.installers.insert(installer.id().to_string(), installer);
    }

    #[allow(dead_code)]
    pub fn get(&self, id: &str) -> Option<&Arc<dyn Installer>> {
        self.installers.get(id)
    }

    #[allow(dead_code)]
    pub fn get_all(&self) -> Vec<&Arc<dyn Installer>> {
        self.installers.values().collect()
    }

    #[allow(dead_code)]
    pub async fn get_all_info(&self) -> Vec<InstallerInfo> {
        let mut infos = Vec::new();
        for installer in self.installers.values() {
            infos.push(installer.get_info().await);
        }
        infos
    }
}

impl Default for InstallerModule {
    fn default() -> Self {
        Self::new()
    }
}

