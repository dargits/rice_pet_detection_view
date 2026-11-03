import { Detection } from '../types';
import { getClassColor } from './colors';

interface DrawOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | HTMLVideoElement;
  detections: Detection[];
  originalWidth?: number;
  originalHeight?: number;
  showLabels?: boolean;
}

/**
 * Draws detections onto an overlay canvas synced with image/video dimensions.
 */
export function drawDetections({
  canvas,
  image,
  detections,
  originalWidth,
  originalHeight,
  showLabels = true,
}: DrawOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth || image.clientWidth || 640;
  const displayHeight = canvas.clientHeight || image.clientHeight || 480;

  // Set physical canvas buffer size for sharp rendering
  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  const origW = originalWidth || (image instanceof HTMLVideoElement ? image.videoWidth : image.naturalWidth) || displayWidth;
  const origH = originalHeight || (image instanceof HTMLVideoElement ? image.videoHeight : image.naturalHeight) || displayHeight;

  const scaleX = displayWidth / origW;
  const scaleY = displayHeight / origH;

  for (const det of detections) {
    const [x1, y1, x2, y2] = det.box;
    const sx1 = x1 * scaleX;
    const sy1 = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    const color = getClassColor(det.cls_id ?? det.cls);

    // Box fill & stroke
    ctx.fillStyle = color.fill;
    ctx.fillRect(sx1, sy1, sw, sh);

    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = Math.max(2, Math.min(4, Math.round(displayWidth / 300)));
    ctx.strokeRect(sx1, sy1, sw, sh);

    if (showLabels) {
      const confPercent = (det.conf * 100).toFixed(1);
      const label = `${det.cls} ${confPercent}%`;

      const fontSize = Math.max(11, Math.min(15, Math.round(displayWidth / 45)));
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;

      const textMetrics = ctx.measureText(label);
      const paddingX = 6;
      const paddingY = 4;
      const tagWidth = textMetrics.width + paddingX * 2;
      const tagHeight = fontSize + paddingY * 2;

      // Position label above box if space permits, else inside
      let tagY = sy1 - tagHeight;
      if (tagY < 0) {
        tagY = sy1;
      }
      let tagX = sx1;
      if (tagX + tagWidth > displayWidth) {
        tagX = displayWidth - tagWidth;
      }

      // Background tag
      ctx.fillStyle = color.stroke;
      ctx.fillRect(tagX, tagY, tagWidth, tagHeight);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.fillText(label, tagX + paddingX, tagY + paddingY);
    }
  }

  ctx.restore();
}

/**
 * Creates a merged downloadable image (Original Image + Rendered Canvas Boxes).
 */
export async function exportAnnotatedImage(
  imageSource: HTMLImageElement,
  detections: Detection[]
): Promise<string> {
  const origW = imageSource.naturalWidth || 800;
  const origH = imageSource.naturalHeight || 600;

  const offscreen = document.createElement('canvas');
  offscreen.width = origW;
  offscreen.height = origH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('Không thể khởi tạo Canvas');

  // Draw original image
  ctx.drawImage(imageSource, 0, 0, origW, origH);

  // Draw detections at 1:1 scale
  for (const det of detections) {
    const [x1, y1, x2, y2] = det.box;
    const sw = x2 - x1;
    const sh = y2 - y1;
    const color = getClassColor(det.cls_id ?? det.cls);

    ctx.fillStyle = color.fill;
    ctx.fillRect(x1, y1, sw, sh);

    const lineWidth = Math.max(3, Math.round(origW / 250));
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x1, y1, sw, sh);

    const confPercent = (det.conf * 100).toFixed(1);
    const label = `${det.cls} ${confPercent}%`;
    const fontSize = Math.max(14, Math.round(origW / 40));
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    const metrics = ctx.measureText(label);
    const padX = 8;
    const padY = 5;
    const tagW = metrics.width + padX * 2;
    const tagH = fontSize + padY * 2;

    let tagY = y1 - tagH;
    if (tagY < 0) tagY = y1;
    let tagX = x1;
    if (tagX + tagW > origW) tagX = origW - tagW;

    ctx.fillStyle = color.stroke;
    ctx.fillRect(tagX, tagY, tagW, tagH);

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.fillText(label, tagX + padX, tagY + padY);
  }

  return offscreen.toDataURL('image/jpeg', 0.95);
}

