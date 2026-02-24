import React, { useRef, useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface BiblicalCardProps {
  image: string;
  title: string;
  description?: string;
  verse: string;
  label?: string; // Kept for interface compatibility but ignored in render
  onClose?: () => void;
}

export const BiblicalCard: React.FC<BiblicalCardProps> = ({ 
  image, 
  title, 
  verse,
  onClose 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadFull = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // 1. Force image pre-loading to ensure it renders in canvas
      // Data URIs usually load instantly, but this ensures the browser has decoded it
      await new Promise((resolve) => {
        const img = new Image();
        img.src = image;
        if (img.complete) {
            resolve(true);
        } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true); // Proceed anyway to avoid hanging
        }
      });

      // 2. Capture
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Slightly reduced scale to improve performance/success rate
        useCORS: true, // Critical for cross-origin or data-uri handling in some contexts
        allowTaint: false, // CRITICAL: Must be false to allow toDataURL export
        backgroundColor: '#050608',
        logging: false,
        onclone: (clonedDoc) => {
            // Optional: Adjust styles in clone if needed, e.g. removing shadows that render poorly
            const clonedElement = clonedDoc.querySelector('[data-card-root]') as HTMLElement;
            if (clonedElement) {
                clonedElement.style.transform = 'none'; // Clear transforms during capture
            }
        }
      });

      // 3. Convert and Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lumina-card-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Card generation failed", error);
      alert("Could not save card. Please try taking a screenshot manually.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate font size based on text length to ensure it fits elegantly
  const getFontSizeClass = (text: string) => {
    const len = text.length;
    if (len > 250) return "text-[10px] leading-snug";
    if (len > 150) return "text-xs leading-relaxed";
    if (len > 80) return "text-sm leading-loose";
    return "text-base leading-loose";
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-up w-full">
      {/* 
        CAPTURE TARGET
        Modern Cinematic Card Design - Clean & Sublime
      */}
      <div className="relative group perspective-1000 w-full max-w-[340px] mx-auto select-none">
        
        {/* Glow Effect (Behind) - Not captured */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-amber-500/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>

        {/* THE CARD */}
        <div 
          ref={cardRef}
          data-card-root // Marker for clone manipulation
          className="relative w-full aspect-[3/4.5] rounded-[24px] overflow-hidden bg-[#050608] shadow-2xl ring-1 ring-white/10"
        >
          {/* 1. Full Bleed Image */}
          <div className="absolute inset-0 z-0">
             <img 
               src={image} 
               alt={title} 
               className="w-full h-full object-cover scale-[1.02]" 
               crossOrigin="anonymous" 
             />
          </div>

          {/* 2. Overlays */}
          {/* Top subtle vignette for title */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
          
          {/* Bottom strong gradient for text - Covers exactly 50% to start fading in, getting strongest at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/95 via-black/80 to-transparent z-10 pointer-events-none"></div>
          
          {/* 3. Subtle Inner Frame */}
          <div className="absolute inset-[12px] border border-white/10 rounded-[16px] z-20 pointer-events-none mix-blend-overlay"></div>

          {/* 4. Content Layout */}
          
          {/* Top: Verse Reference (Title) - Small, Elegant, Lifted */}
          <div className="absolute top-6 left-0 right-0 z-30 flex justify-center px-6">
             <span className="font-serif text-[#f2c46d] text-xs font-bold tracking-[0.2em] uppercase opacity-90 drop-shadow-md">
                {title}
             </span>
          </div>

          {/* Bottom: Verse Text - Strictly in bottom half */}
          <div className="absolute bottom-0 left-0 right-0 h-[50%] z-30 flex flex-col justify-end p-8 pb-10">
            <div className="relative text-center">
              {/* Decorative minimal divider */}
              <div className="w-8 h-[1px] bg-[#f2c46d]/50 mx-auto mb-4"></div>
              
              <p 
                className={`font-serif text-gray-100 font-medium drop-shadow-lg text-balance ${getFontSizeClass(verse)}`}
              >
                {verse}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Control Bar (Outside Capture Area) */}
      <div className="flex items-center gap-3 bg-[#0A0C10] p-1.5 pr-2 rounded-full border border-gray-800 shadow-xl">
        <button
          onClick={handleDownloadFull}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-white text-black text-sm font-bold rounded-full transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Save Card</span>
        </button>
        
        {onClose && (
           <button
             onClick={onClose}
             className="p-2.5 rounded-full text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
             title="Close"
           >
             <X className="w-5 h-5" />
           </button>
        )}
      </div>
    </div>
  );
};