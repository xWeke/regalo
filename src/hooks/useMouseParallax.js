import { useEffect } from 'react'
import { gsap } from 'gsap'

// Desplazamiento máximo (fracción del viewport) e inclinación máxima (grados).
export const PAN_X = 0.14
export const PAN_Y = 0.22
export const TILT_X = 8
export const TILT_Y = 12

// Paralaje de ratón: los targets se desplazan en sentido contrario al cursor y se
// inclinan de modo que el lado del cursor se aleja. `strength` escala todo el efecto.
export function useMouseParallax(getTargets, { strength = 1 } = {}, deps = []) {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const els = getTargets().filter(Boolean)
    if (!els.length) return

    const opts = { duration: 1.1, ease: 'power2.out' }
    const toX = gsap.quickTo(els, 'x', opts)
    const toY = gsap.quickTo(els, 'y', opts)
    const rotX = gsap.quickTo(els, 'rotationX', opts)
    const rotY = gsap.quickTo(els, 'rotationY', opts)

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      toX(-nx * PAN_X * window.innerWidth * strength)
      toY(-ny * PAN_Y * window.innerHeight * strength)
      rotY(nx * TILT_Y * strength)
      rotX(-ny * TILT_X * strength)
    }
    // No se recentra al salir del documento: en Windows "salir" incluye rozar la
    // barra de scroll o el borde de la ventana y provocaba rebotes. Solo al perder el foco.
    const onBlur = () => {
      toX(0)
      toY(0)
      rotX(0)
      rotY(0)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('blur', onBlur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
