import { useWebcam } from '@/hooks/useWebcam';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useMoveNetTracking } from '@/hooks/useMoveNetTracking';
import { useSettingsStore } from '@/stores/settingsStore';
import { HandOverlay } from './HandOverlay';

interface WebcamFeedProps {
  showPreview?: boolean;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 240;

export function WebcamFeed({ showPreview = true }: WebcamFeedProps) {
  const { videoRef, isReady, error } = useWebcam();
  const showWebcam = useSettingsStore((state) => state.showWebcam);

  // Initialize hand tracking
  useHandTracking(videoRef.current, isReady);

  // Initialize body/pose tracking for depth context using MoveNet
  useMoveNetTracking(videoRef.current);

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg max-w-xs z-50">
        <h3 className="font-semibold mb-1">Webcam Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden video element for MediaPipe processing */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Optional preview in bottom-right */}
      {showPreview && isReady && showWebcam && (
        <div className="fixed bottom-4 right-4 bg-black/70 p-2 rounded-lg z-40">
          <div className="relative" style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
            <video
              ref={videoRef}
              className="w-full h-full rounded object-cover"
              playsInline
              muted
            />
            <HandOverlay width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />
            <div className="absolute top-2 right-2 bg-green-500 w-3 h-3 rounded-full animate-pulse" />
          </div>
          <p className="text-white text-xs mt-1 text-center">Hand Tracking Active</p>
        </div>
      )}
    </>
  );
}
