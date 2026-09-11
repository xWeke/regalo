import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)
  const curtainRef = useRef(null)
  const counterRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const obj = { value: 0 }
    const tween = gsap.to(obj, {
      value: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => setCount(Math.round(obj.value)),
      onComplete: () => setReady(true),
    })
    return () => tween.kill()
  }, [])

  useEffect(() => {
    if (!ready) return
    const tl = gsap.timeline()
    tl.to(counterRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power2.inOut' }).fromTo(
      ctaRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.2',
    )
    return () => tl.kill()
  }, [ready])

  const start = () => {
    gsap.to(curtainRef.current, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: onDone,
    })
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        ref={curtainRef}
        className="relative flex h-full w-full flex-col items-center justify-center bg-ink text-paper"
      >
        <div ref={counterRef} className="flex flex-col items-center">
          <span className="font-display text-sm tracking-[0.3em] uppercase opacity-60">
            Cargando
          </span>
          <span className="font-display text-[18vw] leading-none tabular-nums">{count}</span>
        </div>

        <button
          ref={ctaRef}
          type="button"
          onClick={start}
          data-cursor="grow"
          tabIndex={ready ? 0 : -1}
          className={`group absolute flex items-center gap-4 font-display text-3xl tracking-tight opacity-0 sm:text-5xl ${
            ready ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          Comenzar
          <span className="inline-block h-px w-10 bg-current transition-all group-hover:w-16" />
        </button>
      </div>
    </div>
  )
}
