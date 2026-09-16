import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useProgress } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { directTarget, poseAt } from './experience/camera'
import type { SceneState } from './experience/camera'
import { chapterAt, chapters, tourHeight } from './experience/sequence'
import { CarScene } from './components/CarScene'
import './App.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Unable to render the vehicle scene', error, info); this.props.onFailure() }
  render() {
    if (this.state.failed) return <div className="scene-fallback"><p>The studio could not load.</p><button onClick={() => window.location.reload()}>Try again ↗</button></div>
    return this.props.children
  }
}

function LoadingScreen() {
  const { errors } = useProgress()
  return <div className="loading-screen" role="status" aria-live="polite">
    {errors.length ? <><p>The vehicle could not be loaded.</p><button onClick={() => window.location.reload()}>Try again ↗</button></> : <span className="sr-only">Preparing the studio.</span>}
  </div>
}

function App() {
  const root = useRef<HTMLElement>(null)
  const scroll = useRef<SceneState>({ progress: 0, pose: poseAt(0), jump: null })
  const intro = useRef({ lights: 0 })
  const entrance = useRef<gsap.core.Timeline | null>(null)
  const navigation = useRef<gsap.core.Tween | null>(null)
  const tour = useRef<gsap.core.Tween | null>(null)
  const requestRender = useRef<() => void>(() => {})
  const [sceneReady, setSceneReady] = useState(false)
  const handleSceneReady = useCallback(() => setSceneReady(true), [])
  const [chapter, setChapter] = useState(0)
  const [sceneFailed, setSceneFailed] = useState(false)
  const handleSceneFailure = useCallback(() => setSceneFailed(true), [])
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const chapterRef = useRef(0)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useGSAP(() => {
    if (!sceneReady && !sceneFailed) return
    if (reducedMotion || sceneFailed || window.scrollY > 30) {
      gsap.set(intro.current, { lights: 1 })
      gsap.set(root.current, { '--intro-scene': 1, '--intro-background': 1, '--intro-ui': 1 })
      return
    }
    entrance.current = gsap.timeline({ delay: 1, onUpdate: () => requestRender.current() })
      .to(intro.current, { lights: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(root.current, { '--intro-scene': 1, duration: 0.25 }, 0)
      .to(root.current, { '--intro-background': 1, duration: 1, ease: 'power2.out' }, 0.35)
      .to(root.current, { '--intro-ui': 1, duration: 0.85, ease: 'power2.out' }, 0.65)
    return () => { entrance.current = null }
  }, { scope: root, dependencies: [sceneReady, sceneFailed, reducedMotion], revertOnUpdate: true })
  const { contextSafe } = useGSAP(() => {
    tour.current = gsap.to(scroll.current, {
      progress: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: reducedMotion ? true : 0.7, invalidateOnRefresh: true },
      onUpdate: () => {
        requestRender.current()
        const progress = scroll.current.progress
        // Early scrolling finishes the entrance instead of hiding the ongoing tour.
        if (progress > 0.01) entrance.current?.progress(1)
        if (scroll.current.jump) return
        root.current?.style.setProperty('--progress', String(progress))
        const next = chapterAt(progress)
        if (next !== chapterRef.current) { chapterRef.current = next; setChapter(next) }
      },
    })
  }, { scope: root, dependencies: [reducedMotion], revertOnUpdate: true })
  const navigateTo = (index: number) => contextSafe(() => {
    if (!root.current) return
    entrance.current?.progress(1)
    navigation.current?.kill()
    const destination = chapters[index].at
    const jump = { from: { ...scroll.current.pose }, to: directTarget(scroll.current.pose, poseAt(destination)), mix: 0 }
    scroll.current.jump = jump
    chapterRef.current = index
    setChapter(index)
    root.current.style.setProperty('--progress', String(destination))
    const start = root.current.getBoundingClientRect().top + window.scrollY
    const target = start + (root.current.offsetHeight - window.innerHeight) * destination
    // Reposition the document silently; animate only the selected camera endpoints.
    window.scrollTo({ top: target, behavior: 'instant' })
    ScrollTrigger.update()
    navigation.current = gsap.to(jump, {
      mix: 1,
      duration: reducedMotion ? 0 : 1.25,
      ease: 'power2.inOut',
      onUpdate: () => requestRender.current(),
      onComplete: () => {
        scroll.current.jump = null
        tour.current?.scrollTrigger?.getTween()?.progress(1)
        requestRender.current()
      },
    })
  })()
  const current = chapters[chapter]
  return (
    <main ref={root} className={`experience chapter-${chapter}`} style={{ height: `${tourHeight}svh` }}>
      <div className="studio-stage">
        <div className="studio-base" />
        <div className="studio-glow" />
        <header className="header">
          <a href="#introduction" onClick={(event) => { event.preventDefault(); navigateTo(0) }} className="brand" aria-label="AMG studio, back to introduction"><span className="brand-stripes" />AMG<span className="brand-sub">DIGITAL ATELIER</span></a>
          <span className="header-model">MERCEDES-BENZ <span>SL 63</span></span>
        </header>
        <div className="backdrop-type" key={current.word} aria-hidden="true">{current.word}</div>
        <div className="canvas-layer"><SceneBoundary onFailure={handleSceneFailure}><CarScene scroll={scroll} intro={intro} reducedMotion={reducedMotion} onReady={handleSceneReady} requestRender={requestRender} /></SceneBoundary></div>
        <div className="studio-shade" aria-hidden="true" />
        <div className="model-label"><span className="status-dot" /> 2022 / MERCEDES-AMG SL 63</div>
        <div className="chapter-caption" key={chapter}>
          <div className="chapter-kicker"><span>{current.number}</span><span>{current.label}</span></div>
          <h1>{current.title}</h1>
          <p>{current.copy}</p>
        </div>
        <nav className="chapter-rail" aria-label="Experience chapters">
          {chapters.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={(event) => { event.preventDefault(); navigateTo(index) }} className={index === chapter ? 'selected' : ''} aria-current={index === chapter ? 'step' : undefined} aria-label={`${item.number} ${item.label}`}>
            <span className="rail-number">{item.number}</span><span className="rail-label">{item.label}</span><i />
          </a>)}
        </nav>
        <footer className="studio-footer">
          <span className="footer-edition">THE SL COLLECTION <span> / </span> VOL. 01</span>
          <div className="scroll-prompt"><span className="scroll-line" /><span>{chapter === chapters.length - 1 ? 'SCROLL BACK TO REVISIT' : current.detail}</span><span>↓</span></div>
          <span className="chapter-counter">{current.number}<span> / {String(chapters.length).padStart(2, '0')}</span></span>
          <div className="footer-credits">
            <small className="model-credit">3D model “2022 Mercedes-Benz AMG SL63” by <a href="https://3dwarehouse.sketchup.com/user/u9da13335-caf8-472a-af19-c20647fd81cf/Gh%C3%B8st" target="_blank" rel="noopener noreferrer">Ghøst</a>, available on Sketchfab.</small>
            <small className="developer-credit">Developed by <a href="https://www.layssonpolo.com/en" target="_blank" rel="noopener noreferrer">LP-REACT</a></small>
          </div>
        </footer>
        <div className="progress-track"><span /></div>
        {!sceneFailed && !sceneReady && <LoadingScreen />}
      </div>
      {chapters.map((item) => <div key={item.id} id={item.id} className="scroll-marker" style={{ top: `${item.at * (tourHeight - 100)}svh` }} aria-hidden="true" />)}
    </main>
  )
}

export default App
