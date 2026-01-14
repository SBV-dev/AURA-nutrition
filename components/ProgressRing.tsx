
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../constants.ts';

interface RingProps {
  value: number;
  total: number;
  size: number;
  stroke: number;
  color: string;
  label?: string;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 15,
  mass: 0.9,
  restDelta: 0.0005 
};

const OVERFLOW_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 15,
  mass: 0.5,
  restDelta: 0.0005
};

export const ProgressRing: React.FC<RingProps> = ({ value, total, size, stroke, color, label }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progressRatio = total > 0 ? value / total : 0;
  const primaryProgress = Math.min(progressRatio, 1);
  const primaryOffset = circumference - primaryProgress * circumference;
  
  const isWarning = value > total * 0.9 && value <= total;
  const isOver = value > total;
  
  const secondaryProgress = Math.max(0, Math.min(progressRatio - 1, 1));
  const secondaryOffset = circumference - secondaryProgress * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <AnimatePresence>
        {(isWarning || isOver) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isOver ? [0.2, 0.4, 0.2] : 0.15, 
              scale: isOver ? [0.95, 1.05, 0.95] : 1 
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-[60px] pointer-events-none mix-blend-screen"
            style={{ backgroundColor: isOver ? COLORS.fats : COLORS.carbs }}
          />
        )}
      </AnimatePresence>

      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="transparent"
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOver ? COLORS.primary : (isWarning ? COLORS.carbs : color)}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: primaryOffset }}
          transition={SPRING_CONFIG}
          strokeLinecap="round"
        />

        {isOver && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.fats}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: secondaryOffset }}
            transition={OVERFLOW_SPRING}
            strokeLinecap="round"
            className="drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]"
            style={{ mixBlendMode: 'plus-lighter' }}
          />
        )}
      </svg>
      
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none z-10">
          <motion.div
            key={value > total ? 'over' : 'under'}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.05 }}
            className="flex flex-col items-center"
          >
            <span 
              className={`text-7xl font-black tracking-tighter leading-none transition-colors duration-300 ${isOver ? 'text-rose-400' : 'text-white'}`}
              style={{ textShadow: isOver ? '0 0 20px rgba(244,63,94,0.3)' : 'none' }}
            >
              {isOver ? `+${Math.round(value - total)}` : Math.max(0, Math.round(total - value))}
            </span>
            <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mt-3">
              {isOver ? 'Surplus' : label}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const MiniMacro: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 26;
  const circumference = radius * 2 * Math.PI;
  const drawPercentage = Math.min(percentage, 100);
  const offset = circumference - (drawPercentage / 100) * circumference;
  const isOver = percentage > 100;
  
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div 
        className="relative w-18 h-18 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-all duration-700" />
        
        <svg width="72" height="72" className="transform -rotate-90 drop-shadow-xl overflow-visible">
          <circle cx="36" cy="36" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="transparent" />
          <motion.circle
            cx="36" cy="36" r={radius} stroke={color} strokeWidth="6" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: offset,
              strokeWidth: isOver ? 8 : 6
            }}
            transition={SPRING_CONFIG}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-white">
          {Math.round(value)}<span className="opacity-40 ml-0.5">g</span>
        </div>
      </motion.div>
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
};
