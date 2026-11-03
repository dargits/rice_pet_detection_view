import React from 'react';
import { getClassColor, SOURCE_COLORS, SOURCE_LABELS } from '../../lib/colors';

interface ClassBadgeProps {
  clsId: number | string;
  name: string;
  count?: number;
  conf?: number;
  onClick?: () => void;
  className?: string;
}

export const ClassBadge: React.FC<ClassBadgeProps> = ({
  clsId,
  name,
  count,
  conf,
  onClick,
  className = '',
}) => {
  const color = getClassColor(clsId);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        color.bg
      } ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'} ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color.stroke }}
      />
      <span>{name}</span>
      {typeof count === 'number' && (
        <span className="font-bold px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-white/15">
          {count}
        </span>
      )}
      {typeof conf === 'number' && (
        <span className="opacity-75">
          {(conf * 100).toFixed(0)}%
        </span>
      )}
    </button>
  );
};

export const SourceBadge: React.FC<{ source: 'image' | 'video' | 'stream' }> = ({ source }) => {
  const color = SOURCE_COLORS[source] || '#64748b';
  const label = SOURCE_LABELS[source] || source;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
};

