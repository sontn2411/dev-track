use std::process::Command;

#[tauri::command]
pub fn open_in_file_manager(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open Finder: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open File Explorer: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file manager: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn open_in_terminal(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Terminal", &path])
            .spawn()
            .map_err(|e| format!("Failed to open Terminal: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        // Try Windows Terminal (wt.exe), fallback to powershell
        let wt_result = Command::new("wt.exe")
            .args(["-d", &path])
            .spawn();

        if wt_result.is_err() {
            Command::new("powershell.exe")
                .args(["-NoExit", "-Command", &format!("Set-Location -LiteralPath '{}'", path)])
                .spawn()
                .map_err(|e| format!("Failed to open PowerShell: {}", e))?;
        }
    }

    #[cfg(target_os = "linux")]
    {
        let terminal = std::env::var("TERMINAL").unwrap_or_else(|_| "x-terminal-emulator".to_string());
        Command::new(&terminal)
            .args(["--working-directory", &path])
            .spawn()
            .map_err(|e| format!("Failed to open terminal: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn open_in_editor(path: String, editor: String) -> Result<(), String> {
    let editor_cmd = match editor.to_lowercase().as_str() {
        "cursor" => "cursor",
        "webstorm" => "webstorm",
        "zed" => "zed",
        "sublime" => "subl",
        "idea" => "idea",
        _ => "code", // default to VS Code
    };

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", editor_cmd, &path])
            .spawn()
            .map_err(|e| format!("Failed to launch {}: {}", editor_cmd, e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new(editor_cmd)
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to launch {}: {}", editor_cmd, e))?;
    }

    Ok(())
}
