use crate::detector::analyze_directory;
use crate::models::ScanResult;
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::time::Instant;
use walkdir::WalkDir;

const IGNORED_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    "target",
    "dist",
    "build",
    "out",
    ".next",
    ".nuxt",
    ".output",
    "venv",
    ".venv",
    "env",
    "__pycache__",
    "vendor",
    ".cache",
    ".idea",
    ".vscode",
    "Pods",
    ".dart_tool",
    "bin",
    "obj",
    ".turbo",
    ".gradle",
];

pub fn scan_path(root_str: &str, max_depth: usize) -> ScanResult {
    let start_time = Instant::now();
    let root_path = PathBuf::from(root_str);
    let mut projects = Vec::new();
    let mut scanned_count = 0;
    let mut found_project_paths: HashSet<PathBuf> = HashSet::new();

    if !root_path.exists() || !root_path.is_dir() {
        return ScanResult {
            root_path: root_str.to_string(),
            projects: Vec::new(),
            total_scanned: 0,
            duration_ms: start_time.elapsed().as_millis() as u64,
        };
    }

    let walker = WalkDir::new(&root_path)
        .max_depth(max_depth)
        .follow_links(false)
        .into_iter()
        .filter_entry(|entry| {
            if !entry.file_type().is_dir() {
                return true;
            }
            let file_name = entry.file_name().to_string_lossy();
            if IGNORED_DIRS.contains(&file_name.as_ref()) {
                return false;
            }
            true
        });

    for entry in walker.filter_map(|e| e.ok()) {
        if entry.file_type().is_dir() {
            scanned_count += 1;
            let dir_path = entry.path();

            // Skip if this path is a child of an already detected non-monorepo project
            let is_inside_found_project = found_project_paths
                .iter()
                .any(|p| dir_path != p && dir_path.starts_with(p));

            if is_inside_found_project {
                // Check if parent was a monorepo
                let parent_is_monorepo = found_project_paths.iter().any(|p| {
                    if dir_path != p && dir_path.starts_with(p) {
                        is_monorepo_root(p)
                    } else {
                        false
                    }
                });

                if !parent_is_monorepo {
                    continue;
                }
            }

            if let Some(project) = analyze_directory(dir_path) {
                found_project_paths.insert(dir_path.to_path_buf());
                projects.push(project);
            }
        }
    }

    // Sort projects by name
    projects.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    ScanResult {
        root_path: root_str.to_string(),
        projects,
        total_scanned: scanned_count,
        duration_ms: start_time.elapsed().as_millis() as u64,
    }
}

fn is_monorepo_root(dir: &Path) -> bool {
    dir.join("pnpm-workspace.yaml").exists()
        || dir.join("lerna.json").exists()
        || dir.join("turbo.json").exists()
        || dir.join("nx.json").exists()
        || is_cargo_workspace(dir)
}

fn is_cargo_workspace(dir: &Path) -> bool {
    let cargo = dir.join("Cargo.toml");
    if let Ok(content) = std::fs::read_to_string(cargo) {
        content.contains("[workspace]")
    } else {
        false
    }
}
