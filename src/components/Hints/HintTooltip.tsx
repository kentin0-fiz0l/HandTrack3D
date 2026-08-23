import { useState, useEffect } from 'react';
import { useHintsStore } from '@/stores/hintsStore';
import type { Hint } from '@/data/hints';

interface HintTooltipProps {
  hint: Hint;
  onDismiss: () => void;
}

export function HintTooltip({ hint, onDismiss }: HintTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(), 300); // Wait for fade out
  };

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Position classes
  const positionClasses = {
    'top-left': 'top-24 left-4',
    'top-right': 'top-24 right-4',
    'top-center': 'top-24 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-24 left-4',
    'bottom-right': 'bottom-24 right-4',
    'bottom-center': 'bottom-24 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={`
        fixed z-50 max-w-sm
        ${positionClasses[hint.position]}
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="bg-blue-900/95 border-2 border-blue-500/50 rounded-lg p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {hint.icon && (
            <div className="text-3xl flex-shrink-0">
              {hint.icon}
            </div>
          )}
          
          {/* Message */}
          <div className="flex-1">
            <p className="text-blue-100 text-sm leading-relaxed">
              {hint.message}
            </p>
          </div>
          
          {/* Dismiss button */}
          {hint.dismissible && (
            <button
              onClick={handleDismiss}
              className="text-blue-300 hover:text-blue-100 transition-colors text-lg flex-shrink-0"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
