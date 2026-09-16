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

## Visual references and model selection

- Reference sequence: dark frontal view with visible headlights, progressive studio-light reveal, side view with large condensed typography behind the car, then a rear three-quarter view with short feature text.
- Use the references as visual direction, not an exact layout or a source of vehicle specifications. The opening reveal and typography behind the car are the main inspirations.
- Interaction is scroll-only for now. Scrolling up must reverse the sequence; mouse-driven interactions are a possible future addition.
- Evaluate models before implementing the scene. Prefer GLB/glTF with PBR textures and separately addressable materials for paint, glass, headlights, and taillights. Separate meshes are needed for independent part movement; a static model is sufficient for camera shots and whole-car transforms.
- Build and animate the lighting in our scene. Do not assume a marketplace preview's lighting, environment, or postprocessing is included in the downloaded model. Avoid baked highlights or unlit body materials that prevent a convincing lighting reveal.
- Inspect model hierarchy, material assignments, texture completeness, geometry, download size, and license before selecting an asset. Test the imported model under dark and studio lighting before finalizing it.
- Asset sources to evaluate: [Sketchfab downloadable models](https://sketchfab.com/features/gltf) and [Fab](https://www.fab.com/). The user supplied a 2022 Mercedes-AMG SL63 candidate; visual validation is pending.

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
- A user-provided archive exists at `src/2022-mercedes-benz-amg-sl63.zip` (not yet extracted or integrated). See `docs/model-audit.md` for its structural inspection.

## Version control

Keep completed changes in small, modular commits, each with one clear purpose. Write commit messages in English using `type(scope): description`. Follow the detailed rules in `AGENTS.md`.

## Commands

- `pnpm dev`: local development.
- `pnpm build`: TypeScript checks and production build.
- `pnpm lint`: ESLint checks.
- `pnpm preview`: preview the production build.
