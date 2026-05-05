# Repository Guidelines

## Project Context for Agents
- Angular 20 lore manager with articles. Articles consist of sections.
- All data should be exportable and importable in a single file (state)
- Articles and sections can have PUBLIC or PRIVATE access. 
- PRIVATE data should be encrypted on export with a user provided password.
- On import if user provided correct password PRIVATE date should be decrypted and rendered

## Project Structure & Module Organization
- Source code lives in `src/app` with feature folders: `components/`, `services/`, `models/`, etc.
- Tests sit next to sources as `*.spec.ts` (e.g., `app.component.spec.ts`).
- App shell and globals: `src/main.ts`, `src/styles.css`, `src/index.html`.
- Static assets: `public/` (e.g., `public/favicon.ico`).
- Angular workspace config: `angular.json`; TypeScript configs: `tsconfig*.json`.
- Angular version is 20. Follow official Angular 20 guidelines
- Use angular material v20+
- Use full names for injections (e.g. `private readonly cryptoService: BundleCryptoService,`)

## Build, Test, and Development Commands
- `npm start` — Run dev server at localhost with HMR.
- `npm run build` — Production build to `dist/` via Angular build.
- `npm test` — Run unit tests (Karma + Jasmine).
- `npm run watch` — Rebuild on file changes (development config).
- Tips: use `ng test --code-coverage` to generate coverage.

## Coding Style & Naming Conventions
- TypeScript with 2‑space indentation and single quotes (see `prettier` in `package.json`).
- File names: kebab‑case (e.g., `lore-card.component.ts`).
- Classes/Components/Services: PascalCase (e.g., `LoreCardComponent`, `BundleCryptoService`).
- Re‑export barrel files allowed in `index.ts` within folders.
- Dont use `any` type.
- Create types for all business related instances, enumerations.
- Run Prettier before commits (configure your editor to format on save).

## Testing Guidelines
- Framework: Jasmine; runner: Karma. Place tests as `*.spec.ts` beside code.
- Prefer shallow tests for components and focused tests for services (e.g., `BundleCryptoService`).
- Use spies for browser APIs and storage. Keep tests deterministic.
- Generate coverage with `ng test --code-coverage`; aim to cover critical paths.

## Commit & Pull Request Guidelines
- Commits: present tense, concise scope. Conventional Commit prefixes encouraged:
  - `feat: ...`, `fix: ...`, `refactor: ...`, `test: ...`, `docs: ...`.
- PRs: include a clear description, linked issue (if any), screenshots/GIFs for UI changes, and test updates.
- Keep PRs small and focused. Describe any refactors or public API changes.

## Architecture Notes
- Angular app using services for storage and crypto (`storage.service.ts`, `bundle-crypto.service.ts`) and a `lore-card` component.
- Avoid renaming core files without discussion; keep routing/module filenames consistent with current project patterns.
- Use `@app/*` TS path aliases for imports (e.g., `@app/components`, `@app/services`, `@app/models`, `@app/pipes`) and add new `@app/<layer>` aliases when introducing new layers.
