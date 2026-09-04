use crate::models::ProjectInfo;
use chrono::{DateTime, Utc};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;

pub fn analyze_directory(dir_path: &Path) -> Option<ProjectInfo> {
    if !dir_path.is_dir() {
        return None;
    }

    let folder_name = dir_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let mut project_type = String::new();
    let mut primary_language = String::new();
    let mut frameworks = Vec::new();
    let mut package_manager: Option<String> = None;
    let mut scripts = HashMap::new();
    let mut dependencies = Vec::new();
    let mut project_name = folder_name.clone();
    let mut description: Option<String> = None;
    let mut version: Option<String> = None;
    let mut is_project = false;

    // 1. Check Node.js / TypeScript / JavaScript (package.json)
    let pkg_json_path = dir_path.join("package.json");
    if pkg_json_path.is_file() {
        is_project = true;
        project_type = "Node.js".to_string();
        primary_language = "JavaScript".to_string();

        if let Ok(content) = fs::read_to_string(&pkg_json_path) {
            if let Ok(json) = serde_json::from_str::<Value>(&content) {
                if let Some(name) = json.get("name").and_then(|v| v.as_str()) {
                    if !name.trim().is_empty() {
                        project_name = name.to_string();
                    }
                }
                if let Some(desc) = json.get("description").and_then(|v| v.as_str()) {
                    description = Some(desc.to_string());
                }
                if let Some(ver) = json.get("version").and_then(|v| v.as_str()) {
                    version = Some(ver.to_string());
                }
                if let Some(pm) = json.get("packageManager").and_then(|v| v.as_str()) {
                    let pm_name = pm.split('@').next().unwrap_or(pm);
                    package_manager = Some(pm_name.to_string());
                }

                // Extract scripts
                if let Some(s_map) = json.get("scripts").and_then(|v| v.as_object()) {
                    for (k, v) in s_map {
                        if let Some(cmd) = v.as_str() {
                            scripts.insert(k.clone(), cmd.to_string());
                        }
                    }
                }

                // Extract dependencies & frameworks
                let mut dep_set = HashSet::new();
                for section in &["dependencies", "devDependencies", "peerDependencies"] {
                    if let Some(deps) = json.get(*section).and_then(|v| v.as_object()) {
                        for (dep_name, _) in deps {
                            dep_set.insert(dep_name.clone());
                        }
                    }
                }

                // TypeScript check
                if dir_path.join("tsconfig.json").exists() || dep_set.contains("typescript") {
                    primary_language = "TypeScript".to_string();
                }

                // Common Node Frameworks / Libraries
                let check_list = [
                    ("react", "React"),
                    ("react-dom", "React"),
                    ("next", "Next.js"),
                    ("vue", "Vue.js"),
                    ("nuxt", "Nuxt"),
                    ("@angular/core", "Angular"),
                    ("svelte", "Svelte"),
                    ("@sveltejs/kit", "SvelteKit"),
                    ("astro", "Astro"),
                    ("@remix-run/react", "Remix"),
                    ("solid-js", "SolidJS"),
                    ("vite", "Vite"),
                    ("tailwindcss", "Tailwind CSS"),
                    ("@tailwindcss/vite", "Tailwind CSS"),
                    ("@tauri-apps/api", "Tauri"),
                    ("electron", "Electron"),
                    ("express", "Express"),
                    ("@nestjs/core", "NestJS"),
                    ("fastify", "Fastify"),
                    ("hono", "Hono"),
                    ("koa", "Koa"),
                    ("prisma", "Prisma"),
                    ("@prisma/client", "Prisma"),
                    ("drizzle-orm", "Drizzle ORM"),
                    ("graphql", "GraphQL"),
                    ("trpc", "tRPC"),
                    ("@trpc/server", "tRPC"),
                    ("redux", "Redux"),
                    ("zustand", "Zustand"),
                    ("mobx", "MobX"),
                    ("vitest", "Vitest"),
                    ("jest", "Jest"),
                    ("playwright", "Playwright"),
                    ("cypress", "Cypress"),
                    ("shadcn-ui", "shadcn/ui"),
                    ("lucide-react", "Lucide Icons"),
                ];

                for (key, display) in check_list {
                    if dep_set.contains(key) && !frameworks.iter().any(|f| f == display) {
                        frameworks.push(display.to_string());
                    }
                }

                dependencies = dep_set.into_iter().collect();
                dependencies.sort();
            }
        }

        // Detect package manager from lockfiles if not found
        if package_manager.is_none() {
            if dir_path.join("bun.lockb").exists() || dir_path.join("bun.lock").exists() {
                package_manager = Some("bun".to_string());
            } else if dir_path.join("pnpm-lock.yaml").exists() {
                package_manager = Some("pnpm".to_string());
            } else if dir_path.join("yarn.lock").exists() {
                package_manager = Some("yarn".to_string());
            } else if dir_path.join("package-lock.json").exists() {
                package_manager = Some("npm".to_string());
            }
        }
    }

    // 2. Check Rust (Cargo.toml)
    let cargo_path = dir_path.join("Cargo.toml");
    if cargo_path.is_file() {
        let is_hybrid = is_project; // Might be Tauri or WASM project
        is_project = true;
        if !is_hybrid {
            project_type = "Rust".to_string();
            primary_language = "Rust".to_string();
            package_manager = Some("cargo".to_string());
        }

        if let Ok(content) = fs::read_to_string(&cargo_path) {
            // Simple parse for crate name
            for line in content.lines() {
                let trimmed = line.trim();
                if !is_hybrid && trimmed.starts_with("name =") {
                    if let Some(val) = trimmed.split('=').nth(1) {
                        let clean_name = val.trim().trim_matches('"').trim_matches('\'');
                        if !clean_name.is_empty() {
                            project_name = clean_name.to_string();
                        }
                    }
                }
                if !is_hybrid && trimmed.starts_with("version =") {
                    if let Some(val) = trimmed.split('=').nth(1) {
                        version = Some(val.trim().trim_matches('"').trim_matches('\'').to_string());
                    }
                }
            }

            // Check Rust crates / frameworks
            let rust_frameworks = [
                ("tauri", "Tauri"),
                ("actix-web", "Actix Web"),
                ("axum", "Axum"),
                ("tokio", "Tokio"),
                ("rocket", "Rocket"),
                ("warp", "Warp"),
                ("diesel", "Diesel"),
                ("sqlx", "SQLx"),
                ("bevy", "Bevy"),
                ("yew", "Yew"),
                ("leptos", "Leptos"),
                ("ratatui", "Ratatui"),
                ("clap", "Clap"),
                ("serde", "Serde"),
            ];

            for (crate_name, display) in rust_frameworks {
                let has_crate = content.contains(&format!("\"{}\"", crate_name))
                    || content.contains(&format!("{} =", crate_name))
                    || content.contains(&format!("{}=", crate_name));
                if has_crate && !frameworks.iter().any(|f| f == display) {
                    frameworks.push(display.to_string());
                }
            }

            if !is_hybrid {
                scripts.insert("dev / run".to_string(), "cargo run".to_string());
                scripts.insert("build".to_string(), "cargo build --release".to_string());
                scripts.insert("check".to_string(), "cargo check".to_string());
                scripts.insert("test".to_string(), "cargo test".to_string());
            }
        }
    }

    // 3. Check Python (pyproject.toml, requirements.txt, Pipfile, setup.py)
    let pyproject_path = dir_path.join("pyproject.toml");
    let requirements_path = dir_path.join("requirements.txt");
    let pipfile_path = dir_path.join("Pipfile");
    let setup_py_path = dir_path.join("setup.py");

    if (pyproject_path.is_file()
        || requirements_path.is_file()
        || pipfile_path.is_file()
        || setup_py_path.is_file())
        && !is_project
    {
        is_project = true;
        project_type = "Python".to_string();
        primary_language = "Python".to_string();

        let mut py_content = String::new();
        if let Ok(c) = fs::read_to_string(&pyproject_path) {
            py_content.push_str(&c);
            py_content.push('\n');
            if c.contains("tool.poetry") {
                package_manager = Some("poetry".to_string());
            } else if c.contains("tool.uv") || dir_path.join("uv.lock").exists() {
                package_manager = Some("uv".to_string());
            } else if c.contains("tool.rye") {
                package_manager = Some("rye".to_string());
            }
        }
        if let Ok(c) = fs::read_to_string(&requirements_path) {
            py_content.push_str(&c);
            py_content.push('\n');
            if package_manager.is_none() {
                package_manager = Some("pip".to_string());
            }
        }
        if let Ok(c) = fs::read_to_string(&pipfile_path) {
            py_content.push_str(&c);
            py_content.push('\n');
            if package_manager.is_none() {
                package_manager = Some("pipenv".to_string());
            }
        }

        let py_frameworks = [
            ("fastapi", "FastAPI"),
            ("django", "Django"),
            ("flask", "Flask"),
            ("torch", "PyTorch"),
            ("tensorflow", "TensorFlow"),
            ("pandas", "Pandas"),
            ("numpy", "NumPy"),
            ("scikit-learn", "Scikit-Learn"),
            ("celery", "Celery"),
            ("sqlalchemy", "SQLAlchemy"),
            ("streamlit", "Streamlit"),
            ("gradio", "Gradio"),
            ("langchain", "LangChain"),
            ("anthropic", "Anthropic SDK"),
            ("openai", "OpenAI SDK"),
        ];

        let lower_content = py_content.to_lowercase();
        for (keyword, display) in py_frameworks {
            if lower_content.contains(keyword) && !frameworks.iter().any(|f| f == display) {
                frameworks.push(display.to_string());
            }
        }

        if package_manager.is_none() {
            package_manager = Some("pip / venv".to_string());
        }
    }

    // 4. Check Go (go.mod)
    let gomod_path = dir_path.join("go.mod");
    if gomod_path.is_file() && !is_project {
        is_project = true;
        project_type = "Go".to_string();
        primary_language = "Go".to_string();
        package_manager = Some("go modules".to_string());

        if let Ok(content) = fs::read_to_string(&gomod_path) {
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("module ") {
                    let mod_name = trimmed.trim_start_matches("module").trim();
                    let short_name = mod_name.split('/').next_back().unwrap_or(mod_name);
                    if !short_name.is_empty() {
                        project_name = short_name.to_string();
                    }
                }
            }

            let go_frameworks = [
                ("github.com/gin-gonic/gin", "Gin"),
                ("github.com/gofiber/fiber", "Fiber"),
                ("github.com/labstack/echo", "Echo"),
                ("github.com/go-chi/chi", "Chi"),
                ("gorm.io/gorm", "GORM"),
                ("github.com/spf13/cobra", "Cobra"),
                ("google.golang.org/grpc", "gRPC"),
            ];

            for (module_pattern, display) in go_frameworks {
                if content.contains(module_pattern) && !frameworks.iter().any(|f| f == display) {
                    frameworks.push(display.to_string());
                }
            }

            scripts.insert("run".to_string(), "go run .".to_string());
            scripts.insert("build".to_string(), "go build .".to_string());
            scripts.insert("test".to_string(), "go test ./...".to_string());
        }
    }

    // 5. Check Flutter / Dart (pubspec.yaml)
    let pubspec_path = dir_path.join("pubspec.yaml");
    if pubspec_path.is_file() && !is_project {
        is_project = true;
        primary_language = "Dart".to_string();
        project_type = "Flutter".to_string();
        package_manager = Some("flutter".to_string());

        if let Ok(content) = fs::read_to_string(&pubspec_path) {
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("name:") {
                    let name = trimmed.trim_start_matches("name:").trim();
                    if !name.is_empty() {
                        project_name = name.to_string();
                    }
                }
                if trimmed.starts_with("description:") {
                    let desc = trimmed.trim_start_matches("description:").trim();
                    if !desc.is_empty() {
                        description = Some(desc.to_string());
                    }
                }
            }

            if content.contains("flutter:") {
                frameworks.push("Flutter SDK".to_string());
            }
        }
    }

    // 6. Check PHP / Composer (composer.json)
    let composer_path = dir_path.join("composer.json");
    if composer_path.is_file() && !is_project {
        is_project = true;
        project_type = "PHP".to_string();
        primary_language = "PHP".to_string();
        package_manager = Some("composer".to_string());

        if let Ok(content) = fs::read_to_string(&composer_path) {
            if let Ok(json) = serde_json::from_str::<Value>(&content) {
                if let Some(name) = json.get("name").and_then(|v| v.as_str()) {
                    project_name = name.to_string();
                }
                if let Some(desc) = json.get("description").and_then(|v| v.as_str()) {
                    description = Some(desc.to_string());
                }
            }
            if content.contains("laravel/framework") {
                frameworks.push("Laravel".to_string());
            } else if content.contains("symfony/") {
                frameworks.push("Symfony".to_string());
            }
        }
    }

    // 7. Check Java / Kotlin (pom.xml, build.gradle, build.gradle.kts)
    let pom_path = dir_path.join("pom.xml");
    let gradle_path = dir_path.join("build.gradle");
    let gradle_kts_path = dir_path.join("build.gradle.kts");
    if (pom_path.is_file() || gradle_path.is_file() || gradle_kts_path.is_file()) && !is_project {
        is_project = true;
        project_type = "Java / JVM".to_string();
        primary_language = if gradle_kts_path.is_file() {
            "Kotlin".to_string()
        } else {
            "Java".to_string()
        };
        package_manager = if pom_path.is_file() {
            Some("maven".to_string())
        } else {
            Some("gradle".to_string())
        };
        frameworks.push("Spring Boot / JVM".to_string());
    }

    // 8. Docker presence check
    let has_docker = dir_path.join("docker-compose.yml").exists()
        || dir_path.join("docker-compose.yaml").exists()
        || dir_path.join("Dockerfile").exists();
    if has_docker && !frameworks.iter().any(|f| f == "Docker") {
        frameworks.push("Docker".to_string());
    }

    // 9. Git Repository & Branch check
    let git_path = dir_path.join(".git");
    let is_git_repo = git_path.exists();
    let mut git_branch: Option<String> = None;

    if is_git_repo {
        let actual_git_dir = if git_path.is_file() {
            // Git submodule or worktree pointing to real git dir
            fs::read_to_string(&git_path)
                .ok()
                .and_then(|c| {
                    c.trim()
                        .strip_prefix("gitdir:")
                        .map(|gd| dir_path.join(gd.trim()))
                })
                .unwrap_or(git_path)
        } else {
            git_path
        };

        let head_file = actual_git_dir.join("HEAD");
        if let Ok(head_content) = fs::read_to_string(&head_file) {
            let trimmed = head_content.trim();
            if let Some(branch) = trimmed.strip_prefix("ref: refs/heads/") {
                git_branch = Some(branch.to_string());
            } else if !trimmed.is_empty() {
                // Detached HEAD or commit sha (first 7 chars)
                git_branch = Some(trimmed.chars().take(7).collect());
            }
        }
    }

    // 10. Last modified time from file system metadata
    let last_modified = fs::metadata(dir_path)
        .ok()
        .and_then(|m| m.modified().ok())
        .map(|sys_time| {
            let dt: DateTime<Utc> = sys_time.into();
            dt.to_rfc3339()
        });

    if !is_project {
        return None;
    }

    let id = dir_path.to_string_lossy().to_string();

    Some(ProjectInfo {
        id,
        name: project_name,
        path: dir_path.to_string_lossy().to_string(),
        project_type,
        primary_language,
        frameworks,
        package_manager,
        git_branch,
        is_git_repo,
        scripts,
        dependencies,
        last_modified,
        description,
        version,
    })
}
