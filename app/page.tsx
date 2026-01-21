"use client";

import { useEffect, useRef, useState } from "react";

// Determine basePath at runtime for asset loading
const getBasePath = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.includes('github.io') ? '/insane-website' : '';
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [basePath, setBasePath] = useState<string | null>(null);

  // Set basePath on mount - must happen before video tries to load
  useEffect(() => {
    setBasePath(getBasePath());
  }, []);

  useEffect(() => {
    // Don't run until basePath is set (video is rendered)
    if (basePath === null) return;

    const video = videoRef.current;
    const blackOverlay = blackOverlayRef.current;
    const welcomeText = welcomeTextRef.current;
    if (!video || !blackOverlay) return;

    // Check if video is already loaded (cached) and set ready immediately
    if (video.readyState >= 3) {
      setIsReady(true);
    }

    const startOffset = 0.1;

    // Phase 1: Video playback scroll (4 viewport heights)
    const videoScrollMax = 4 * window.innerHeight;
    // Phase 2: Black overlay rises from bottom (2 viewport heights)
    const overlayScrollMax = 2 * window.innerHeight;
    // Total scroll range
    const maxScroll = videoScrollMax + overlayScrollMax;

    // Virtual scroll position (not tied to browser scroll)
    let virtualScroll = 0;

    const updateTextPosition = (progress: number) => {
      if (!welcomeText) return;
      // Text starts below center (invisible) and slides UP to center as you scroll
      // At progress 0: starts at +20vh below center
      // At progress 0.6: arrives at center (0) and stays there

      const arrivalPoint = 0.6; // Text arrives at center at 60% scroll progress (slower)
      const startOffset = 20; // Start 20vh below center

      let translateY: number;
      let opacity: number;

      if (progress < arrivalPoint) {
        // Sliding up phase: from +20vh to 0
        const slideProgress = progress / arrivalPoint;
        translateY = startOffset * (1 - slideProgress); // 20vh -> 0
        opacity = slideProgress; // 0 -> 1
      } else {
        // After arrival: stay at center
        translateY = 0;
        opacity = 1;
      }

      welcomeText.style.transform = `translate(-50%, -50%) translateY(${translateY}vh)`;
      welcomeText.style.opacity = opacity.toString();
    };

    const updateOverlayPosition = (riseProgress: number) => {
      if (!blackOverlay) return;
      // Rise the black overlay from bottom to cover the screen
      // riseProgress: 0 = overlay hidden below screen, 1 = overlay fully covers screen
      // translateY goes from 100% (below) to 0% (covering)
      const translateY = 100 - (riseProgress * 100);
      blackOverlay.style.transform = `translateY(${translateY}%)`;
    };

    const setup = async () => {
      // Prevent native scrolling
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";

      // Wait for video to be fully loaded
      await new Promise<void>((resolve) => {
        if (video.readyState >= 3) {
          resolve();
        } else {
          video.addEventListener("canplaythrough", () => resolve(), { once: true });
        }
      });

      video.currentTime = startOffset;

      // Brief play/pause to engage decoder
      try {
        await video.play();
        video.pause();
      } catch (e) { }

      setIsReady(true);
      updateTextPosition(0);
      updateOverlayPosition(0);
    };

    // Handle wheel events directly - bypasses momentum scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!video || video.readyState < 3) return;

      // Update virtual scroll position
      virtualScroll += e.deltaY;
      virtualScroll = Math.max(0, Math.min(maxScroll, virtualScroll));

      const videoDuration = video.duration || 8;

      if (virtualScroll <= videoScrollMax) {
        // Phase 1: Video playback
        const videoProgress = virtualScroll / videoScrollMax;
        video.currentTime = startOffset + (videoDuration - startOffset) * videoProgress;
        updateTextPosition(videoProgress);
        updateOverlayPosition(0); // Overlay stays hidden
      } else {
        // Phase 2: Black overlay rises from bottom
        // Keep video at the end
        video.currentTime = videoDuration;
        updateTextPosition(1); // Text stays at final position

        // Calculate rise progress (0 to 1)
        const riseProgress = (virtualScroll - videoScrollMax) / overlayScrollMax;
        updateOverlayPosition(riseProgress);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!video || video.readyState < 3) return;

      const step = window.innerHeight * 0.5; // Half a viewport per key press

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        virtualScroll = Math.min(maxScroll, virtualScroll + step);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        virtualScroll = Math.max(0, virtualScroll - step);
      } else if (e.key === "Home") {
        e.preventDefault();
        virtualScroll = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        virtualScroll = maxScroll;
      } else {
        return;
      }

      const videoDuration = video.duration || 8;

      if (virtualScroll <= videoScrollMax) {
        // Phase 1: Video playback
        const videoProgress = virtualScroll / videoScrollMax;
        video.currentTime = startOffset + (videoDuration - startOffset) * videoProgress;
        updateTextPosition(videoProgress);
        updateOverlayPosition(0);
      } else {
        // Phase 2: Black overlay rises
        video.currentTime = videoDuration;
        updateTextPosition(1);
        const riseProgress = (virtualScroll - videoScrollMax) / overlayScrollMax;
        updateOverlayPosition(riseProgress);
      }
    };

    setup();

    // Use passive: false to allow preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [basePath]); // Re-run when basePath changes (video becomes available)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Loading indicator - shows while basePath is being determined */}
      {basePath === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {/* 
          VIDEO CROP SETTINGS (FIXED - baked into file):
          - Original: 1920x1080
          - Cropped:  1884x1060 (removed 36px from right, 20px from bottom)
          
          TO APPLY THE SAME CROP TO A NEW VIDEO, use this ffmpeg command:
          ffmpeg -i INPUT.mp4 -vf "crop=1884:1060:0:0" -c:v libx264 -preset slow -crf 18 OUTPUT.mp4
          
          This crops from top-left corner: width=1884, height=1060, x=0, y=0
      */}
      {basePath !== null && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"
            }`}
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          src={`${basePath}/videos/background-60fps-cropped-optimized.mp4`}
          onError={() => setIsReady(true)}
        />
      )}

      {/* Welcome Text - Slides up on scroll */}
      <div
        ref={welcomeTextRef}
        className="absolute left-1/2 top-1/2 z-10 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%) translateY(20vh)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <h1
          className="text-white font-bold tracking-wider"
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            textShadow: "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.02em",
            fontFamily: "var(--font-fraunces), serif",
          }}
        >
          Welcome
        </h1>
      </div>

      {/* Black Overlay - rises from bottom after video ends */}
      <div
        ref={blackOverlayRef}
        className="absolute inset-0 w-full h-full bg-black z-20"
        style={{
          willChange: "transform",
          transform: "translateY(100%)",
        }}
      />
    </div>
  );
}
