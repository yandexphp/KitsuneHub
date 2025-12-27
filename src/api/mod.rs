use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use crate::installer::{
    InstallerInfo, InstallResult, loader::InstallerLoader,
    BatchInstallRequest, BatchInstallResponse, InstallProgress, InstallStatus,
    Logger, LogEntry
};
use crate::installers::create_all_installers;
use std::sync::Arc;
use crate::installer::Installer;
use std::path::PathBuf;

pub struct AppState {
    pub static_installers: Arc<Vec<Arc<dyn Installer>>>,
    pub loader: Arc<InstallerLoader>,
    pub logger: Arc<Logger>,
}

pub fn create_router() -> Router {
    let static_installers = Arc::new(create_all_installers());
    
    let scripts_dir = PathBuf::from("installers");
    let loader = Arc::new(InstallerLoader::new(scripts_dir));
    
    let logs_dir = PathBuf::from("logs");
    let logger = Arc::new(Logger::new(logs_dir));
    
    let loader_clone = Arc::clone(&loader);
    tokio::spawn(async move {
        if let Err(e) = loader_clone.load_all().await {
            eprintln!("Ошибка загрузки скриптов: {}", e);
        }
        loader_clone.start_watcher();
    });

    let state = AppState {
        static_installers,
        loader,
        logger,
    };

    Router::new()
        .route("/api/installers", get(get_all_installers))
        .route("/api/installers/:id", get(get_installer))
        .route("/api/installers/:id/install", post(install_installer))
        .route("/api/installers/:id/update", post(update_installer))
        .route("/api/installers/:id/uninstall", post(uninstall_installer))
        .route("/api/installers/:id/logs", get(get_installer_logs))
        .route("/api/installers/batch-install", post(batch_install))
        .route("/api/categories", get(get_categories))
        .with_state(Arc::new(state))
}

async fn get_all_installers(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> Result<Json<Vec<InstallerInfo>>, StatusCode> {
    let mut infos = Vec::new();
    
    for installer in state.static_installers.iter() {
        infos.push(installer.get_info().await);
    }
    
    for installer in state.loader.get_all() {
        infos.push(installer.get_info().await);
    }
    
    Ok(Json(infos))
}

async fn get_installer(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<InstallerInfo>, StatusCode> {
    if let Some(installer) = state.static_installers.iter().find(|i| i.id() == id) {
        return Ok(Json(installer.get_info().await));
    }
    
    if let Some(installer) = state.loader.get(&id) {
        return Ok(Json(installer.get_info().await));
    }
    
    Err(StatusCode::NOT_FOUND)
}

async fn install_installer(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<InstallResult>, StatusCode> {
    let logger = Arc::clone(&state.logger);
    
    if let Some(installer) = state.static_installers.iter().find(|i| i.id() == id) {
        logger.log(&id, "install", "started", "Начало установки", "");
        match installer.install().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "install", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "install", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    if let Some(installer) = state.loader.get(&id) {
        logger.log(&id, "install", "started", "Начало установки", "");
        match installer.install().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "install", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "install", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    Err(StatusCode::NOT_FOUND)
}

async fn update_installer(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<InstallResult>, StatusCode> {
    let logger = Arc::clone(&state.logger);
    
    if let Some(installer) = state.static_installers.iter().find(|i| i.id() == id) {
        logger.log(&id, "update", "started", "Начало обновления", "");
        match installer.update().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "update", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "update", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    if let Some(installer) = state.loader.get(&id) {
        logger.log(&id, "update", "started", "Начало обновления", "");
        match installer.update().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "update", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "update", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    Err(StatusCode::NOT_FOUND)
}

async fn uninstall_installer(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<InstallResult>, StatusCode> {
    let logger = Arc::clone(&state.logger);
    
    if let Some(installer) = state.static_installers.iter().find(|i| i.id() == id) {
        logger.log(&id, "uninstall", "started", "Начало удаления", "");
        match installer.uninstall().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "uninstall", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "uninstall", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    if let Some(installer) = state.loader.get(&id) {
        logger.log(&id, "uninstall", "started", "Начало удаления", "");
        match installer.uninstall().await {
            Ok(result) => {
                let status = if result.success { "success" } else { "failed" };
                logger.log(&id, "uninstall", status, &result.message, &result.message);
                return Ok(Json(result));
            }
            Err(e) => {
                logger.log(&id, "uninstall", "failed", &e, &e);
                return Ok(Json(InstallResult {
                    success: false,
                    message: e,
                }));
            }
        }
    }
    
    Err(StatusCode::NOT_FOUND)
}

async fn get_installer_logs(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<Vec<LogEntry>>, StatusCode> {
    let logs = state.logger.get_logs(&id);
    Ok(Json(logs))
}

async fn batch_install(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    axum::Json(request): axum::Json<BatchInstallRequest>,
) -> Result<Json<BatchInstallResponse>, StatusCode> {
    let logger = Arc::clone(&state.logger);
    let mut progress = Vec::new();
    let mut completed = 0;
    let mut failed = 0;

    for id in &request.ids {
        progress.push(InstallProgress {
            id: id.clone(),
            status: InstallStatus::Pending,
            progress: 0,
            message: "Ожидание...".to_string(),
        });
    }

    let total = request.ids.len();

    for (index, id) in request.ids.iter().enumerate() {
        let progress_item = progress.get_mut(index).unwrap();
        progress_item.status = InstallStatus::Installing;
        progress_item.progress = 10;
        progress_item.message = "Начало установки...".to_string();
        logger.log(id, "install", "started", "Начало установки", "");

        progress_item.progress = 30;
        progress_item.message = "Установка...".to_string();

        let install_result = if let Some(installer) = state.static_installers.iter().find(|i| i.id() == id) {
            installer.install().await
        } else if let Some(installer) = state.loader.get(id) {
            installer.install().await
        } else {
            progress_item.status = InstallStatus::Failed;
            progress_item.progress = 100;
            progress_item.message = "Установщик не найден".to_string();
            logger.log(id, "install", "failed", "Установщик не найден", "");
            failed += 1;
            continue;
        };

        match install_result {
            Ok(result) => {
                if result.success {
                    progress_item.status = InstallStatus::Completed;
                    progress_item.progress = 100;
                    progress_item.message = result.message.clone();
                    logger.log(id, "install", "success", &result.message, &result.message);
                    completed += 1;
                } else {
                    progress_item.status = InstallStatus::Failed;
                    progress_item.progress = 100;
                    progress_item.message = result.message.clone();
                    logger.log(id, "install", "failed", &result.message, &result.message);
                    failed += 1;
                }
            }
            Err(e) => {
                progress_item.status = InstallStatus::Failed;
                progress_item.progress = 100;
                let error_msg = format!("Ошибка: {}", e);
                progress_item.message = error_msg.clone();
                logger.log(id, "install", "failed", &error_msg, &error_msg);
                failed += 1;
            }
        }
    }

    Ok(Json(BatchInstallResponse {
        total,
        completed,
        failed,
        progress,
    }))
}

async fn get_categories(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> Result<Json<Vec<String>>, StatusCode> {
    let mut categories = std::collections::HashSet::new();
    
    for installer in state.static_installers.iter() {
        categories.insert(installer.category().to_string());
    }
    
    for installer in state.loader.get_all() {
        categories.insert(installer.category().to_string());
    }
    
    let mut categories_vec: Vec<String> = categories.into_iter().collect();
    categories_vec.sort();
    
    Ok(Json(categories_vec))
}
