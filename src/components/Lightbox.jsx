import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useMouseParallax } from '../hooks/useMouseParallax'

const DOLLY_Z = 900
const FLIGHT = 1.1
const RETURN = 1.5
const MAX_W = 0.7 // fracción del ancho de pantalla
const MAX_H = 0.62 // fracción del alto (deja sitio al texto)

// No hay relevo entre miniatura y foto grande: la propia miniatura crece dentro de
// su sección (así hereda el mismo paneo/inclinación del ratón y nunca "salta").
// El resto de la sección (título, otras fotos) vuela hacia la cámara y se disuelve.
// Esta capa solo pone el texto y captura el click de cierre.
export default function Lightbox({ photo, originEl, onClose }) {
  const textRef = useRef(null)
  const parallaxRef = useRef(null)
  const tlRef = useRef(null)
  const stateRef = useRef(null)
  const closingRef = useRef(false)

  useMouseParallax(() => [parallaxRef.current], { strength: 0.6 })

  useEffect(() => {
    if (!originEl) return
    const ctx = gsap.context(() => {
      const section = originEl.closest('section')
      const others = Array.from(section.querySelectorAll('[data-dolly], [data-photo]')).filter(
        (el) => el !== originEl,
      )
      const img = originEl.querySelector('img')
      const tint = originEl.querySelector('[data-tint]')

      // Geometría en el espacio de la sección (sin transforms): el contenedor del
      // collage ocupa la pantalla entera, así que su centro es el centro de pantalla.
      const box = originEl.offsetParent
      const w = originEl.offsetWidth
      const h = originEl.offsetHeight
      const targetW = Math.min(box.offsetWidth * MAX_W, (box.offsetHeight * MAX_H * w) / h)
      const targetH = (targetW * h) / w
      // Se anima el ancho real (no scale): así la imagen se pinta a resolución
      // completa al crecer en vez de estirar el bitmap de la miniatura. Como el
      // ancho crece desde la esquina superior izquierda, se compensa el centro.
      const dx = box.offsetWidth / 2 - (originEl.offsetLeft + w / 2) - (targetW - w) / 2
      const dy =
        box.offsetHeight / 2 -
        (originEl.offsetTop + h / 2) -
        (targetH - h) / 2 -
        box.offsetHeight * 0.06

      gsap.getTweensOf(originEl).forEach((t) => t.pause())

      stateRef.current = {
        others,
        img,
        tint,
        photo: {
          x: gsap.getProperty(originEl, 'x'),
          y: gsap.getProperty(originEl, 'y'),
          z: gsap.getProperty(originEl, 'z'),
          rotation: gsap.getProperty(originEl, 'rotation'),
          width: originEl.style.width,
        },
        othersZ: others.map((el) => gsap.getProperty(el, 'z')),
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      tl.to(others, { z: `+=${DOLLY_Z}`, duration: 1.2, ease: 'power2.in' }, 0)
      tl.to(others, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 0)
      tl.to(originEl, { x: dx, y: dy, z: 1, rotation: 0, width: targetW, duration: FLIGHT }, 0)
      if (tint) tl.to(tint, { opacity: 0, duration: 0.6 }, 0.2)
      if (img) tl.to(img, { filter: 'grayscale(0)', duration: 0.6 }, 0.2)
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.8,
      )
      tlRef.current = tl
    })

    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      ctx.revert()
      gsap.getTweensOf(originEl).forEach((t) => t.resume())
      tlRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, originEl])

  // Cierre con su propia coreografía: la foto empieza a volver en el mismo instante
  // del click (nada de rebobinar el texto primero) y dura RETURN de verdad.
  const close = () => {
    const tl = tlRef.current
    const st = stateRef.current
    if (!tl || !st || closingRef.current) return
    closingRef.current = true
    tl.kill()

    const out = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: onClose })
    out.to(textRef.current, { opacity: 0, y: 8, duration: 0.3, ease: 'power1.in' }, 0)
    out.to(originEl, { ...st.photo, duration: RETURN }, 0)
    if (st.tint) out.to(st.tint, { opacity: 0.85, duration: RETURN * 0.5 }, RETURN * 0.35)
    if (st.img) out.to(st.img, { filter: 'grayscale(1)', duration: RETURN * 0.5 }, RETURN * 0.35)
    st.others.forEach((el, i) => {
      out.to(el, { z: st.othersZ[i], duration: RETURN, ease: 'power2.out' }, 0)
      out.to(el, { opacity: 1, duration: RETURN * 0.6 }, RETURN * 0.3)
    })
  }

  return (
    <div
      data-cursor="cross"
      onClick={close}
      className="fixed inset-0 z-30 flex items-end justify-center px-6 pb-[6vh]"
      style={{ color: 'var(--section-fg)', perspective: '1000px' }}
    >
      <div ref={parallaxRef} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
        <div ref={textRef} className="flex flex-col items-center gap-3 text-center opacity-0">
          {photo.caption && (
            <p className="font-display text-2xl leading-tight sm:text-4xl md:text-5xl">
              {photo.caption}
            </p>
          )}
          {photo.description && (
            <p className="max-w-xl font-sans text-sm leading-relaxed opacity-70">
              {photo.description}
            </p>
          )}
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
            Cerrar
          </span>
        </div>
      </div>
    </div>
  )
}
