/**
 * Spotlight effect that highlights specific elements during tutorial
 * Creates a dark overlay with a transparent "spotlight" area
 */

interface SpotlightProps {
  target: string; // 'nearest-object' | 'grabbed-object' | specific element selector
}

export function Spotlight({ target }: SpotlightProps) {
  // For now, create a simple overlay effect
  // In a full implementation, this would calculate the position and size
  // of the target element and create a spotlight cutout
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.7) 60%)',
      }}
    >
      {/* Optional: Add animated ring around spotlight */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 rounded-full border-4 border-blue-500/30 animate-pulse" />
      </div>
    </div>
  );
}
