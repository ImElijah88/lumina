import React, { useEffect, useState } from 'react';
import { useGuide } from '../../contexts/GuideContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export const GuideOverlay: React.FC = () => {
  const { activeGuide, currentStepIndex, nextStep, prevStep, endGuide } = useGuide();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!activeGuide) {
      setTargetRect(null);
      return;
    }

    const step = activeGuide.steps[currentStepIndex];
    
    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        // Scroll into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            const newRect = el.getBoundingClientRect();
            setTargetRect(newRect);
        }, 300); // wait for scroll
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    
    // Check periodically in case element appears later (e.g. dropdown opens)
    const interval = setInterval(updateRect, 500);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [activeGuide, currentStepIndex]);

  if (!activeGuide) return null;

  const step = activeGuide.steps[currentStepIndex];
  const isLastStep = currentStepIndex === activeGuide.steps.length - 1;

  // Calculate bubble position
  let bubbleStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (targetRect) {
    const spacing = 16;
    const placement = step.placement || 'bottom';
    const bubbleWidth = 288; // w-72 is 18rem = 288px
    const bubbleHeight = 200; // estimated height

    let bubbleLeft = targetRect.left + targetRect.width / 2;
    let transformX = '-50%';

    // Constrain horizontally
    if (bubbleLeft + bubbleWidth / 2 > window.innerWidth - 16) {
      bubbleLeft = window.innerWidth - 16;
      transformX = '-100%';
    } else if (bubbleLeft - bubbleWidth / 2 < 16) {
      bubbleLeft = 16;
      transformX = '0';
    }

    let bubbleTop = targetRect.top + targetRect.height / 2;
    let transformY = '-50%';

    // Constrain vertically
    if (bubbleTop + bubbleHeight / 2 > window.innerHeight - 16) {
      bubbleTop = window.innerHeight - 16;
      transformY = '-100%';
    } else if (bubbleTop - bubbleHeight / 2 < 16) {
      bubbleTop = 16;
      transformY = '0';
    }

    switch (placement) {
      case 'top':
        if (targetRect.top - spacing - bubbleHeight < 0) {
          // Flip to bottom
          bubbleStyle = {
            top: targetRect.bottom + spacing,
            left: bubbleLeft,
            transform: `translate(${transformX}, 0)`,
          };
        } else {
          bubbleStyle = {
            top: targetRect.top - spacing,
            left: bubbleLeft,
            transform: `translate(${transformX}, -100%)`,
          };
        }
        break;
      case 'bottom':
        if (targetRect.bottom + spacing + bubbleHeight > window.innerHeight) {
          // Flip to top
          bubbleStyle = {
            top: targetRect.top - spacing,
            left: bubbleLeft,
            transform: `translate(${transformX}, -100%)`,
          };
        } else {
          bubbleStyle = {
            top: targetRect.bottom + spacing,
            left: bubbleLeft,
            transform: `translate(${transformX}, 0)`,
          };
        }
        break;
      case 'left':
        bubbleStyle = {
          top: bubbleTop,
          left: targetRect.left - spacing,
          transform: `translate(-100%, ${transformY})`,
        };
        // Fallback if no space on left
        if (targetRect.left - spacing - bubbleWidth < 16) {
           if (targetRect.bottom + spacing + bubbleHeight > window.innerHeight) {
             bubbleStyle = {
               top: targetRect.top - spacing,
               left: bubbleLeft,
               transform: `translate(${transformX}, -100%)`,
             };
           } else {
             bubbleStyle = {
               top: targetRect.bottom + spacing,
               left: bubbleLeft,
               transform: `translate(${transformX}, 0)`,
             };
           }
        }
        break;
      case 'right':
        bubbleStyle = {
          top: bubbleTop,
          left: targetRect.right + spacing,
          transform: `translate(0, ${transformY})`,
        };
        // Fallback if no space on right
        if (targetRect.right + spacing + bubbleWidth > window.innerWidth - 16) {
           if (targetRect.bottom + spacing + bubbleHeight > window.innerHeight) {
             bubbleStyle = {
               top: targetRect.top - spacing,
               left: bubbleLeft,
               transform: `translate(${transformX}, -100%)`,
             };
           } else {
             bubbleStyle = {
               top: targetRect.bottom + spacing,
               left: bubbleLeft,
               transform: `translate(${transformX}, 0)`,
             };
           }
        }
        break;
      case 'center':
      default:
        bubbleStyle = {
          top: bubbleTop,
          left: bubbleLeft,
          transform: `translate(${transformX}, ${transformY})`,
        };
        break;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Fallback dim overlay if no target */}
      {!targetRect && (
        <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity" />
      )}

      {/* Highlight cutout (simulated with box-shadow on a div) */}
      {targetRect && (
        <div 
          className="absolute border-2 border-cyan-400 rounded-lg transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            zIndex: 10000
          }}
        />
      )}

      {/* Speech Bubble */}
      <div 
        className="guide-overlay-element absolute bg-[#0A0C10] border border-cyan-500/50 rounded-xl shadow-2xl p-5 w-72 max-w-[calc(100vw-32px)] pointer-events-auto transition-all duration-300 ease-in-out z-[10001]"
        style={bubbleStyle}
      >
        <button 
          onClick={endGuide}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-1">
          <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">
            Step {currentStepIndex + 1} of {activeGuide.steps.length}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          {step.content}
        </p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="p-2 text-gray-500 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
