import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, Box3, Color, DataTexture, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'
import type { MutableRefObject } from 'react'
import { blendPose, poseAt } from '../experience/camera'
import type { SceneState } from '../experience/camera'

export type ScrollState = SceneState
type IntroState = { lights: number }
type SceneProps = { scroll: MutableRefObject<ScrollState>; intro: MutableRefObject<IntroState>; reducedMotion: boolean; onReady: () => void; requestRender: MutableRefObject<() => void> }

function Vehicle({ intro, mobile }: Pick<SceneProps, 'intro'> & { mobile: boolean }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/mercedes-amg-sl63${mobile ? '-mobile' : ''}.glb`)
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
    return { model: clone, lamps: [...materials.values()].filter((material) => /DRLs|shader_brake|vehiclelights128__RR/.test(material.name)) }
  }, [scene])
  useFrame(() => {
    for (const lamp of vehicle.lamps) {
      // These are owned Three.js materials, animated imperatively outside React's render.
      // eslint-disable-next-line react-hooks/immutability
      lamp.emissiveIntensity = (/DRLs/.test(lamp.name) ? 4 : 2.5) * intro.current.lights
    }
  })
  // GLTF cache owns the shared geometry and textures; keep them for remounts.
  return <primitive object={vehicle.model} dispose={null} />
}

function CameraDirector({ scroll, intro, reducedMotion }: SceneProps) {
  const { camera, size } = useThree()
  const position = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  useFrame((state) => {
    const jump = scroll.current.jump
    const pose = jump ? blendPose(jump.from, jump.to, jump.mix) : poseAt(scroll.current.progress, reducedMotion)
    // Shared imperative motion state records the rendered pose for interrupted chapter transitions.
    // eslint-disable-next-line react-hooks/immutability
    scroll.current.pose = pose
    position.set(Math.sin(pose.angle) * pose.radius, pose.y, Math.cos(pose.angle) * pose.radius)
    target.set(pose.targetX, pose.targetY, pose.targetZ)
    // Back the camera away on portrait screens to keep the full car in frame.
    const aspect = size.width / size.height
    const lateral = Math.abs(position.x - target.x) / position.distanceTo(target)
    const wide = pose.wide
    const fit = aspect < 1 ? MathUtils.lerp(1.12, Math.max(1.3, 0.8 / aspect) + lateral * 0.65, wide) : 1
    position.sub(target).multiplyScalar(fit).add(target)
    camera.position.copy(position)
    camera.lookAt(target)
    state.scene.environmentIntensity = pose.light * intro.current.lights
  })
  return null
}

function SceneReady({ onReady }: Pick<SceneProps, 'onReady'>) {
  useEffect(() => {
    // Allow the first committed scene to render before starting the black hold.
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(onReady) })
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [onReady])
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
  // Choose the asset once; resizing must not download a second model.
  const [mobile] = useState(() => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches)
  return (
    <Canvas
      frameloop="demand"
      dpr={mobile ? 1.25 : [1, 2]}
      onCreated={({ invalidate }) => {
        // Expose the Canvas invalidator to the external GSAP animation loop.
        // eslint-disable-next-line react-hooks/immutability
        props.requestRender.current = invalidate
      }}
      camera={{ position: [0, 1.25, 6.2], fov: 36, near: 0.1, far: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping }}
      fallback={<div className="scene-fallback">This experience needs WebGL. Please try a browser with hardware acceleration enabled.</div>}
      aria-label="Mercedes-AMG SL 63, a 3D studio presentation controlled by scrolling"
    >
      <Suspense fallback={null}>
        <Vehicle intro={props.intro} mobile={mobile} />
        {mobile && <MobileResolution />}
        <Studio />
        <CameraDirector {...props} />
        <GroundShadow />
        <SceneReady onReady={props.onReady} />
        {/* Apply antialiasing to the composer's render targets, which feed the final image. */}
        <EffectComposer multisampling={mobile ? 0 : 4}>
          <Bloom luminanceThreshold={1.1} intensity={0.35} mipmapBlur resolutionY={mobile ? 256 : 512} />
          <SMAA />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}

function MobileResolution() {
  const setDpr = useThree((state) => state.setDpr)
  const samples = useRef({ count: 0, elapsed: 0, settled: false })
  useFrame((_, delta) => {
    const sample = samples.current
    // Ignore idle gaps and loading stalls; measure only consecutive animation frames.
    if (sample.settled || delta > 0.15) return
    sample.count++
    sample.elapsed += delta
    if (sample.count < 90) return
    if (sample.count / sample.elapsed < 45) { setDpr(1); sample.settled = true }
    sample.count = 0
    sample.elapsed = 0
  })
  return null
}
