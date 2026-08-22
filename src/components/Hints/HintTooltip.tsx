import { useEffect, useState } from 'react';
import { useHintsStore, type HintType } from '@/stores/hintsStore';

interface HintTooltipProps {
  type: HintType;
  title: string;
  message: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  autoHideDelay?: number;
}

const POSITION_CLASSES = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function HintTooltip({
  type,
  title,
  message,
  position = 'center',
  autoHideDelay = 8000,
}: HintTooltipProps) {
  const shouldShow = useHintsStore((state) => state.shouldShow(type));
  const markShown = useHintsStore((state) => state.markShown);
  const dismissHint = useHintsStore((state) => state.dismissHint);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      // Show with a slight delay for better UX
      const showTimer = setTimeout(() => {
        setVisible(true);
        markShown(type);
      }, 300);

      // Auto-hide after delay
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay + 300);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [shouldShow, type, markShown, autoHideDelay]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      dismissHint(type);
    }, 300); // Wait for fade-out animation
  };

  if (!shouldShow || !visible) return null;

  return (
    <div
      className={`fixed ${POSITION_CLASSES[position]} z-50 max-w-sm animate-fade-in`}
      role="alert"
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-800/50">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
            aria-label="Dismiss hint"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-sm text-blue-50">{message}</p>
        </div>

        {/* Progress bar for auto-hide */}
        <div className="h-1 bg-blue-900/30 overflow-hidden">
          <div
            className="h-full bg-blue-300 animate-shrink-width"
            style={{ animationDuration: `${autoHideDelay}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
