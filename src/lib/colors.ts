// Color palette for pest classes
// Ensures identical colors across Canvas boxes, Badges, Tables, and Recharts

const CLASS_PALETTE = [
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' }, // Emerald
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },     // Amber
  { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },         // Red
  { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },         // Blue
  { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },   // Purple
  { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.2)', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30' },       // Pink
  { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.2)', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },         // Cyan
  { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.2)', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },   // Orange
  { stroke: '#84cc16', fill: 'rgba(132, 204, 22, 0.2)', bg: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/30' },       // Lime
  { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.2)', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },   // Indigo
];

export function getClassColor(clsId: number | string) {
  const numericId = typeof clsId === 'number' ? clsId : Math.abs(hashString(clsId));
  const index = Math.abs(numericId) % CLASS_PALETTE.length;
  return CLASS_PALETTE[index];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const SOURCE_COLORS: Record<string, string> = {
  image: '#10b981',
  video: '#3b82f6',
  stream: '#f59e0b',
};

export const SOURCE_LABELS: Record<string, string> = {
  image: 'Hình ảnh',
  video: 'Video',
  stream: 'Webcam',
};

