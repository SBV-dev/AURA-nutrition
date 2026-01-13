
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="45" stroke="#a3e635" strokeWidth="3" />
    
    {/* The 'A' - Dark Grey with gradient fill for depth */}
    <defs>
      <linearGradient id="gradA" x1="50" y1="20" x2="50" y2="80">
        <stop offset="0%" stopColor="#3f3f46" />
        <stop offset="100%" stopColor="#18181b" />
      </linearGradient>
    </defs>
    <path d="M50 25 L75 80 H62 L50 52 L38 80 H25 L50 25Z" fill="url(#gradA)" />

    {/* Heartbeat Line - Neon Lime */}
    <path d="M15 62 H35 L45 35 L55 85 L65 45 L72 62 H82" stroke="#a3e635" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="85" cy="62" r="3" fill="#a3e635" />

    {/* Leaf */}
    <path d="M66 44 C66 44 72 25 85 32 C85 32 82 50 66 44" fill="#a3e635" />
  </svg>
);
