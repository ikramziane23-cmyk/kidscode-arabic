// Keep the original image in the scene; only its display bounds are scaled.
export function centeredImageBounds(
  image: { width: number; height: number },
  viewport: { width: number; height: number },
  zoom: number,
  pan: { x: number; y: number },
) {
  const scale = Math.min(viewport.width * 0.7 / image.width, viewport.height * 0.65 / image.height, 1) / zoom;
  const w = image.width * scale;
  const h = image.height * scale;
  return { w, h, x: (viewport.width / 2 - pan.x) / zoom - w / 2, y: (viewport.height / 2 - pan.y) / zoom - h / 2 };
}