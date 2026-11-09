import { Detection } from '../types';
import { getClassColor } from './colors';

export interface DrawOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | HTMLVideoElement;
  detections: Detection[];
  originalWidth?: number;
  originalHeight?: number;
  showLabels?: boolean;
  showConfidence?: boolean;
  filterClass?: string; // 'all' or specific class key/name
  highlightIndex?: number | null;
  hoverIndex?: number | null;
  getLabel?: (det: Detection) => string;
}

/**
 * Draws detections onto an overlay canvas synced with image/video dimensions.
 * Includes interactive highlight, class filtering, and corner brackets.
 */
export function drawDetections({
  canvas,
  image,
  detections,
  originalWidth,
  originalHeight,
  showLabels = true,
  showConfidence = true,
  filterClass = 'all',
  highlightIndex = null,
  hoverIndex = null,
  getLabel,
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

  detections.forEach((det, idx) => {
    // Class filter check
    const isFilteredOut = filterClass !== 'all' && det.cls !== filterClass && String(det.cls_id) !== filterClass;
    const isHighlighted = highlightIndex === idx;
    const isHovered = hoverIndex === idx;

    const [x1, y1, x2, y2] = det.box;
    const sx1 = x1 * scaleX;
    const sy1 = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    const color = getClassColor(det.cls_id ?? det.cls);

    ctx.save();

    if (isFilteredOut) {
      // Dim out irrelevant boxes
      ctx.globalAlpha = 0.15;
    } else if (isHighlighted || isHovered) {
      ctx.shadowColor = color.stroke;
      ctx.shadowBlur = 12;
    }

    // Box fill
    ctx.fillStyle = isHighlighted || isHovered ? color.fill.replace('0.2', '0.35') : color.fill;
    ctx.fillRect(sx1, sy1, sw, sh);

    // Box stroke
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = isHighlighted || isHovered
      ? Math.max(3, Math.min(5, Math.round(displayWidth / 220)))
      : Math.max(2, Math.min(3.5, Math.round(displayWidth / 320)));
    ctx.strokeRect(sx1, sy1, sw, sh);

    // Corner Accents for high-tech look
    const cornerSize = Math.max(6, Math.min(14, Math.round(sw * 0.18)));
    ctx.lineWidth = ctx.lineWidth * 1.5;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(sx1, sy1 + cornerSize);
    ctx.lineTo(sx1, sy1);
    ctx.lineTo(sx1 + cornerSize, sy1);
    // Top-right
    ctx.moveTo(sx1 + sw - cornerSize, sy1);
    ctx.lineTo(sx1 + sw, sy1);
    ctx.lineTo(sx1 + sw, sy1 + cornerSize);
    // Bottom-left
    ctx.moveTo(sx1, sy1 + sh - cornerSize);
    ctx.lineTo(sx1, sy1 + sh);
    ctx.lineTo(sx1 + cornerSize, sy1 + sh);
    // Bottom-right
    ctx.moveTo(sx1 + sw - cornerSize, sy1 + sh);
    ctx.lineTo(sx1 + sw, sy1 + sh);
    ctx.lineTo(sx1 + sw, sy1 + sh - cornerSize);
    ctx.stroke();

    // Labels
    if (showLabels && !isFilteredOut) {
      const confPercent = (det.conf * 100).toFixed(1);
      const name = getLabel ? getLabel(det) : det.cls;
      const label = showConfidence ? `${name} ${confPercent}%` : name;

      const fontSize = Math.max(10, Math.min(14, Math.round(displayWidth / 48)));
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;

      const textMetrics = ctx.measureText(label);
      const paddingX = 7;
      const paddingY = 4;
      const tagWidth = textMetrics.width + paddingX * 2;
      const tagHeight = fontSize + paddingY * 2;

      let tagY = sy1 - tagHeight;
      if (tagY < 0) {
        tagY = sy1;
      }
      let tagX = sx1;
      if (tagX + tagWidth > displayWidth) {
        tagX = displayWidth - tagWidth;
      }

      // Background tag with rounded corners
      ctx.fillStyle = color.stroke;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4) : ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, tagX + paddingX, tagY + tagHeight / 2);
    }

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Finds index of detection box containing (x, y) coordinates on the display canvas
 */
export function findDetectionAtPoint(
  x: number,
  y: number,
  detections: Detection[],
  displayWidth: number,
  displayHeight: number,
  originalWidth: number,
  originalHeight: number
): number | null {
  const scaleX = displayWidth / originalWidth;
  const scaleY = displayHeight / originalHeight;

  // Search in reverse order to hit uppermost box
  for (let i = detections.length - 1; i >= 0; i--) {
    const [x1, y1, x2, y2] = detections[i].box;
    const sx1 = x1 * scaleX;
    const sy1 = y1 * scaleY;
    const sx2 = x2 * scaleX;
    const sy2 = y2 * scaleY;

    if (x >= sx1 && x <= sx2 && y >= sy1 && y <= sy2) {
      return i;
    }
  }
  return null;
}

/**
 * Creates a high-resolution downloadable image (Original Image + Rendered Canvas Boxes).
 */
export async function exportAnnotatedImage(
  imageSource: HTMLImageElement,
  detections: Detection[],
  getLabel?: (det: Detection) => string
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

    // Corner notches
    const corner = Math.min(20, sw * 0.2);
    ctx.lineWidth = lineWidth * 1.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + corner);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + corner, y1);
    ctx.moveTo(x1 + sw - corner, y1);
    ctx.lineTo(x1 + sw, y1);
    ctx.lineTo(x1 + sw, y1 + corner);
    ctx.stroke();

    const confPercent = (det.conf * 100).toFixed(1);
    const name = getLabel ? getLabel(det) : det.cls;
    const label = `${name} ${confPercent}%`;
    const fontSize = Math.max(14, Math.round(origW / 45));
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    const metrics = ctx.measureText(label);
    const padX = 10;
    const padY = 6;
    const tagW = metrics.width + padX * 2;
    const tagH = fontSize + padY * 2;

    let tagY = y1 - tagH;
    if (tagY < 0) tagY = y1;
    let tagX = x1;
    if (tagX + tagW > origW) tagX = origW - tagW;

    ctx.fillStyle = color.stroke;
    ctx.fillRect(tagX, tagY, tagW, tagH);

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, tagX + padX, tagY + tagH / 2);
  }

  return offscreen.toDataURL('image/jpeg', 0.95);
}

