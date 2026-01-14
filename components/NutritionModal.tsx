
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, ShieldAlert, RefreshCw, ArrowLeft, Edit3 } from 'lucide-react';
import { NutritionEstimateResponse } from '../types.ts';
import { COLORS } from '../constants.ts';

interface NutritionModalProps {
  estimate: NutritionEstimateResponse;
  onConfirm: () => void;
  onCancel: () => void;
  onRecalculate: (newDescription: string) => Promise<void>;
  isRecalculating?: boolean;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({ 
  estimate, 
  onConfirm, 
  onCancel, 
  onRecalculate,
  isRecalculating = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState('');

  useEffect(() => {
    if (estimate) {
      const itemsString = estimate.items.join(', ');
      setEditInput(`${estimate.name}: ${itemsString}`);
    }
  }, [estimate]);

  const handleRecalculateClick = async () => {
    if (!editInput.trim()) return;
    await onRecalculate(editInput);
    setIsEditing(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score > 0.8) return 'text-emerald-400';
    if (score > 0.5) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-[60] glass rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
    >
      <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
      
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            key="edit-mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">Refine Meal Log</h2>
            </div>

            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                <strong className="text-indigo-100 block mb-1">AI Calibration</strong>
                Image recognition may not always be right. You can correct the food names and portion sizes below, and the numbers will be automatically recalculated.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40 tracking-wider">Meal Description</label>
              <textarea 
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-emerald-500 transition-colors resize-none"
                placeholder="E.g., 200g Grilled Chicken Breast, 1 cup Brown Rice..."
              />
            </div>

            <button 
              onClick={handleRecalculateClick}
              disabled={isRecalculating}
              className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRecalculating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Calculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" /> Recalculate Numbers
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-1">{estimate.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getConfidenceColor(estimate.confidence)}`}>
                    {Math.round(estimate.confidence * 100)}% Match
                  </span>
                  <Info className="w-3 h-3 text-white/30" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-emerald-400">{estimate.calories}</span>
                <span className="block text-[10px] font-bold text-white/40 uppercase">kcal</span>
              </div>
            </div>

            <p className="text-white/60 mb-8 leading-relaxed italic">
              "{estimate.reasoning}"
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Protein', value: estimate.macros.protein, color: COLORS.protein },
                { label: 'Carbs', value: estimate.macros.carbs, color: COLORS.carbs },
                { label: 'Fats', value: estimate.macros.fats, color: COLORS.fats }
              ].map((macro) => (
                <div key={macro.label} className="bg-white/5 rounded-2xl p-4 flex flex-col items-center">
                  <span className="text-xl font-bold" style={{ color: macro.color }}>{macro.value}g</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase">{macro.label}</span>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-white/40 uppercase mb-4 tracking-wider">Identified Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {estimate.items.map((item, i) => (
                  <span key={i} className="px-4 py-2 bg-white/5 rounded-full text-sm font-medium border border-white/5">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-200 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>These are AI estimates based on visual data and standard serving sizes.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsEditing(true)}
                className="py-4 px-6 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Adjust
              </button>
              <button 
                onClick={onConfirm}
                className="py-4 px-6 rounded-2xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Log Meal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
