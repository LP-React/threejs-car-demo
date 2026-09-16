# Agent instructions

Read `docs/project-context.md` before working on this project.

- Keep documentation concise and update the context when the scope changes.
- Prioritize the 3D car, visual quality, and smooth interactions.
- Do not add SEO work, marketing metadata, or extensive informational content.
- Do not invent vehicle specifications or assume model files are available.

## Version control

- Commit each completed, meaningful change in small, modular commits with one clear purpose.
- Use English for commit messages and project documentation.
- Format commit messages as `type(scope): description`, with a concise description in the imperative mood.
- Choose a type that matches the change, such as `feat`, `fix`, `refactor`, `docs`, `chore`, or `test`, and a scope that identifies the affected area.
- Stage only files belonging to that change; do not include unrelated user changes.
- Run relevant checks before committing code. Keep the dependency manifest and lockfile together.
- Examples: `feat(scene): add scroll-driven camera transitions`, `fix(models): correct vehicle material loading`, `docs(project): clarify animation requirements`.
