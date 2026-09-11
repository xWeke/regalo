import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Envuelve cada palabra en un span con máscara y expone play/reverse según `active`.
// No usa ScrollTrigger: dentro de la escena 3D fija las posiciones de layout no
// significan nada, así que el estado activo lo decide DepthStage.
export function useSplitReveal(ref, { active = false, stagger = 0.03, delay = 0 } = {}) {
  const tlRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const original = el.innerHTML
    const words = el.textContent.split(/(\s+)/).filter((w) => w.length > 0)
    el.innerHTML = ''
    const spans = words
      .map((word) => {
        if (/^\s+$/.test(word)) {
          el.appendChild(document.createTextNode(word))
          return null
        }
        const outer = document.createElement('span')
        outer.style.display = 'inline-block'
        outer.style.overflow = 'hidden'
        outer.style.verticalAlign = 'top'
        const inner = document.createElement('span')
        inner.style.display = 'inline-block'
        inner.textContent = word
        outer.appendChild(inner)
        el.appendChild(outer)
        return inner
      })
      .filter(Boolean)

    const tl = gsap.timeline({ paused: true })
    tl.fromTo(
      spans,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger },
      delay,
    )
    tlRef.current = tl

    return () => {
      tl.kill()
      tlRef.current = null
      el.innerHTML = original
    }
  }, [ref, stagger, delay])

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (active) tl.play()
    else tl.reverse()
  }, [active])
}
