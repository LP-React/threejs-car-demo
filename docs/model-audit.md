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

Load the model and visually inspect the front lights, paint, windows, normals, scale, and orientation in dark and studio-lit states. Measure performance before choosing optimization: the primitive count may increase draw calls, and triangle count alone does not determine rendering speed. Do not claim visual quality or final suitability until these checks are complete.
