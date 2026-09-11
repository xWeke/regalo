import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

function EyeIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-4 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12C1 12 10 2 24 2C38 2 47 12 47 12C47 12 38 22 24 22C10 22 1 12 1 12Z" />
      <circle cx="24" cy="12" r="5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  )
}

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [mode, setMode] = useState(null)
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  useEffect(() => {
    if (isTouch) return

    const dot = dotRef.current
    const ring = ringRef.current
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pos }

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: pos.x, y: pos.y })

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      gsap.to(dot, { x: pos.x, y: pos.y, duration: 0.1, ease: 'none' })
    }
    window.addEventListener('mousemove', onMove)

    const ticker = gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.15
      ringPos.y += (pos.y - ringPos.y) * 0.15
      gsap.set(ring, { x: ringPos.x, y: ringPos.y })
    })

    const bindHotspots = () => {
      const targets = document.querySelectorAll('[data-cursor]')
      const onEnter = (e) => {
        const kind = e.currentTarget.dataset.cursor
        setMode(kind)
        gsap.to(ring, { scale: kind === 'grow' ? 2.6 : 2.2, duration: 0.35, ease: 'power3.out' })
      }
      const onLeave = () => {
        setMode(null)
        gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' })
      }
      targets.forEach((el) => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
      return () => {
        targets.forEach((el) => {
          el.removeEventListener('mouseenter', onEnter)
          el.removeEventListener('mouseleave', onLeave)
        })
      }
    }

    const unbind = bindHotspots()
    let currentUnbind = unbind
    const observer = new MutationObserver(() => {
      currentUnbind()
      currentUnbind = bindHotspots()
      const under = document.elementFromPoint(pos.x, pos.y)?.closest('[data-cursor]')
      const kind = under?.dataset.cursor ?? null
      setMode(kind)
      gsap.to(ring, { scale: kind ? (kind === 'grow' ? 2.6 : 2.2) : 1, duration: 0.35, ease: 'power3.out' })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(ticker)
      currentUnbind()
      observer.disconnect()
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-1.5 w-1.5 rounded-full bg-current mix-blend-difference"
        style={{ opacity: mode ? 0 : 1 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] flex h-8 w-8 items-center justify-center rounded-full border border-current text-paper mix-blend-difference"
      >
        {mode === 'eye' && <EyeIcon />}
        {mode === 'cross' && <CrossIcon />}
      </div>
    </>
  )
}
