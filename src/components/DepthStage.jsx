import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../hooks/useLenis'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { DEPTH_UNIT } from './PhotoCollage'

gsap.registerPlugin(ScrollTrigger)

export const PERSPECTIVE = 1000
export const SPACING = 1600
export const SCROLL_PER_SECTION_VH = 150

const FADE_IN_START = -2.2 * SPACING
const FADE_IN_END = -0.6 * SPACING
const ACTIVE_FROM = -0.5 * SPACING
// Un elemento nunca se funde al acercarse: sigue creciendo, opaco, y se oculta de
// golpe justo antes de cruzar el plano de perspectiva (CSS invierte lo que lo cruza).
const NEAR_CUT = 0.97 * PERSPECTIVE
// La sección entera se oculta cuando hasta su foto más cercana ha pasado la cámara.
const SECTION_END = NEAR_CUT + DEPTH_UNIT

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const smooth = (t) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

// z = posición de la sección respecto a la cámara. 0 = justo delante,
// negativo = al fondo, positivo = ya ha pasado la cámara.
function sectionOpacity(z) {
  if (z <= FADE_IN_START || z >= SECTION_END) return 0
  if (z < FADE_IN_END) return smooth((z - FADE_IN_START) / (FADE_IN_END - FADE_IN_START))
  return 1
}

// 0 = fuera de rango, 1 = visible acercándose (fotos), 2 = protagonista (título)
function sectionPhase(z) {
  if (z <= FADE_IN_START || z >= SECTION_END) return 0
  if (z > ACTIVE_FROM) return 2
  return 1
}

export default function DepthStage({ sections, ready, locked = false, onActiveChange }) {
  const spacerRef = useRef(null)
  const sceneRef = useRef(null)
  const sectionRefs = useRef([])
  const n = sections.length

  const [phases, setPhases] = useState(() => sections.map((_, i) => sectionPhase(-i * SPACING)))
  const phasesRef = useRef(phases)
  const activeRef = useRef(-1)

  const goTo = useCallback((index) => {
    const y = index * window.innerHeight * (SCROLL_PER_SECTION_VH / 100)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(y, { duration: 1.8 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const els = sectionRefs.current.slice(0, n)
    if (!scene || els.some((el) => !el)) return

    els.forEach((el, i) => gsap.set(el, { z: -i * SPACING }))

    // Elementos con profundidad propia dentro de cada sección, para apagarlos
    // individualmente justo antes de que crucen la cámara.
    // Los bloques de texto ([data-dolly]) no se escalan con la perspectiva (Chrome
    // rasteriza el texto a tamaño limitado y se pixela al crecer): se mantienen a
    // z efectiva 0 y se agranda su font-size vía --zoom con el mismo factor.
    const layers = els.map((el) => [
      ...Array.from(el.querySelectorAll('[data-dolly]')).map((node) => ({ node, dz: 0, text: true })),
      ...Array.from(el.querySelectorAll('[data-photo]')).map((node) => ({
        node,
        dz: Number(node.dataset.depth || 0) * DEPTH_UNIT,
      })),
    ])
    const written = new Map()
    const setNear = (node, value) => {
      if (written.get(node) === value) return
      written.set(node, value)
      gsap.set(node, { autoAlpha: value })
    }

    const apply = (progress) => {
      const sceneZ = progress * (n - 1) * SPACING
      gsap.set(scene, { z: sceneZ })

      const next = new Array(n)
      let changed = false
      els.forEach((el, i) => {
        const z = sceneZ - i * SPACING
        gsap.set(el, { autoAlpha: sectionOpacity(z) })
        // Solo se escribe en el tramo cercano; fuera de él la opacidad la gobiernan
        // las animaciones de entrada (collage, título) y no hay que pisarla.
        const visible = z > FADE_IN_START && z < SECTION_END
        layers[i].forEach(({ node, dz, text }) => {
          const zEff = z + dz
          if (zEff >= NEAR_CUT) setNear(node, 0)
          else if (written.has(node)) setNear(node, 1)
          if (text && visible && zEff < NEAR_CUT) {
            gsap.set(node, { z: -z, '--zoom': PERSPECTIVE / (PERSPECTIVE - z) })
          }
        })
        next[i] = sectionPhase(z)
        if (next[i] !== phasesRef.current[i]) changed = true
      })
      if (changed) {
        phasesRef.current = next
        setPhases(next)
      }

      const idx = Math.min(n - 1, Math.max(0, Math.round(sceneZ / SPACING)))
      if (idx !== activeRef.current) {
        activeRef.current = idx
        const { bg, fg } = sections[idx]
        gsap.set(document.body, { '--section-bg': bg, '--section-fg': fg })
        onActiveChange?.(idx)
      }
    }

    const st = ScrollTrigger.create({
      trigger: spacerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
    })
    apply(st.progress)

    return () => st.kill()
  }, [sections, n, onActiveChange])

  useMouseParallax(() => sectionRefs.current.slice(0, n), {}, [n])

  return (
    <>
      <div
        ref={spacerRef}
        aria-hidden
        style={{ height: `calc(100vh + ${(n - 1) * SCROLL_PER_SECTION_VH}vh)` }}
      />
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ perspective: `${PERSPECTIVE}px`, pointerEvents: locked ? 'none' : 'auto' }}
      >
        <div ref={sceneRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {sections.map((section, i) => {
            const phase = ready ? phases[i] : 0
            return (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[i] = el
                }}
                className="absolute inset-0 flex items-center justify-center px-6"
                // Sin will-change: con él Chrome congela el raster del texto a 1x y se
                // pixela al crecer; sin él re-rasteriza a la escala actual y se ve nítido.
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: phase === 2 ? 'auto' : 'none',
                }}
              >
                {section.render(phase, goTo, i)}
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}
