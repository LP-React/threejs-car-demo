# Three.js Auto Showcase

A visual, interactive application for exploring high-end cars through 3D models, elegant effects, and animations highlighting vehicle features.

Stack: Vite + React + TypeScript, Three.js, React Three Fiber, Drei, postprocessing, and GSAP. The experience features a 2022 Mercedes-AMG SL63 with seven chapters: introduction, reveal, silhouette, wheels, interior, rear, and finale. A continuous orbit closes on a front three-quarter view.

Scroll down to advance and scroll up to reverse the sequence, or select a chapter to animate directly to its camera shot. There are no free-camera controls. The interface adapts to desktop and mobile and respects reduced-motion preferences. The native scrollbar is hidden; a thin bottom line indicates progress.

## Context

Read [docs/project-context.md](docs/project-context.md) for goals, scope, and project status. Agent instructions and commit conventions are in [AGENTS.md](AGENTS.md).

## Development

```sh
pnpm install
pnpm dev
```

Validation: `pnpm build` and `pnpm lint`. Build preview: `pnpm preview`.

The GLB is served from `public/models/mercedes-amg-sl63.glb`. Its textures are embedded; the studio lighting is generated locally. See [the model audit](docs/model-audit.md) for material adjustments and remaining checks. Asset source, author, and license still need to be recorded.

## Commits

Use small, modular commits with one clear purpose. All commit messages must be in English and follow `type(scope): description`.
