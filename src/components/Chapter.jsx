import RevealText from './RevealText'
import PhotoCollage from './PhotoCollage'
import { fitTitle } from '../lib/fitTitle'

// Los tamaños de texto se multiplican por --zoom (lo fija DepthStage por frame)
// en lugar de escalarse con la perspectiva, para que las letras sigan nítidas.
export default function Chapter({ chapter, phase, onOpen }) {
  const active = phase === 2

  return (
    <div
      className="relative flex h-full w-full items-center justify-center text-center"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {chapter.photos && <PhotoCollage photos={chapter.photos} phase={phase} onOpen={onOpen} />}

      <div
        data-dolly
        className="pointer-events-none relative mx-auto flex flex-col items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <RevealText
          as="h2"
          active={active}
          className="font-display leading-[0.9] font-normal tracking-tight whitespace-nowrap"
          style={{ fontSize: fitTitle(chapter.title, 'clamp(3rem, 7.5vw, 10rem)') }}
        >
          {chapter.title}
        </RevealText>
        {chapter.content && (
          <RevealText
            as="p"
            active={active}
            delay={0.35}
            className="font-display italic opacity-80"
            style={{
              fontSize: 'calc(clamp(1.1rem, 1.5vw, 1.6rem) * var(--zoom, 1))',
              marginTop: '1em',
            }}
          >
            {chapter.content}
          </RevealText>
        )}
      </div>
    </div>
  )
}
