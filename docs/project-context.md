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
- The first Mercedes-AMG SL63 experience uses a sticky studio viewport and four scroll-driven chapters: dark opening, lighting reveal, side silhouette, and a rear perspective that returns to a front three-quarter shot for the closing pose.
- The entrance starts completely black, including loading. Once the scene is ready, it holds for one second, fades the headlights on, reveals the existing background, and then fades in the interface. Early scrolling completes the entrance; restored scroll positions and reduced-motion preferences skip it. Loading or rendering failures still show recovery messages.
- Background typography sits higher (12% from the top on desktop, 22% on mobile) while the model's presentation scale remains unchanged. The final camera pose is held over the last 3% of scroll progress.
- Installed 3D dependencies: `three`, `@react-three/fiber`, and `@react-three/drei` for React integration, model loading, and environments.
- Visual effects: `postprocessing` and `@react-three/postprocessing`.
- Antialiasing is applied in the postprocessing composer: 4-sample MSAA plus SMAA for fine edges. Native canvas antialiasing is disabled to avoid duplicating work; device pixel ratio is capped at 2 for sharper high-density displays. These settings add GPU cost and should be reviewed during hardware performance profiling.
- Animation: `gsap` with its included ScrollTrigger plugin and `@gsap/react` for React integration and cleanup. Use a scroll-linked sequence to control the camera and model.
- Three.js types: `@types/three`. React stays on the 19.2 release line compatible with Fiber 9.
- `src/components/CarScene.tsx` loads the model, normalizes its bounds, adjusts materials, generates a local studio environment, and interpolates camera shots and environment intensity from scroll progress.
- `src/App.tsx` manages the timed entrance, GSAP ScrollTrigger sequence, chapter text, scene readiness, and rendering failure recovery. `src/App.css` styles the layered typography and responsive interface.
- Runtime model: `public/models/mercedes-amg-sl63.glb`, extracted from the original user-provided ZIP. The ZIP stays locally at `src/2022-mercedes-benz-amg-sl63.zip` and is ignored to avoid storing the model twice.
- Desktop and 390 × 844 mobile layouts were visually checked, including dark headlights, the reveal, side/rear shots, and returning to the opening. No browser console errors were observed. Hardware performance profiling is still pending.
- Reduced-motion preferences remove CSS transitions and replace camera interpolation with discrete shots. The scene provides WebGL and loading error fallbacks.
- Visible copy is editorial; vehicle specifications await user-provided information. The source URL, author, and asset license are still pending. See `docs/model-audit.md`.

## Version control

Keep completed changes in small, modular commits, each with one clear purpose. Write commit messages in English using `type(scope): description`. Follow the detailed rules in `AGENTS.md`.

## Commands

- `pnpm dev`: local development.
- `pnpm build`: TypeScript checks and production build.
- `pnpm lint`: ESLint checks.
- `pnpm preview`: preview the production build.
