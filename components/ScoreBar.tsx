
import React from 'react';

interface ScoreBarProps {
  percentage: number;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ percentage }) => {
  const getColors = (p: number) => {
    if (p >= 90) return { bar: 'bg-emerald-400', glow: 'shadow-emerald-500/50' };
    if (p >= 70) return { bar: 'bg-amber-400', glow: 'shadow-amber-500/50' };
    return { bar: 'bg-rose-400', glow: 'shadow-rose-500/50' };
  };

  const colors = getColors(percentage);

  return (
    <div className="w-full space-y-1">
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full shadow-lg ${colors.bar} ${colors.glow}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;
