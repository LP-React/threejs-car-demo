# Project context

## Goal

Build a visual, interactive Three.js application showcasing high-end cars. The 3D model is the centerpiece: create a striking experience with elegant effects and animations that reveal the vehicle.

## Experience direction

- Prioritize lighting, materials, reflections, and camera movement.
- Highlight each vehicle feature with a corresponding interaction or animation.
- Scroll drives a sequence of camera shots, changing camera position and orientation and model transforms. Do not expose free-camera or orbit controls to the user.
- Keep text brief and supportive of the model rather than building a primarily informational page.
- Use a discreet interface and smooth transitions; effects should help users appreciate the car.
- Manage model loading and rendering performance to keep interactions smooth.

## Scope

There are no SEO, search ranking, or marketing metadata objectives. Prioritize 3D presentation and interaction.

The user will provide vehicle models and specifications. Specific vehicles, scenes, and animations will be defined as those assets arrive. Do not invent specifications or assume missing assets are available.

## Current state

- Base: Vite, React, and TypeScript; package manager: pnpm.
- The application still displays the Vite starter screen.
- Installed 3D dependencies: `three`, `@react-three/fiber`, and `@react-three/drei` for React integration, model loading, and environments.
- Visual effects: `postprocessing` and `@react-three/postprocessing`.
- Animation: `gsap` with its included ScrollTrigger plugin and `@gsap/react` for React integration and cleanup. Use a scroll-linked sequence to control the camera and model.
- Three.js types: `@types/three`. React stays on the 19.2 release line compatible with Fiber 9.
- The 3D scene and scroll animations are not implemented yet.
- No vehicle models have been added yet.

## Version control

Keep completed changes in small, modular commits, each with one clear purpose. Write commit messages in English using `type(scope): description`. Follow the detailed rules in `AGENTS.md`.

## Commands

- `pnpm dev`: local development.
- `pnpm build`: TypeScript checks and production build.
- `pnpm lint`: ESLint checks.
- `pnpm preview`: preview the production build.
