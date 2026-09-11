# Regalo

Web interactiva de regalo (tipo "libro" scroll-driven), reconstruida desde cero
copiando el lenguaje visual de dos referencias de Obys Agency:
https://2018.craftedbygc.com/#enter y https://peterlindbergh.obys.agency/portfolio/

## Estado actual

Efecto de scroll 3D **reescrito y funcionando en build** (pendiente de validación
visual por el usuario). Ya NO se usa pin de ScrollTrigger: toda la web es una
única escena 3D fija ([DepthStage.jsx](src/components/DepthStage.jsx)).

### Cómo funciona el túnel 3D
- `DepthStage` renderiza un `<div fixed inset-0 perspective:1000px>` con una
  `scene` (`preserve-3d`) que contiene TODAS las secciones a la vez, cada una
  en `translateZ(-i * SPACING)` (SPACING = 1600).
- Un spacer invisible en el flujo (`100vh + (n-1)*150vh`) da altura de scroll.
  Un único `ScrollTrigger` sobre el spacer mapea `progress → scene.z`, es
  decir, el scroll mueve la cámara hacia el fondo. Lenis suaviza el scroll;
  no hace falta `scrub` ni `scrollerProxy`.
- Por frame se calcula la z de cada sección respecto a la cámara. La sección hace
  fade-in desde el fondo y NO se funde al acercarse: el título sigue creciendo hasta
  llenar la pantalla. Cada elemento con profundidad (`[data-dolly]` y cada `[data-photo]`
  con su `data-depth`) se oculta de golpe (sin fundido, decisión del usuario) cuando su z efectiva
  supera 0.97·P (`NEAR_CUT`), justo antes de cruzar el plano de perspectiva; la sección
  se oculta cuando su foto más cercana también lo ha cruzado (`SECTION_END`) y una `phase`: 0 fuera de rango · 1 acercándose (aparecen fotos) ·
  2 protagonista (aparece título). Las phases solo provocan re-render cuando
  cambian.
- Las fotos del collage tienen `translateZ(depth * 380)` fijo: el paralaje Z
  sale solo del movimiento de la cámara. Además tienen un bob vertical
  infinito sutil.
- Los textos (`RevealText`/`useSplitReveal`) ya no usan ScrollTrigger: se
  animan con play/reverse según `active` (phase === 2). Dentro de una escena
  fija las posiciones de layout no sirven para disparar nada.
- El tema de color por sección (`--section-bg/--section-fg` en body) se
  aplica desde el mismo `onUpdate` según la sección más cercana.
- `ready` (preloader terminado) fuerza phase 0 en todo, y Lenis está
  `stop()` hasta que el preloader acaba.

- Paralaje de ratón ([useMouseParallax.js](src/hooks/useMouseParallax.js)): los targets se
  trasladan en X/Y en sentido contrario al cursor (`PAN_X` 14 %, `PAN_Y` 22 % del viewport)
  y se inclinan (`TILT_X` 8°, `TILT_Y` 12°; el lado del cursor se aleja) con `gsap.quickTo`.
  Lo usan `DepthStage` (cada `section`, strength 1) y `Lightbox` (envoltorio de foto+texto,
  strength 0.6 — nunca la figura, que la mueve el FLIP). Desactivado en táctil.

### Reglas para no romper el 3D
- El texto NO se escala con la perspectiva (Chrome lo rasteriza a tamaño limitado y se
  pixela): `DepthStage` mantiene cada `[data-dolly]` a z efectiva 0 (`z: -z`) y le fija
  `--zoom = P/(P-z)`; Hero/Chapter multiplican sus `font-size` por `var(--zoom)`. Los
  márgenes internos van en `em` para que escalen con el texto. Tampoco `will-change`.
- Los títulos son SIEMPRE de una línea: `lib/fitTitle.js` calcula el tamaño base según el
  nº de caracteres (≤ 90 vw) y llevan `whitespace-nowrap`.
- Ningún ancestro de las fotos puede tener `overflow` distinto de `visible`
  (aplana el `preserve-3d`). Solo el stage raíz tiene `overflow-hidden`.
- No usar `pin` de ScrollTrigger ni triggers por elemento dentro del stage.
- Estados de entrada/salida se controlan por `phase`, no por scroll.

## Stack

- React 19 + Vite
- Tailwind CSS v4 — sin `tailwind.config.js`: tema en `@theme` de
  [src/index.css](src/index.css); plugin `@tailwindcss/vite` en
  [vite.config.js](vite.config.js)
- **Lenis** — smooth scroll con inercia ([useLenis.js](src/hooks/useLenis.js)),
  integrado con GSAP ticker
- **GSAP + ScrollTrigger** — toda la animación de scroll
- Google Fonts en [index.html](index.html): **Fraunces** (serif display,
  `--font-display`) y **Inter** (`--font-sans`)
