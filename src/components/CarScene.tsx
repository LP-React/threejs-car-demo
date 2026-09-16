import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, Box3, Color, DataTexture, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'
import type { MutableRefObject } from 'react'

export type ScrollState = { progress: number }
type SceneProps = { scroll: MutableRefObject<ScrollState>; reducedMotion: boolean }
const modelUrl = `${import.meta.env.BASE_URL}models/mercedes-amg-sl63.glb`

function Vehicle() {
  const { scene } = useGLTF(modelUrl)
  const vehicle = useMemo(() => {
    const clone = scene.clone(true)
    const materials = new Map<MeshStandardMaterial, MeshStandardMaterial>()
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const prepare = (source: MeshStandardMaterial) => {
        if (materials.has(source)) return materials.get(source)!
        const material = source.clone()
        const name = material.name
        if (/Selenite Grey/.test(name)) {
          const paint = new MeshPhysicalMaterial()
          MeshStandardMaterial.prototype.copy.call(paint, material)
          paint.color = new Color('#7b8584')
          paint.metalness = 0.72
          paint.roughness = 0.27
          paint.clearcoat = 1
          paint.clearcoatRoughness = 0.15
          materials.set(source, paint)
          return paint
        }
        if (/Windows/.test(name)) {
          material.color.set('#132021')
          material.metalness = 0.35
          material.roughness = 0.1
          material.transparent = true
          material.opacity = 0.38
          material.depthWrite = false
        } else if (/fara_pered|fara_zad/.test(name)) {
          material.transparent = true
          material.opacity = 0.12
          material.depthWrite = false
          material.roughness = 0.08
        } else if (/DRLs/.test(name)) {
          material.color.set('#e2f8ff')
          material.emissive.set('#d7f3ff')
          material.emissiveIntensity = 4
          material.toneMapped = false
        } else if (/shader_brake|vehiclelights128__RR/.test(name)) {
          material.emissive.set('#fa1724')
          material.emissiveIntensity = 2.5
          material.toneMapped = false
        } else if (/Chrome/.test(name)) {
          material.metalness = 0.85
          material.roughness = 0.19
        }
        materials.set(source, material)
        return material
      }
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => prepare(material as MeshStandardMaterial))
        : prepare(object.material as MeshStandardMaterial)
    })
    const box = new Box3().setFromObject(clone)
    const center = box.getCenter(new Vector3())
    const scale = 4.8 / box.getSize(new Vector3()).z
    clone.position.set(-center.x * scale, -box.min.y * scale + 0.035, -center.z * scale)
    clone.scale.setScalar(scale)
    return clone
  }, [scene])
  // GLTF cache owns the shared geometry and textures; keep them for remounts.
  return <primitive object={vehicle} dispose={null} />
}

const shots = [
  { at: 0, position: [0, 1.25, 6.2], target: [0, 0.7, 0], light: 0.002 },
  { at: 0.25, position: [0.7, 1.65, 6.5], target: [0, 0.65, 0], light: 0.85 },
  { at: 0.56, position: [7.5, 1.65, 0.5], target: [0, 0.7, 0], light: 1 },
  { at: 0.83, position: [5.6, 2.15, -6.5], target: [0, 0.65, 0], light: 0.9 },
  { at: 1, position: [3.6, 1.7, -7.4], target: [0, 0.7, 0], light: 0.75 },
]

function CameraDirector({ scroll, reducedMotion }: SceneProps) {
  const { camera, size } = useThree()
  const position = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  useFrame((state) => {
    const progress = scroll.current.progress
    let index = shots.findIndex((shot) => shot.at >= progress)
    index = Math.max(1, index === -1 ? shots.length - 1 : index)
    const from = shots[index - 1]
    const to = shots[index]
    const raw = MathUtils.clamp((progress - from.at) / (to.at - from.at), 0, 1)
    const blend = reducedMotion ? (raw < 0.5 ? 0 : 1) : MathUtils.smoothstep(raw, 0, 1)
    position.set(MathUtils.lerp(from.position[0], to.position[0], blend), MathUtils.lerp(from.position[1], to.position[1], blend), MathUtils.lerp(from.position[2], to.position[2], blend))
    target.set(MathUtils.lerp(from.target[0], to.target[0], blend), MathUtils.lerp(from.target[1], to.target[1], blend), MathUtils.lerp(from.target[2], to.target[2], blend))
    // Back the camera away on portrait screens to keep the full car in frame.
    const aspect = size.width / size.height
    const lateral = Math.abs(position.x - target.x) / position.distanceTo(target)
    const fit = aspect < 1 ? Math.max(1.3, 0.8 / aspect) + lateral * 0.65 : 1
    position.sub(target).multiplyScalar(fit).add(target)
    camera.position.copy(position)
    camera.lookAt(target)
    state.scene.environmentIntensity = MathUtils.lerp(from.light, to.light, blend)
  })
  return null
}

function Studio() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[3, 8, 1]} />
      <Lightformer form="rect" intensity={3} position={[-4, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 7, 1]} />
      <Lightformer form="rect" intensity={2} position={[4, 3, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[2, 8, 1]} />
      <Lightformer form="rect" color="#c8dbd7" intensity={0.8} position={[0, 2, -5]} scale={[5, 2, 1]} />
    </Environment>
  )
}

function GroundShadow() {
  const texture = useMemo(() => {
    const size = 128
    const pixels = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const radius = Math.hypot((x / (size - 1) - 0.5) * 2, (y / (size - 1) - 0.5) * 2)
      pixels[(y * size + x) * 4 + 3] = Math.round(Math.pow(Math.max(0, 1 - radius), 1.4) * 220)
    }
    const map = new DataTexture(pixels, size, size)
    map.needsUpdate = true
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
    <planeGeometry args={[4.3, 7.2]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} />
  </mesh>
}

export function CarScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.25, 6.2], fov: 36, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
      fallback={<div className="scene-fallback">This experience needs WebGL. Please try a browser with hardware acceleration enabled.</div>}
      aria-label="Mercedes-AMG SL 63, a 3D studio presentation controlled by scrolling"
    >
      <Suspense fallback={null}>
        <Vehicle />
        <Studio />
        <CameraDirector {...props} />
        <GroundShadow />
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={1.1} intensity={0.35} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
