
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCw, Zap, Image as ImageIcon, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';

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
    if (!isProcessing && showDone) {
      const timer = setTimeout(() => {
        setShowDone(false);
        if (onFinished) onFinished();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  const capture = () => {
    // Subtle haptic feedback for supported browsers
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch (e) {
        // Silently fail if vibrate fails
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
        setShowDone(true);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        {!error && (
          <motion.video 
            ref={videoRef} 
            autoPlay playsInline muted 
            animate={{ 
              scale: isProcessing ? 1.08 : 1,
              filter: isProcessing ? 'blur(4px)' : 'blur(0px)'
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 100 }}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        )}
        
        {/* Aesthetic Overlay Frame */}
        {!isProcessing && !showDone && (
          <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full aspect-square border border-emerald-500/20 rounded-[3.5rem] relative"
            >
              <div className="absolute -top-1 -left-1 w-14 h-14 border-t-4 border-l-4 border-emerald-500 rounded-tl-[2.5rem]" />
              <div className="absolute -top-1 -right-1 w-14 h-14 border-t-4 border-r-4 border-emerald-500 rounded-tr-[2.5rem]" />
              <div className="absolute -bottom-1 -left-1 w-14 h-14 border-b-4 border-l-4 border-emerald-500 rounded-bl-[2.5rem]" />
              <div className="absolute -bottom-1 -right-1 w-14 h-14 border-b-4 border-r-4 border-emerald-500 rounded-br-[2.5rem]" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-emerald-500/30 rounded-full" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Status Overlays */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center z-30">
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                transition={{ 
                  rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }} 
                className="w-20 h-20 rounded-full border-t-2 border-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]" 
              />
              <p className="text-2xl font-black tracking-tightest">Synthesizing Bio-Data...</p>
              <div className="mt-4 flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
          {!isProcessing && showDone && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/20 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <CheckCircle2 className="w-32 h-32 text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
              </motion.div>
              <p className="text-3xl font-black tracking-tightest">Success</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-44 bg-black/80 backdrop-blur-2xl px-12 flex items-center justify-between border-t border-white/5 relative z-40">
        <button onClick={onClose} className="p-5 rounded-full bg-white/5 active:bg-white/10 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <motion.button 
          whileTap={{ scale: 0.85 }} 
          onClick={capture} 
          disabled={isProcessing}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-[0_10px_40px_rgba(255,255,255,0.2)] disabled:opacity-50 transition-all active:shadow-inner p-1"
        >
          <div className="w-full h-full rounded-full border-2 border-black/10 flex items-center justify-center">
            <Camera className="w-10 h-10" />
          </div>
        </motion.button>
        
        <button className="p-5 rounded-full bg-white/5 opacity-0 pointer-events-none">
          <ImageIcon className="w-6 h-6" />
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
