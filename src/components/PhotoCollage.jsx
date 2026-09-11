import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Separación en Z entre la foto más lejana (depth -1) y la más cercana (depth 1).
export const DEPTH_UNIT = 380

export default function PhotoCollage({ photos, phase, onOpen }) {
  const rootRef = useRef(null)
  const tlRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll('[data-photo]'))

    const floats = items.map((el, i) => {
      const photo = photos[i]
      gsap.set(el, {
        z: (photo.depth ?? 0) * DEPTH_UNIT,
        rotation: photo.rotate ?? 0,
        transformStyle: 'preserve-3d',
      })
      return gsap.to(el, {
        y: `+=${10 + (i % 3) * 6}`,
        duration: 3.2 + i * 0.7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    })

    const tl = gsap.timeline({ paused: true })
    tl.fromTo(
      items,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12 },
    )
    tlRef.current = tl

    return () => {
      tl.kill()
      floats.forEach((f) => f.kill())
      tlRef.current = null
    }
  }, [photos])

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (phase >= 1) tl.play()
    else tl.reverse()
  }, [phase])

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {photos.map((photo, i) => (
        <button
          key={i}
          type="button"
          data-photo
          data-depth={photo.depth ?? 0}
          data-cursor="eye"
          onClick={(e) => onOpen?.(photo, e.currentTarget)}
          className="group pointer-events-auto absolute border-0 p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]"
          style={{
            top: photo.top,
            left: photo.left,
            width: photo.width,
            aspectRatio: photo.ratio ?? '4 / 3',
            backfaceVisibility: 'hidden',
          }}
        >
          {photo.src ? (
            <span className="relative block h-full w-full overflow-hidden">
              <img
                src={photo.src}
                alt={photo.caption ?? ''}
                className="h-full w-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
              />
              <span
                aria-hidden
                data-tint
                className="absolute inset-0 opacity-85 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
                style={{ background: 'var(--section-bg)' }}
              />
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-stone-200">
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.25em] opacity-40">
                Foto pendiente
              </span>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
