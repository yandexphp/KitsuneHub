mod api;
mod installer;
mod installers;

use axum::Router;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .merge(api::create_router())
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([127, 0, 0, 1], 48399));
    println!("🚀 KitsuneHub API server running on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

