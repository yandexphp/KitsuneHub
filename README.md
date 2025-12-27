# KitsuneHub

A utility for installing, updating, and uninstalling applications with a web interface.

## Project Structure

* `src/` — Rust backend (API server)
* `frontend/` — React + TypeScript frontend (FSD structure)
* `installers/` — Dynamic installers (scripts)

## Running the Project

### Backend (Rust)

```bash
cd KitsuneHub
cargo run
```

The API server will start at `http://localhost:48399`

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:48372`

## Dynamic Installers

The system supports dynamic loading of installers from scripts.
Add a JSON configuration file to the `installers/` directory along with the corresponding scripts.

### Configuration Format

Create a file `installers/my-app.json`:

```json
{
  "id": "my-app",
  "name": "My App",
  "description": "Application description",
  "category": "Development Tools",
  "dependencies": [],
  "scripts": {
    "install": "install.sh",
    "update": "update.sh",
    "uninstall": "uninstall.sh",
    "check": "check.sh",
    "version": "version.sh",
    "latest_version": "latest_version.sh"
  }
}
```

### Directory Structure

```
installers/
  my-app.json
  my-app/
    install.sh
    update.sh
    uninstall.sh
    check.sh
    version.sh
    latest_version.sh
```

### Scripts

* **install.sh** — Installation script (required)
* **update.sh** — Update script (optional)
* **uninstall.sh** — Uninstallation script (optional)
* **check.sh** — Installation check, must return `"1"`, `"true"`, or `"installed"` if installed (optional)
* **version.sh** — Get current version (optional)
* **latest_version.sh** — Get latest version (optional)

### Automatic Reloading

The system automatically watches the `installers/` directory and reloads installers every 2 seconds.
New installers appear in the interface without restarting the application.

## Architecture

### Backend

* Modular installer system — each tool is implemented as a separate module
* Dynamic script loading from the `installers/` directory
* Automatic reloading on configuration changes
* The `Installer` trait defines a common interface for all installers
* Axum-based API provides REST endpoints for managing installers

### Frontend

* FSD (Feature-Sliced Design) architecture
* `app/` — application entry point
* `shared/` — reusable components and utilities
* `entities/` — business entities (InstallerCard)
* `features/` — features (SearchBar, CategoryFilter)
* `widgets/` — composite components (Header, InstallerList)

## Supported Applications

* NVM, Node.js, Bun, Git, Docker
* Postman, Cursor, VS Code, iTerm
* Telegram, Discord
* DBngin, DBeaver, TablePlus
* Spotify, OBS
* Unity Hub, Unity
* Charles, NordVPN, NordPass
* Visual Studio, Android Studio, Xcode
* Figma, Pixso
* Transmit, DaisyDisk
* JetBrains Toolbox
* Shazam, NCALayer

## Features

* Dependency checking (e.g. Node.js requires NVM)
* Display of current and latest versions
* Search and category filtering
* Modular architecture — easy to add or remove installers
* Dynamic installer loading from scripts
* Automatic installer list updates
