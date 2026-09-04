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
        let win_path = path.replace('/', "\\");
        Command::new("explorer")
            .arg(&win_path)
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
pub fn open_in_terminal(path: String, terminal: Option<String>) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let term_choice = terminal.as_deref().unwrap_or("default").to_lowercase();
        let app_name = match term_choice.as_str() {
            "iterm2" | "iterm" => "iTerm",
            "warp" => "Warp",
            "alacritty" => "Alacritty",
            _ => "Terminal",
        };

        // Try launching preferred terminal
        let spawn_res = Command::new("open")
            .args(["-a", app_name, &path])
            .spawn();

        if let Err(e) = spawn_res {
            // If custom terminal failed, fallback to default Terminal.app
            if app_name != "Terminal" {
                Command::new("open")
                    .args(["-a", "Terminal", &path])
                    .spawn()
                    .map_err(|err| format!("Failed to open fallback Terminal: {}", err))?;
            } else {
                return Err(format!("Failed to open Terminal: {}", e));
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let win_path = path.replace('/', "\\");
        let term_choice = terminal.as_deref().unwrap_or("default").to_lowercase();
        let escaped_path = win_path.replace('\'', "''");

        match term_choice.as_str() {
            "cmd" => {
                Command::new("cmd.exe")
                    .args(["/K", &format!("cd /d \"{}\"", win_path)])
                    .spawn()
                    .map_err(|e| format!("Failed to open Command Prompt: {}", e))?;
            }
            "powershell" => {
                Command::new("powershell.exe")
                    .args(["-NoExit", "-Command", &format!("Set-Location -LiteralPath '{}'", escaped_path)])
                    .spawn()
                    .map_err(|e| format!("Failed to open PowerShell: {}", e))?;
            }
            "gitbash" => {
                let git_bash_paths = [
                    "C:\\Program Files\\Git\\git-bash.exe",
                    "C:\\Program Files (x86)\\Git\\git-bash.exe",
                ];
                let mut spawned = false;
                for gpath in &git_bash_paths {
                    if std::path::Path::new(gpath).exists() {
                        if Command::new(gpath)
                            .arg(format!("--cd={}", win_path))
                            .spawn()
                            .is_ok()
                        {
                            spawned = true;
                            break;
                        }
                    }
                }
                if !spawned {
                    // Fallback to PowerShell if Git Bash executable is not found
                    Command::new("powershell.exe")
                        .args(["-NoExit", "-Command", &format!("Set-Location -LiteralPath '{}'", escaped_path)])
                        .spawn()
                        .map_err(|e| format!("Failed to open terminal fallback: {}", e))?;
                }
            }
            _ => {
                // Try Windows Terminal (wt.exe), fallback to powershell
                let wt_result = Command::new("wt.exe")
                    .args(["-d", &win_path])
                    .spawn();

                if wt_result.is_err() {
                    Command::new("powershell.exe")
                        .args(["-NoExit", "-Command", &format!("Set-Location -LiteralPath '{}'", escaped_path)])
                        .spawn()
                        .map_err(|e| format!("Failed to open PowerShell: {}", e))?;
                }
            }
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
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let win_path = path.replace('/', "\\");

        // If editor is a direct executable file or path
        if editor_cmd.ends_with(".exe") || editor_cmd.contains('\\') || editor_cmd.contains('/') {
            Command::new(editor_cmd)
                .arg(&win_path)
                .spawn()
                .map_err(|e| format!("Failed to launch {}: {}", editor_cmd, e))?;
        } else {
            // For CLI commands like 'code' or 'antigravity', run via cmd with hidden window to avoid console flash
            Command::new("cmd")
                .args(["/C", editor_cmd, &win_path])
                .creation_flags(CREATE_NO_WINDOW)
                .spawn()
                .map_err(|e| format!("Failed to launch {}: {}", editor_cmd, e))?;
        }
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
