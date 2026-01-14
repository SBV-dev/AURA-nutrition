
import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants.ts';

export const BarChart: React.FC<{ 
  data: number[]; 
  labels: string[]; 
  maxValue: number; 
  color: string;
  onSelect?: (index: number) => void;
  selectedIndex?: number | null;
}> = ({ data, labels, maxValue, color, onSelect, selectedIndex }) => {
  return (
    <div className="flex items-end justify-between h-32 gap-2 mt-4 select-none">
      {data.map((val, i) => {
        const safeMax = maxValue > 0 ? maxValue : 1;
        const height = (val / safeMax) * 100;
        const isSelected = selectedIndex === i;
        
        return (
          <motion.button 
            key={i} 
            layout
            className="flex-1 flex flex-col items-center gap-2 h-full outline-none group relative"
            onClick={() => onSelect?.(i)}
            whileTap={{ scale: 0.95 }}
          >
            {isSelected && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute -top-4 w-1 h-1 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            <div className={`w-full bg-white/5 rounded-t-lg relative overflow-hidden h-full flex flex-col justify-end transition-all duration-300 ${isSelected ? 'ring-1 ring-white/30 bg-white/10' : ''}`}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                className="w-full rounded-t-lg relative"
                style={{ backgroundColor: isSelected ? 'white' : color }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {isSelected && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
              </motion.div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${isSelected ? 'text-white scale-110' : 'text-white/30 group-hover:text-white/50'}`}>
              {labels[i]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export const LineChart: React.FC<{ 
  data: number[]; 
  color: string;
  onSelect?: (index: number) => void;
  selectedIndex?: number | null;
}> = ({ data, color, onSelect, selectedIndex }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const normalizedVal = (val - min) / range;
    const y = 90 - (normalizedVal * 80); 
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-32 w-full mt-4 select-none touch-none">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`lineGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill={`url(#lineGradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        <motion.path
          d={`M ${points}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1.5 }}
        />

        {data.map((val, i) => {
          const x = (i / (data.length - 1)) * 100;
          const normalizedVal = (val - min) / range;
          const y = 90 - (normalizedVal * 80);
          const isSelected = selectedIndex === i;

          return (
            <g key={i} onClick={() => onSelect?.(i)}>
              <circle cx={x} cy={y} r="8" fill="transparent" className="cursor-pointer" />
              <motion.circle
                cx={x}
                cy={y}
                r={isSelected ? 4 : 2}
                fill={isSelected ? "#fff" : color}
                stroke={isSelected ? color : "transparent"}
                strokeWidth={isSelected ? 0.5 : 0}
                animate={{ 
                  r: isSelected ? 5 : 2,
                  scale: isSelected ? 1.2 : 1 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="cursor-pointer pointer-events-none" 
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
