pub mod detector;
pub mod launcher;
pub mod models;
pub mod scanner;

use models::ScanResult;
use rfd::FileDialog;

#[tauri::command]
fn pick_directory() -> Option<String> {
    let folder = FileDialog::new().pick_folder();
    folder.map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
fn scan_directories(paths: Vec<String>, depth: Option<usize>) -> Vec<ScanResult> {
    let max_depth = depth.unwrap_or(4);
    paths
        .iter()
        .map(|path| scanner::scan_path(path, max_depth))
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            scan_directories,
            launcher::open_in_file_manager,
            launcher::open_in_terminal,
            launcher::open_in_editor,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
