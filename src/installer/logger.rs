use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub action: String,
    pub status: String,
    pub message: String,
    pub output: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallerLogs {
    pub installer_id: String,
    pub entries: Vec<LogEntry>,
}

pub struct Logger {
    logs_dir: PathBuf,
    logs: Arc<RwLock<HashMap<String, Vec<LogEntry>>>>,
}

impl Logger {
    pub fn new(logs_dir: PathBuf) -> Self {
        if !logs_dir.exists() {
            let _ = fs::create_dir_all(&logs_dir);
        }

        let mut logs = HashMap::new();
        
        if let Ok(entries) = fs::read_dir(&logs_dir) {
            for entry in entries.flatten() {
                if let Some(id) = entry.file_name().to_str() {
                    if id.ends_with(".json") {
                        let id = id.trim_end_matches(".json");
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(logs_data) = serde_json::from_str::<InstallerLogs>(&content) {
                                logs.insert(id.to_string(), logs_data.entries);
                            }
                        }
                    }
                }
            }
        }

        Self {
            logs_dir,
            logs: Arc::new(RwLock::new(logs)),
        }
    }

    pub fn log(&self, installer_id: &str, action: &str, status: &str, message: &str, output: &str) {
        let entry = LogEntry {
            timestamp: Utc::now().to_rfc3339(),
            action: action.to_string(),
            status: status.to_string(),
            message: message.to_string(),
            output: output.to_string(),
        };

        let mut logs = self.logs.write().unwrap();
        let entries = logs.entry(installer_id.to_string()).or_insert_with(Vec::new);
        entries.push(entry.clone());

        let logs_data = InstallerLogs {
            installer_id: installer_id.to_string(),
            entries: entries.clone(),
        };

        let log_file = self.logs_dir.join(format!("{}.json", installer_id));
        if let Ok(json) = serde_json::to_string_pretty(&logs_data) {
            let _ = fs::write(&log_file, json);
        }
    }

    pub fn get_logs(&self, installer_id: &str) -> Vec<LogEntry> {
        let logs = self.logs.read().unwrap();
        logs.get(installer_id).cloned().unwrap_or_default()
    }

    #[allow(dead_code)]
    pub fn get_all_logs(&self) -> HashMap<String, Vec<LogEntry>> {
        let logs = self.logs.read().unwrap();
        logs.clone()
    }
}

