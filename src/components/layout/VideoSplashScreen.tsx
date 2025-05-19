
'use client';

import { useEffect, useRef } from 'react';

interface VideoSplashScreenProps {
  videoSrc: string;
  onVideoEnd: () => void;
}

const VideoSplashScreen = ({ videoSrc, onVideoEnd }: VideoSplashScreenProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoEnd = () => {
        onVideoEnd();
      };
      // Ensure video is muted for autoplay
      videoElement.muted = true;
      videoElement.addEventListener('ended', handleVideoEnd);
      
      videoElement.play().catch(error => {
        console.error("Video autoplay failed:", error);
        // If autoplay fails (e.g., browser policy or video error),
        // directly call onVideoEnd to prevent getting stuck on the splash screen.
        onVideoEnd();
      });

      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [onVideoEnd, videoSrc]); // Added videoSrc to dependencies

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999, 
      backgroundColor: 'hsl(var(--background))' 
    }}>
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline // Important for iOS
        muted // Reinforce muted here
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        data-ai-hint="abstract technology"
      />
    </div>
  );
};

export default VideoSplashScreen;
