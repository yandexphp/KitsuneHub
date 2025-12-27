pub mod base;

use crate::installer::Installer;
use std::sync::Arc;

pub fn create_all_installers() -> Vec<Arc<dyn Installer>> {
    Vec::new()
}

