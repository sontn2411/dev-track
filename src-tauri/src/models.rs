use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub project_type: String,
    pub primary_language: String,
    pub frameworks: Vec<String>,
    pub package_manager: Option<String>,
    pub git_branch: Option<String>,
    pub is_git_repo: bool,
    pub scripts: HashMap<String, String>,
    pub dependencies: Vec<String>,
    pub last_modified: Option<String>,
    pub description: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub root_path: String,
    pub projects: Vec<ProjectInfo>,
    pub total_scanned: usize,
    pub duration_ms: u64,
}
