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
    let trimmed = editor.trim();
    if trimmed.is_empty() {
        return Err("Editor command or path is empty".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        if trimmed.eq_ignore_ascii_case("antigravity") {
            // Try launching "Antigravity IDE" first, then "Antigravity"
            if Command::new("open")
                .args(["-a", "Antigravity IDE", &path])
                .spawn()
                .is_ok()
            {
                return Ok(());
            }

            Command::new("open")
                .args(["-a", "Antigravity", &path])
                .spawn()
                .map_err(|e| format!("Failed to launch Antigravity: {}", e))?;
            return Ok(());
        }

        if trimmed.ends_with(".app") || trimmed.starts_with("/Applications/") {
            Command::new("open")
                .args(["-a", trimmed, &path])
                .spawn()
                .map_err(|e| format!("Failed to launch {}: {}", trimmed, e))?;
            return Ok(());
        }
    }

    let editor_cmd = match trimmed.to_lowercase().as_str() {
        "antigravity" => "antigravity",
        "vscode" | "code" => "code",
        _ => trimmed,
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
