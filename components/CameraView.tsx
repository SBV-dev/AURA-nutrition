
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCw, Zap, Image as ImageIcon, AlertCircle, Info, Sparkles, CheckCircle2, ScanLine } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  isProcessing: boolean;
  onFinished?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose, isProcessing, onFinished }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);
  
  // Track previous processing state to trigger completion animation
  const prevProcessing = useRef(isProcessing);

  const startCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err: any) {
      setError("Camera access was denied.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    // Trigger 'Done' state when processing finishes
    if (prevProcessing.current && !isProcessing) {
      setShowDone(true);
      if (onFinished) onFinished();
      const timer = setTimeout(() => setShowDone(false), 2500);
      return () => clearTimeout(timer);
    }
    prevProcessing.current = isProcessing;
  }, [isProcessing, onFinished]);

  const handleTapFocus = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Haptic for focus
    if (navigator.vibrate) navigator.vibrate(10);

    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    setFocusPoint({ x: clientX - rect.left, y: clientY - rect.top });
    
    // Auto clear focus point after animation
    setTimeout(() => setFocusPoint(null), 1000);
  };

  const capture = () => {
    // Stronger haptic feedback for capture
    if (navigator.vibrate) {
      try {
        navigator.vibrate([50, 30, 50]);
      } catch (e) {
        // Silently fail
      }
    }

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
        // showDone is handled by the effect watching isProcessing
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col">
      <div 
        className="relative flex-1 overflow-hidden bg-black"
        onClick={handleTapFocus}
      >
        {!error && (
          <motion.div
            className="w-full h-full"
            animate={{ 
              scale: isProcessing ? 1.05 : (focusPoint ? 1.15 : 1),
              filter: isProcessing ? 'blur(8px)' : 'blur(0px)'
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <video 
              ref={videoRef} 
              autoPlay playsInline muted 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        )}
        
        {/* Focus Reticle */}
        <AnimatePresence>
          {focusPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute w-20 h-20 border-2 border-emerald-500 rounded-full pointer-events-none z-20"
              style={{ left: focusPoint.x - 40, top: focusPoint.y - 40 }}
            >
              <motion.div 
                animate={{ scale: [1, 0.8, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-full h-full bg-emerald-500/20 rounded-full"
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-3 bg-emerald-500" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1 h-3 bg-emerald-500" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-1 bg-emerald-500" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-1 bg-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aesthetic Overlay Frame with Scanner */}
        {!isProcessing && !showDone && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Markers */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-xl" />
            <div className="absolute bottom-24 left-8 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-xl" />
            <div className="absolute bottom-24 right-8 w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-xl" />
            
            {/* Center Reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="w-64 h-64 border border-white/20 rounded-[2rem] relative overflow-hidden"
              >
                 {/* Scanning Line */}
                 <motion.div 
                   animate={{ top: ['0%', '100%', '0%'] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                 />
              </motion.div>
            </div>
            
            {/* Hint */}
            <div className="absolute top-12 inset-x-0 text-center">
               <span className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white/80 border border-white/10 shadow-lg">
                 Tap subject to focus
               </span>
            </div>
          </div>
        )}

        {/* Status Overlays */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ 
                    repeat: Infinity, duration: 2, ease: "linear" 
                  }} 
                  className="w-24 h-24 rounded-full border-t-4 border-emerald-500 border-r-4 border-emerald-500/30 border-b-4 border-emerald-500/10 border-l-4 border-emerald-500/30 mb-8" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 m-auto w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"
                />
                <Zap className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 fill-emerald-500" />
              </div>
              <p className="text-2xl font-black tracking-tighter text-white">Analyzing...</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">Identifying Nutritional Content</p>
            </motion.div>
          )}
          
          {!isProcessing && showDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-emerald-500/90 backdrop-blur-md text-black">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
              >
                <Sparkles className="w-16 h-16 text-emerald-500 fill-emerald-500" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-black tracking-tighter mb-2">Complete</p>
                <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Meal Log Generated</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-44 bg-black/90 backdrop-blur-xl px-12 flex items-center justify-between border-t border-white/5 relative z-40 pb-6">
        <button onClick={onClose} className="p-4 rounded-full bg-white/5 active:bg-white/10 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={(e) => { e.stopPropagation(); capture(); }}
          disabled={isProcessing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
        >
          <motion.div 
            animate={{ scale: isProcessing ? 0.8 : 1 }}
            className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform duration-100" 
          />
        </motion.button>
        
        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