/**
 * Generates an executive Agricultural Inspection Certificate / Report Image
 * with branded metadata banner, date, pest summary stats, and watermarks.
 */
export async function exportExecutiveInspectionReport(
  imageSource: HTMLImageElement,
  detections: Detection[],
  filename: string,
  inferenceMs: number,
  conf: number,
  getLabel?: (det: Detection) => string
): Promise<string> {
  const origW = imageSource.naturalWidth || 1200;
  const origH = imageSource.naturalHeight || 900;

  // Add header & footer banner margins
  const headerH = Math.round(origH * 0.12);
  const footerH = Math.round(origH * 0.08);

  const canvas = document.createElement('canvas');
  canvas.width = origW;
  canvas.height = origH + headerH + footerH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas init failed');

  // Background
  ctx.fillStyle = '#0f172a'; // Deep slate
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top Branded Header
  ctx.fillStyle = '#10b981'; // Emerald accent bar
  ctx.fillRect(0, 0, canvas.width, 6);

  // Header Title
  const titleSize = Math.max(18, Math.round(origW / 35));
  ctx.font = `bold ${titleSize}px Inter, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.fillText('RICE PEST AI - BÁO CÁO GIÁM SÁT DỊCH HẠI LÚA (YOLOv11)', 24, 20);

  // Header Subtitle & Metadata
  const subSize = Math.max(12, Math.round(origW / 65));
  ctx.font = `500 ${subSize}px Inter, sans-serif`;
  ctx.fillStyle = '#94a3b8';
  const metaText = `Tệp: ${filename} | Thời gian: ${new Date().toLocaleString('vi-VN')} | Độ trễ suy luận: ${inferenceMs}ms | Ngưỡng Conf: ${conf}`;
  ctx.fillText(metaText, 24, 20 + titleSize + 8);

  // Draw annotated image in center
  ctx.drawImage(imageSource, 0, headerH, origW, origH);

  // Draw boxes over image
  for (const det of detections) {
    const [x1, y1, x2, y2] = det.box;
    const dy1 = y1 + headerH;
    const dy2 = y2 + headerH;
    const sw = x2 - x1;
    const sh = dy2 - dy1;
    const color = getClassColor(det.cls_id ?? det.cls);

    ctx.fillStyle = color.fill;
    ctx.fillRect(x1, dy1, sw, sh);

    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = Math.max(3, Math.round(origW / 260));
    ctx.strokeRect(x1, dy1, sw, sh);

    const name = getLabel ? getLabel(det) : det.cls;
    const label = `${name} ${(det.conf * 100).toFixed(1)}%`;
    const fontSize = Math.max(13, Math.round(origW / 48));
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    const metrics = ctx.measureText(label);
    const padX = 8;
    const padY = 5;
    const tagW = metrics.width + padX * 2;
    const tagH = fontSize + padY * 2;

    let tagY = dy1 - tagH;
    if (tagY < headerH) tagY = dy1;
    let tagX = x1;
    if (tagX + tagW > origW) tagX = origW - tagW;

    ctx.fillStyle = color.stroke;
    ctx.fillRect(tagX, tagY, tagW, tagH);

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, tagX + padX, tagY + tagH / 2);
  }

  // Footer Summary Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, origH + headerH, origW, footerH);

  // Species breakdown counts
  const counts: Record<string, number> = {};
  detections.forEach((d) => {
    const n = getLabel ? getLabel(d) : d.cls;
    counts[n] = (counts[n] || 0) + 1;
  });

  const countStr = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('  •  ') || 'Không phát hiện sâu hại';
  ctx.font = `600 ${subSize}px Inter, sans-serif`;
  ctx.fillStyle = '#4ade80';
  ctx.textBaseline = 'middle';
  ctx.fillText(`KẾT QUẢ: Tổng số ${detections.length} đối tượng  [ ${countStr} ]`, 24, origH + headerH + footerH / 2);

  return canvas.toDataURL('image/jpeg', 0.95);
}
