export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  project_type: string;
  primary_language: string;
  frameworks: string[];
  package_manager?: string | null;
  git_branch?: string | null;
  is_git_repo: boolean;
  scripts: Record<string, string>;
  dependencies: string[];
  last_modified?: string | null;
  description?: string | null;
  version?: string | null;
}

export interface ScanResult {
  root_path: string;
  projects: ProjectInfo[];
  total_scanned: number;
  duration_ms: number;
}

export type SortField = "name" | "last_modified" | "type" | "framework_count";
export type SortOrder = "asc" | "desc";
export type ViewMode = "board" | "list" | "grid" | "table";
export type NavTab = "projects" | "scan" | "settings";
export type EditorType = "vscode" | "cursor" | "zed" | "idea" | "webstorm" | "sublime";