- Paleta: NO es dorado/sand como la v1 vieja — ahora es **blanco/negro
  editorial base** (`--color-ink` #0a0a0a, `--color-paper` #f5f3ef), pero
  cada capítulo **sobreescribe el fondo/texto real** vía custom properties
  `--section-bg`/`--section-fg` en `document.body` (las aplica `DepthStage` en su `onUpdate`)

## Estructura

```
src/
├── data/story.js            # hero + chapters: id, title, content, bg, fg, labelLeft/Right, photos[]
├── components/
│   ├── DepthStage.jsx          # escena 3D fija + spacer + ScrollTrigger único (ver arriba)
│   ├── Hero.jsx                 # portada; recibe phase y onNext (goTo(1))
│   ├── Chapter.jsx               # capítulo; recibe phase
│   ├── PhotoCollage.jsx           # fotos (button) con translateZ por depth, tinte duotono del color de sección, onOpen
│   ├── Lightbox.jsx                # foto abierta: la PROPIA miniatura crece dentro de su sección (x/y/scale, z→1, rotation→0, tinte fuera) — sin relevo con otra capa, hereda el paneo; [data-dolly] y otras fotos vuelan +900 en Z; esta capa solo pone texto + click/Esc cierra (progress→0)
│   ├── RevealText.jsx              # texto por palabras; prop active
│   ├── Header.jsx                   # fijo: marca + botón "Volver al inicio" (visible si active>0 y sin foto abierta; lenis.scrollTo(0) con duración según distancia)
│   ├── SideLabels.jsx                # barras verticales fijas; App pasa labels de la sección activa
│   ├── Cursor.jsx                     # cursor custom, estados via data-cursor="eye|cross|grow"
│   └── Preloader.jsx                   # contador 0→100, luego botón "Comenzar"; la cortina solo sube al pulsarlo
└── hooks/
    ├── useLenis.js              # smooth scroll + getLenis() para scrollTo/stop/start
    ├── useMouseParallax.js       # paneo + inclinación por ratón (ver arriba)
    └── useSplitReveal.js         # split por palabras; timeline paused + play/reverse por active
```

`App.jsx` construye `sections = [hero, ...chapters]` con un `render(phase, goTo)`
cada una y monta Preloader, Cursor, Header, SideLabels y `DepthStage`.

## Convenciones

- Todo el contenido va en [src/data/story.js](src/data/story.js), no
  hardcodeado en componentes.
- Forma de `hero`: `{ id, kicker, title, subtitle, bg, fg, labelLeft, labelRight, photos }`.
- Forma de cada capítulo en `chapters`:
  `{ id, title, content, bg, fg, labelLeft, labelRight, photos: [{ src, caption, description, top, left, width, rotate, ratio, depth }] }`.
  - `caption` es el texto grande al abrir la foto; `description` (opcional) el párrafo debajo.
  - `photos[].depth` en [-1, 1]: 1 = pegado a la cámara (pasa rápido), -1 = al fondo
    (casi quieto). Se traduce a `translateZ(depth * 380)` en `PhotoCollage.jsx`.
  - `photo.src === null` → placeholder "Foto pendiente".
- `RevealText` anima el texto palabra a palabra cuando `active` pasa a true y lo
  revierte al pasar a false; acepta `delay`/`stagger`.
- Cursor: cualquier elemento con `data-cursor="eye" | "cross" | "grow"`
  activa el estado correspondiente del cursor custom (ver `Cursor.jsx`,
  usa `MutationObserver` para re-bindear hotspots añadidos dinámicamente).

## Pendiente

1. Validar visualmente el túnel y ajustar constantes en `DepthStage.jsx`
   (`SPACING`, `SCROLL_PER_SECTION_VH`, rangos de fade) y `DEPTH_UNIT` en
   `PhotoCollage.jsx` según sensación.
2. Contenido real: todas las fotos son `null` (placeholder); textos de ejemplo.
3. Solo hay portada + 2 capítulos; falta la historia completa.
4. ~~Click en foto → pantalla completa~~ hecho (`Lightbox.jsx`). Mientras está abierta,
   `DepthStage` recibe `locked` (solo bloquea pointer events, la escena sigue visible) y Lenis se para.

## Limitaciones del entorno (para quien continúe)

- Este entorno (Windows, sesión Claude Code) **no tiene navegador headless
  disponible** (`chromium-cli` no instalado) — no se puede tomar capturas de
  pantalla del propio proyecto ni renderizar JS de sitios externos vía
  WebFetch (WebFetch no ejecuta JS, solo trae HTML crudo).
- Para revisar las webs de referencia se instaló **ffmpeg vía winget**
  (`Gyan.FFmpeg`, ahora en PATH tras reiniciar shell) y se extrajeron
  fotogramas de un vídeo grabado por el usuario con
  `ffmpeg -i video.mp4 -vf fps=1/3 frame_%02d.png` — este es el método a
  repetir si el usuario aporta más vídeos de referencia.
- `npm`/`node` no estaban en el PATH de PowerShell por defecto en esta
  sesión; hay que anteponer `$env:Path += ";C:\Program Files\nodejs"` o usar
  la ruta completa.
- El proyecto viejo (dorado/sand, capítulos con Leaflet/mapa, sin efecto 3D)
  se conserva intacto en `../Regalo_OLD/` (sin `node_modules`, reinstalar con
  `npm install` si se quiere levantar) — no está borrado, solo apartado.

## Comandos

```
npm run dev       # servidor de desarrollo (localhost:5173)
npm run build     # build de producción
npm run preview   # sirve el build
npm run lint      # oxlint
```
