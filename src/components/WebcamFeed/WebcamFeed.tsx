import { useWebcam } from '@/hooks/useWebcam';

interface WebcamFeedProps {
  showPreview?: boolean;
}

export function WebcamFeed({ showPreview = true }: WebcamFeedProps) {
  const { videoRef, isReady, error } = useWebcam();

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg max-w-xs">
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
      {showPreview && isReady && (
        <div className="fixed bottom-4 right-4 bg-black/70 p-2 rounded-lg">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-64 h-48 rounded object-cover"
              playsInline
              muted
            />
            <div className="absolute top-2 right-2 bg-green-500 w-3 h-3 rounded-full animate-pulse" />
          </div>
          <p className="text-white text-xs mt-1 text-center">Webcam Active</p>
        </div>
      )}
    </>
  );
}
