import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLenis, getLenis } from './hooks/useLenis'
import Cursor from './components/Cursor'
import Preloader from './components/Preloader'
import Header from './components/Header'
import SideLabels from './components/SideLabels'
import DepthStage from './components/DepthStage'
import Lightbox from './components/Lightbox'
import Hero from './components/Hero'
import Chapter from './components/Chapter'
import { hero, chapters } from './data/story'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(0)
  const [openPhoto, setOpenPhoto] = useState(null)
  useLenis()

  useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    if (loaded && !openPhoto) lenis.start()
    else lenis.stop()
  }, [loaded, openPhoto])

  const onPreloaderDone = useCallback(() => setLoaded(true), [])
  const closePhoto = useCallback(() => setOpenPhoto(null), [])
  const goHome = useCallback(() => {
    const lenis = getLenis()
    // Más lejos → recorrido más largo, para que se vea todo el túnel hacia atrás.
    const duration = Math.min(6, 1.6 + active * 1.2)
    if (lenis) lenis.scrollTo(0, { duration })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [active])
  const openFromThumb = useCallback((photo, el) => setOpenPhoto({ photo, el }), [])

  const sections = useMemo(
    () => [
      {
        ...hero,
        render: (phase, goTo) => (
          <Hero phase={phase} onNext={() => goTo(1)} onOpen={openFromThumb} />
        ),
      },
      ...chapters.map((chapter) => ({
        ...chapter,
        render: (phase) => <Chapter chapter={chapter} phase={phase} onOpen={openFromThumb} />,
      })),
    ],
    [openFromThumb],
  )

  const current = sections[active]

  return (
    <>
      {!loaded && <Preloader onDone={onPreloaderDone} />}
      <Cursor />
      <Header backVisible={active > 0 && !openPhoto} onBack={goHome} />
      <SideLabels left={current.labelLeft} right={current.labelRight} />
      <DepthStage
        sections={sections}
        ready={loaded}
        locked={Boolean(openPhoto)}
        onActiveChange={setActive}
      />
      {openPhoto && (
        <Lightbox photo={openPhoto.photo} originEl={openPhoto.el} onClose={closePhoto} />
      )}
    </>
  )
}

export default App
