import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Minus, Plus, GlassWater, Check, X, Container } from 'lucide-react';
import { COLORS } from '../constants';

interface HydrationModalProps {
  currentAmount: number;
  target: number;
  onAdd: (amount: number) => void;
  onClose: () => void;
}

export const HydrationModal: React.FC<HydrationModalProps> = ({ currentAmount, target, onAdd, onClose }) => {
  const [customAdd, setCustomAdd] = useState(250);

  const percentage = Math.min((currentAmount / target) * 100, 100);
  const glasses = Math.floor(currentAmount / 250);
  const liters = (currentAmount / 1000).toFixed(1);

  const handleAdd = (amount: number) => {
    onAdd(amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/20 blur-[80px] pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Hydration</h2>
              <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Liquid Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-6 h-6 text-white/50" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  stroke={COLORS.water} 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray={553}
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * percentage) / 100 }}
                  transition={{ type: "spring", stiffness: 60, damping: 20 }}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black text-white">{currentAmount}</span>
               <span className="text-xs font-bold text-white/30 uppercase">ml</span>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 w-full px-4">
             <div className="text-center">
               <p className="text-2xl font-bold text-white">{glasses}</p>
               <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Glasses</p>
             </div>
             <div className="text-center border-x border-white/5">
               <p className="text-2xl font-bold text-white">{liters}</p>
               <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Liters</p>
             </div>
             <div className="text-center">
               <p className="text-2xl font-bold text-white">{Math.round((currentAmount / target) * 100)}%</p>
               <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Goal</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
           <button onClick={() => handleAdd(250)} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-transparent transition-all group">
              <GlassWater className="w-6 h-6 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Glass</span>
              <span className="text-[9px] font-black opacity-40">250ml</span>
           </button>
           <button onClick={() => handleAdd(500)} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-transparent transition-all group">
              <Container className="w-6 h-6 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Bottle</span>
              <span className="text-[9px] font-black opacity-40">500ml</span>
           </button>
           <button onClick={() => handleAdd(1000)} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-transparent transition-all group">
              <Droplets className="w-6 h-6 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Carafe</span>
              <span className="text-[9px] font-black opacity-40">1L</span>
           </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-2 flex items-center gap-4 relative z-10">
          <button onClick={() => setCustomAdd(Math.max(50, customAdd - 50))} className="p-3 bg-black/20 rounded-xl hover:bg-black/40 text-white/70">
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-xl font-black">{customAdd}</span>
            <span className="text-xs font-bold text-white/30 ml-1">ml</span>
          </div>
          <button onClick={() => setCustomAdd(customAdd + 50)} className="p-3 bg-black/20 rounded-xl hover:bg-black/40 text-white/70">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => handleAdd(customAdd)} className="p-3 bg-cyan-500 rounded-xl text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform">
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};