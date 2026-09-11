import RevealText from './RevealText'
import PhotoCollage from './PhotoCollage'
import { hero } from '../data/story'
import { fitTitle } from '../lib/fitTitle'

// Los tamaños de texto se multiplican por --zoom (lo fija DepthStage por frame)
// en lugar de escalarse con la perspectiva, para que las letras sigan nítidas.
export default function Hero({ phase, onNext, onOpen }) {
  const active = phase === 2

  return (
    <div
      className="relative flex h-full w-full items-center justify-center text-center"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {hero.photos?.length > 0 && (
        <PhotoCollage photos={hero.photos} phase={phase} onOpen={onOpen} />
      )}

      <div
        data-dolly
        className="relative flex flex-col items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <span
          className={`font-sans tracking-[0.4em] uppercase transition-opacity duration-1000 ${
            active ? 'opacity-60' : 'opacity-0'
          }`}
          style={{ fontSize: 'calc(0.75rem * var(--zoom, 1))', marginBottom: '2em' }}
        >
          {hero.kicker}
        </span>

        <RevealText
          as="h1"
          active={active}
          delay={0.15}
          className="font-display leading-[0.9] font-normal tracking-tight whitespace-nowrap"
          style={{ fontSize: fitTitle(hero.title, 'clamp(3.5rem, 9.5vw, 12rem)') }}
        >
          {hero.title}
        </RevealText>

        <button
          type="button"
          onClick={onNext}
          data-cursor="grow"
          className={`group flex items-center gap-3 font-sans uppercase tracking-[0.3em] transition-opacity delay-700 duration-1000 hover:opacity-100 ${
            active ? 'opacity-60' : 'opacity-0'
          }`}
          style={{ fontSize: 'calc(0.75rem * var(--zoom, 1))', marginTop: '5em' }}
        >
          {hero.subtitle}
          <span className="inline-block h-px w-8 bg-current transition-all group-hover:w-12" />
        </button>
      </div>
    </div>
  )
}
