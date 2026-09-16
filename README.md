# Three.js Auto Showcase

A visual, interactive application for exploring high-end cars through 3D models, elegant effects, and animations highlighting vehicle features.

Stack: Vite + React + TypeScript, with Three.js, React Three Fiber, Drei, postprocessing, and GSAP installed. Scroll will control camera shots and car transforms. Scene implementation and vehicle models are pending.

## Context

Read [docs/project-context.md](docs/project-context.md) for goals, scope, and project status. Agent instructions and commit conventions are in [AGENTS.md](AGENTS.md).

## Development

```sh
pnpm install
pnpm dev
```

Validation: `pnpm build` and `pnpm lint`. Build preview: `pnpm preview`.

## Commits

Use small, modular commits with one clear purpose. All commit messages must be in English and follow `type(scope): description`.
