# Mercedes-AMG SL63 asset audit

## Supplied asset

- User description: 2022 Mercedes-Benz AMG SL 63, downloaded for free.
- Archive: `src/2022-mercedes-benz-amg-sl63.zip`.
- Model entry: `source/2022+Mercedes-AMG+SL63.glb`.
- Inspection method: read the ZIP entries and GLB JSON chunk without extracting or modifying the original archive. This is a structural inspection, not a visual or full glTF validation.

## Findings

- glTF 2.0 binary header; model size: 16,254,408 bytes (approximately 15.5 MiB).
- One internal buffer and 18 embedded images; no external image references. The archive also contains 18 loose PNGs.
- 447 nodes, 447 meshes/primitives, and 350,581 triangles.
- 29 materials using metallic-roughness PBR parameters, but no normal maps or metallic-roughness texture maps. All materials specify a metallic factor of zero.
- Separate material names include `Selenite Grey`, `Windows`, `DRLs`, `DRLs_2`, and rear/brake light materials. Their actual geometry and assignments need visual confirmation.
- No emissive materials, clearcoat extensions, unlit extensions, or animation clips were found. There is one camera; no lighting extension was declared.
- The archive contains no license file, and the asset metadata has no copyright field. Record the source URL, creator, and license separately; a free download alone does not establish usage terms.

## Suitability and next check

The structure is a useful starting point for scroll-driven camera shots and whole-car transforms. Built-in animation clips are not required for those effects.

Headlight materials will need emissive settings for the dark opening. Paint and glass need review and likely adjustment under a studio environment; the source materials are not a finished automotive lighting setup.

## First implementation

The GLB was extracted to `public/models/mercedes-amg-sl63.glb` and integrated into the first scroll presentation. Front-facing geometry points toward positive Z. The source bounds are normalized to a scene length of 4.8 units; this is a presentation scale, not a vehicle dimension claim.

Visual checks confirmed that the daytime-running light geometry can glow independently. The outer headlight covers needed transparency adjustments to expose it. Paint uses a physical clearcoat material; window opacity and chrome properties were also adjusted. These runtime changes preserve the original GLB.

The studio environment is generated locally from rectangular Lightformers. Scroll controls its intensity and camera shots. Bloom accents emissive lights; a generated gradient provides a soft grounding shadow, not physically calculated contact shadows.

Desktop and mobile renders were inspected under dark and studio lighting. Mobile camera distance was adjusted to keep the entire side view visible. Performance profiling, deeper material refinement, and license/source recording remain pending.

## Mobile variant

`pnpm optimize:mobile` generates `public/models/mercedes-amg-sl63-mobile.glb` with glTF Transform 4.5.0 and Sharp. It joins compatible meshes, welds vertices, quantizes attributes, and converts textures to WebP (maximum 1024px, quality 85). It retains all 350,581 triangles and all 29 named materials, including the independent headlamp covers. Material deduplication and geometry simplification are intentionally excluded.

The variant contains 29 primitives and weighs 10,791,908 bytes: 33.6% smaller than the original, with 93.5% fewer primitives. WebP reduces transfer size; it is not GPU-native texture compression. The original desktop asset remains unchanged. Quantization and smaller textures trade some fine detail for lower memory/transfer cost. Physical-phone FPS and loading times still need measurement after deployment.
