// Tamaño de fuente que cabe en una sola línea dentro del 90 % del ancho de pantalla,
// sin superar el tamaño preferido. Se multiplica por --zoom (DepthStage) para crecer.
export function fitTitle(text, preferred) {
  const chars = Math.max(1, text.length) * 0.52
  return `calc(min(${preferred}, 90vw / ${chars.toFixed(2)}) * var(--zoom, 1))`
}
