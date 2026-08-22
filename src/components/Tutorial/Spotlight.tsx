import { useEffect, useState } from 'react';

interface SpotlightProps {
  targetSelector?: string;
}

export function Spotlight({ targetSelector }: SpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    // Initial update
    updateTargetRect();

    // Update on resize and scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    // Polling fallback for dynamic elements (every 500ms)
    const interval = setInterval(updateTargetRect, 500);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      clearInterval(interval);
    };
  }, [targetSelector]);

  if (!targetRect) {
    return null;
  }

  // Create spotlight effect with SVG mask
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            {/* White background (visible) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout (transparent) with padding */}
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        {/* Dark overlay with spotlight cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      {/* Animated border around spotlight target */}
      <div
        className="absolute border-2 border-blue-400 rounded-xl animate-pulse"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
}
