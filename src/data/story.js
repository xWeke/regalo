// Fotos: src son placeholders de picsum.photos hasta tener las reales (ratio 4/3 = 1200x900).
// caption es el texto grande al abrir la foto; description (opcional) el párrafo debajo.
// top/left/width posicionan la tarjeta dentro de la pantalla; rotate en grados;
// depth entre -1 (al fondo, casi quieta) y 1 (muy cerca de la cámara, pasa rápido).
export const hero = {
  id: 'portada',
  kicker: 'Para ti',
  title: 'Muchas felicidades',
  subtitle: 'Baja para empezar',
  bg: '#3f7566',
  fg: '#e9c88f',
  labelLeft: 'Una mirada atrás',
  labelRight: 'Un momento para recordar',
  photos: [],
}

export const chapters = [
  {
    id: 'capitulo-1',
    title: 'La dedicatoria',
    content: 'Aquí irá la dedicatoria...',
    bg: '#12211f',
    fg: '#f0725a',
    labelLeft: 'Una mirada atrás',
    labelRight: 'Un momento para recordar',
    photos: [
      { src: 'https://picsum.photos/seed/cena/1200/900', caption: 'Foto 1', top: '8%', left: '10%', width: '18vw', rotate: -4, depth: 0.7 },
      { src: 'https://picsum.photos/seed/montana/1200/900', caption: 'Foto 2', top: '55%', left: '68%', width: '16vw', rotate: 3, depth: -0.6 },
      { src: 'https://picsum.photos/seed/ciudad/1200/900', caption: 'Foto 3', top: '64%', left: '22%', width: '12vw', rotate: 5, depth: 0.2 },
    ],
  },
  {
    id: 'capitulo-2',
    title: 'Nuestra primera foto',
    content: 'Mojácar, Almería',
    bg: '#e8dccb',
    fg: '#1d2a44',
    labelLeft: 'Una mirada atrás',
    labelRight: 'Un momento para recordar',
    photos: [
      {
        src: 'https://picsum.photos/seed/risa/1200/900',
        caption: 'Foto 4',
        description: 'Texto opcional que aparece bajo la foto al abrirla.',
        top: '10%',
        left: '14%',
        width: '20vw',
        rotate: -3,
        depth: 0.5,
      },
      { src: 'https://picsum.photos/seed/viaje/1200/900', caption: 'Foto 5', top: '58%', left: '62%', width: '17vw', rotate: 5, depth: -0.8 },
      { src: 'https://picsum.photos/seed/mar/1200/900', caption: 'Foto 6', top: '14%', left: '66%', width: '12vw', rotate: -6, depth: 0.95 },
    ],
  },
]
