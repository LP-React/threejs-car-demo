import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useProgress } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CarScene } from './components/CarScene'
import './App.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const chapters = [
  { number: '01', label: 'The introduction', title: 'Before the light.', copy: 'A presence you feel. Before you see it.', word: '', detail: 'SCROLL TO REVEAL' },
  { number: '02', label: 'The reveal', title: 'Made to be seen.', copy: 'Light traces every curve. A new perspective on the Mercedes-AMG SL 63.', word: 'SL 63', detail: 'LIGHT / FORM / PRESENCE' },
  { number: '03', label: 'The silhouette', title: 'Every line. Intentional.', copy: 'Follow the silhouette. Discover the details that give the SL its character.', word: 'SCULPTED', detail: 'A STUDY IN PROPORTION' },
  { number: '04', label: 'The perspective', title: 'Leave an impression.', copy: 'One last angle. The same unmistakable presence.', word: 'AMG', detail: 'THE FINAL PERSPECTIVE' },
]

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
  const scroll = useRef({ progress: 0 })
  const intro = useRef({ lights: 0 })
  const entrance = useRef<gsap.core.Timeline | null>(null)
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
    entrance.current = gsap.timeline({ delay: 1 })
      .to(intro.current, { lights: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(root.current, { '--intro-scene': 1, duration: 0.25 }, 0)
      .to(root.current, { '--intro-background': 1, duration: 1, ease: 'power2.out' }, 0.35)
      .to(root.current, { '--intro-ui': 1, duration: 0.85, ease: 'power2.out' }, 0.65)
    return () => { entrance.current = null }
  }, { scope: root, dependencies: [sceneReady, sceneFailed, reducedMotion], revertOnUpdate: true })
  useGSAP(() => {
    gsap.to(scroll.current, {
      progress: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: reducedMotion ? true : 0.7, invalidateOnRefresh: true },
      onUpdate: () => {
        const progress = scroll.current.progress
        // Early scrolling finishes the entrance instead of hiding the ongoing tour.
        if (progress > 0.01) entrance.current?.progress(1)
        root.current?.style.setProperty('--progress', String(progress))
        const next = progress < 0.13 ? 0 : progress < 0.4 ? 1 : progress < 0.7 ? 2 : 3
        if (next !== chapterRef.current) { chapterRef.current = next; setChapter(next) }
      },
    })
  }, { scope: root, dependencies: [reducedMotion], revertOnUpdate: true })
  const current = chapters[chapter]
  return (
    <main ref={root} className={`experience chapter-${chapter}`}>
      <div className="studio-stage">
        <div className="studio-base" />
        <div className="studio-glow" />
        <header className="header">
          <a href="#introduction" className="brand" aria-label="AMG studio, back to introduction"><span className="brand-stripes" />AMG<span className="brand-sub">DIGITAL ATELIER</span></a>
          <span className="header-model">MERCEDES-BENZ <span>SL 63</span></span>
          <a className="header-link" href="#silhouette">EXPLORE THE FORM <span>↗</span></a>
        </header>
        <div className="backdrop-type" key={current.word} aria-hidden="true">{current.word}</div>
        <div className="canvas-layer"><SceneBoundary onFailure={handleSceneFailure}><CarScene scroll={scroll} intro={intro} reducedMotion={reducedMotion} onReady={handleSceneReady} /></SceneBoundary></div>
        <div className="model-label"><span className="status-dot" /> 2022 / MERCEDES-AMG SL 63</div>
        <div className="chapter-caption" key={chapter}>
          <div className="chapter-kicker"><span>{current.number}</span><span>{current.label}</span></div>
          <h1>{current.title}</h1>
          <p>{current.copy}</p>
        </div>
        <aside className="chapter-rail" aria-label="Current chapter">
          {chapters.map((item, index) => <span key={item.number} className={index === chapter ? 'selected' : ''}>{item.number}<i /></span>)}
        </aside>
        <footer className="studio-footer">
          <span className="footer-edition">THE SL COLLECTION <span> / </span> VOL. 01</span>
          <div className="scroll-prompt"><span className="scroll-line" /><span>{chapter === 3 ? 'SCROLL BACK TO REVISIT' : current.detail}</span><span>↓</span></div>
          <span className="chapter-counter">{current.number}<span> / 04</span></span>
        </footer>
        <div className="progress-track"><span /></div>
        {!sceneFailed && !sceneReady && <LoadingScreen />}
      </div>
      <div id="introduction" className="scroll-marker marker-intro" aria-hidden="true" />
      <div id="reveal" className="scroll-marker marker-reveal" aria-hidden="true" />
      <div id="silhouette" className="scroll-marker marker-side" aria-hidden="true" />
      <div id="perspective" className="scroll-marker marker-rear" aria-hidden="true" />
    </main>
  )
}

export default App
