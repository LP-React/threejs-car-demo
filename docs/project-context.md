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
- Scroll controls the scene, with clickable chapter links as an alternative way to navigate the same sequence. Scrolling up reverses it. There are no mouse-driven camera controls.
- Evaluate models before implementing the scene. Prefer GLB/glTF with PBR textures and separately addressable materials for paint, glass, headlights, and taillights. Separate meshes are needed for independent part movement; a static model is sufficient for camera shots and whole-car transforms.
- Build and animate the lighting in our scene. Do not assume a marketplace preview's lighting, environment, or postprocessing is included in the downloaded model. Avoid baked highlights or unlit body materials that prevent a convincing lighting reveal.
- Inspect model hierarchy, material assignments, texture completeness, geometry, download size, and license before selecting an asset. Test the imported model under dark and studio lighting before finalizing it.
- Asset sources to evaluate: [Sketchfab downloadable models](https://sketchfab.com/features/gltf) and [Fab](https://www.fab.com/). The user supplied a 2022 Mercedes-AMG SL63 candidate; visual validation is pending.

## Scope

There are no SEO, search ranking, or marketing metadata objectives. Prioritize 3D presentation and interaction.

The user will provide vehicle models and specifications. Specific vehicles, scenes, and animations will be defined as those assets arrive. Do not invent specifications or assume missing assets are available.

## Current state

- Base: Vite, React, and TypeScript; package manager: pnpm.
- The Mercedes-AMG SL63 experience uses a sticky studio viewport and seven scroll-driven chapters: introduction, reveal, silhouette, wheels, interior, rear, and finale.
- `src/experience/sequence.ts` centralizes chapter destinations, activation thresholds, camera shots, and tour height. Camera positions use an orbit with unwrapped increasing angles, interpolated radius, elevation, and targets. The rear-to-front closing arc continues in the same direction instead of reversing or taking a straight shortcut through the orbit.
- The chapter navigation includes numbers and labels on desktop and compact numbered links on mobile, with accessible labels and an active-state indicator. Clicks transition directly from the rendered camera pose to the selected chapter's pose and lighting over 1.25 seconds, using the shortest angular path and no intermediate chapter states. The document is repositioned instantly behind the scene so scroll resumes at the selected chapter. Repeated clicks replace the active transition from its current rendered pose. Reduced-motion navigation is immediate. The native scrollbar remains hidden; the bottom line indicates progress.
- `src/experience/camera.ts` samples scroll poses separately from direct chapter transitions. Scroll retains its continuous unwrapped orbit; chapter clicks blend only the origin and destination poses.
- The entrance starts completely black, including loading. Once the scene is ready, it holds for one second, fades the headlights on, reveals the existing background, and then fades in the interface. Early scrolling completes the entrance; restored scroll positions and reduced-motion preferences skip it. Loading or rendering failures still show recovery messages.
- Background typography is smaller (12vw, capped at 210px on desktop; 17vw on mobile) and positioned above the model. The model's presentation scale is unchanged. Detail shots use closer camera targets; a subtle shading layer protects caption legibility. The final camera pose is held over the last 3% of scroll progress.
- Installed 3D dependencies: `three`, `@react-three/fiber`, and `@react-three/drei` for React integration, model loading, and environments.
- Visual effects: `postprocessing` and `@react-three/postprocessing`.
- Antialiasing is applied in the postprocessing composer: 4-sample MSAA plus SMAA for fine edges. Native canvas antialiasing is disabled to avoid duplicating work; device pixel ratio is capped at 2 for sharper high-density displays. These settings add GPU cost and should be reviewed during hardware performance profiling.
- Mobile/coarse-pointer devices load a separate 10,791,908-byte GLB with 29 primitives (original: 16,254,408 bytes and 447). All 350,581 triangles and 29 named materials are retained; textures are capped at 1024px and stored as WebP, geometry is quantized, and compatible meshes are joined. Choose the asset once on mount to avoid duplicate downloads on resize. Regenerate with `pnpm optimize:mobile`; never deduplicate materials because their names control lamp/glass overrides.
- Mobile rendering starts at DPR 1.25 with SMAA, no MSAA, and 256px bloom resolution. After 90 consecutive active frames below 45 FPS, it drops to DPR 1 for the session. Idle gaps/loading stalls are excluded. Desktop retains DPR up to 2, 4x MSAA, and 512px bloom. Canvas renders on demand; GSAP entrance, scroll, and chapter transitions explicitly invalidate it, so stationary scenes stop rendering. Browser layout checks are not physical-phone benchmarks.
- Animation: `gsap` with its included ScrollTrigger plugin and `@gsap/react` for React integration and cleanup. Use a scroll-linked sequence to control the camera and model.
- Three.js types: `@types/three`. React stays on the 19.2 release line compatible with Fiber 9.
- `src/components/CarScene.tsx` loads the model, normalizes its bounds, adjusts materials, generates a local studio environment, and interpolates camera shots and environment intensity from scroll progress.
- `src/App.tsx` manages the timed entrance, GSAP ScrollTrigger sequence, chapter text, scene readiness, and rendering failure recovery. `src/App.css` styles the layered typography and responsive interface.
- Runtime model: `public/models/mercedes-amg-sl63.glb`, extracted from the original user-provided ZIP. The ZIP stays locally at `src/2022-mercedes-benz-amg-sl63.zip` and is ignored to avoid storing the model twice.
- Desktop and 390 × 844 mobile layouts were visually checked, including dark headlights, the reveal, side/rear shots, and returning to the opening. No browser console errors were observed. Hardware performance profiling is still pending.
- Reduced-motion preferences remove CSS transitions and replace camera interpolation with discrete shots. The scene provides WebGL and loading error fallbacks.
- The footer credits the user-supplied author Ghøst, links their [3D Warehouse profile](https://3dwarehouse.sketchup.com/user/u9da13335-caf8-472a-af19-c20647fd81cf/Gh%C3%B8st), and identifies Sketchfab as the platform per the user's attribution text. The exact model-page URL and asset license are still pending. See `docs/model-audit.md`.
- The right-hand footer credit reads “Developed by LP-REACT” and links to [the developer's portfolio](https://www.layssonpolo.com/en). Credits stack on mobile, with the developer credit aligned right; external credit links open in a separate tab.

## Version control

Keep completed changes in small, modular commits, each with one clear purpose. Write commit messages in English using `type(scope): description`. Follow the detailed rules in `AGENTS.md`.

## Commands

- `pnpm dev`: local development.
- `pnpm build`: TypeScript checks and production build.
- `pnpm lint`: ESLint checks.
- `pnpm preview`: preview the production build.
