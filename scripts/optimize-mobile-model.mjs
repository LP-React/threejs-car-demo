import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { NodeIO, PropertyType } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, flatten, join, prune, quantize, textureCompress, weld } from '@gltf-transform/functions'
import sharp from 'sharp'

const source = new URL('../public/models/mercedes-amg-sl63.glb', import.meta.url)
const destination = new URL('../public/models/mercedes-amg-sl63-mobile.glb', import.meta.url)
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const document = await io.read(fileURLToPath(source))
// Material names drive runtime glass and lamp overrides. Never deduplicate materials.
await document.transform(
  dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.TEXTURE] }),
  flatten(), join(), weld(), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 }),
  quantize(),
)
await io.write(fileURLToPath(destination), document)
console.log(`Mobile model: ${(await stat(destination)).size} bytes`)
