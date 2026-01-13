
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export const SplashLogo: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambient Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.1] }}
        transition={{ duration: 3, times: [0, 0.5, 1] }}
        className="absolute w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px]"
      />

      <div className="relative flex items-center justify-center w-64 h-64">
        {/* SVG Animation */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(163,230,53,0.5)] overflow-visible">
           <defs>
            <linearGradient id="splashGradA" x1="50" y1="20" x2="50" y2="80">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
          </defs>

          {/* 1. The 'A' Fades In */}
          <motion.path 
            d="M50 25 L75 80 H62 L50 52 L38 80 H25 L50 25Z" 
            fill="url(#splashGradA)" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* 2. Outer Ring Draws */}
          <motion.circle 
            cx="50" cy="50" r="45" 
            stroke="#a3e635" 
            strokeWidth="3" 
            fill="none"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: -90 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
          />

          {/* 3. Heartbeat Draws */}
          <motion.path 
            d="M15 62 H35 L45 35 L55 85 L65 45 L72 62 H82" 
            stroke="#a3e635" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 }}
          />
          
          {/* 4. Dot Pop */}
          <motion.circle 
            cx="85" cy="62" r="3" 
            fill="#a3e635" 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 2.8 }}
          />

          {/* 5. Leaf Grows */}
          <motion.path 
            d="M66 44 C66 44 72 25 85 32 C85 32 82 50 66 44" 
            fill="#a3e635" 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 2.2 }}
          />
        </svg>
      </div>

      {/* Text Reveal */}
      <div className="mt-8 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 10, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.1em" }}
          transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
          className="text-4xl font-black text-white"
        >
          AURA
        </motion.h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 3 }}
          className="h-[1px] bg-lime-500/50 mx-auto mt-2 max-w-[100px]"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3.2 }}
          className="text-lime-400/80 text-[10px] font-bold uppercase tracking-[0.4em] mt-2"
        >
          Bio-Intelligence
        </motion.p>
      </div>
    </div>
  );
};
