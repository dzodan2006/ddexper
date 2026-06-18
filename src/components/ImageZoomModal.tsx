import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

export default function ImageZoomModal({ isOpen, onClose, imageSrc, imageAlt }: ImageZoomModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom & position when opened/closed or source changes
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Keyboard navigation (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      // Center zoom initially
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none"
          onClick={onClose}
        >
          {/* Top Bar Status / Controls */}
          <div className="absolute top-0 inset-x-0 h-20 px-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-zinc-500 font-mono text-[10px] tracking-[0.2em] uppercase hidden sm:block">
              {imageAlt || "DD Design Kreacija"}
            </span>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Zoom indicators */}
              <button
                onClick={handleZoomToggle}
                className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                title={isZoomed ? "Smanji" : "Uveličaj"}
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                title="Zatvori"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive instruction banner */}
          <div className="absolute bottom-6 font-mono text-[10px] tracking-widest text-zinc-500 uppercase z-10 pointer-events-none text-center px-4 bg-black/40 py-2 rounded-full">
            {isZoomed 
              ? "Prevucite sliku da biste istražili detalje • Kliknite za smanjivanje" 
              : "Kliknite na sliku za 2x uvećanje i pregled tekstura"}
          </div>

          {/* Image Container */}
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <motion.div
              style={{
                x: position.x,
                y: position.y,
                cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
              }}
              className="relative max-w-full max-h-[85vh] flex items-center justify-center"
              onClick={handleZoomToggle}
              onMouseDown={handleMouseDown}
              layout
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt={imageAlt}
                className={`max-w-full max-h-[85vh] object-contain rounded-sm transition-transform duration-300 pointer-events-none select-none ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />
              
              {isZoomed && (
                <div className="absolute top-4 left-4 p-2 bg-black/60 rounded-full text-white pointer-events-none md:flex items-center space-x-2 hidden">
                  <Move className="w-4 h-4 animate-pulse" />
                  <span className="text-[9px] font-mono tracking-wider uppercase pr-1">Pomeranje</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
