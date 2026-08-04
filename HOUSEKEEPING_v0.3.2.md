Housekeeping recommendations:
- Keep release.json as single source of truth.
- Generate build-info.json during UpdateProject.ps1 with version/tag, current commit and builtAt timestamp.
- Validate release.json/package.json/build-info.json versions match before tagging.
- Exclude .vs from git (already in .gitignore).
