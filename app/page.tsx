"use client";

import { useEffect, useRef, useState } from "react";
import { RevealWaveImage } from "@/components/ui/reveal-wave-image";
import SplitText from "@/components/ui/split-text";

// Determine basePath at runtime for asset loading
const getBasePath = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.includes('github.io') ? '/insane-website' : '';
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const revealImageRef = useRef<HTMLDivElement>(null);
  const elCapitanRef = useRef<HTMLDivElement>(null);
  const trumpVideoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [basePath, setBasePath] = useState<string | null>(null);
  const [showElCapitan, setShowElCapitan] = useState(false);

  // Set basePath on mount - must happen before video tries to load
  useEffect(() => {
    setBasePath(getBasePath());
  }, []);

  useEffect(() => {
    // Don't run until basePath is set (video is rendered)
    if (basePath === null) return;

    const video = videoRef.current;
    const welcomeText = welcomeTextRef.current;
    const elCapitanText = elCapitanRef.current;
    if (!video) return;

    // Check if video is already loaded (cached) and set ready immediately
    if (video.readyState >= 3) {
      setIsReady(true);
    }

    const startOffset = 0.1;

    // Phase 1: Video playback scroll (4 viewport heights)
    const videoScrollMax = 4 * window.innerHeight;
    // Phase 2: Text continues sliding up (2 viewport heights)
    const textExitScrollMax = 2 * window.innerHeight;
    // Phase 3: EL CAPITAN text slides up (1 viewport height - triggers quickly)
    const elCapitanSlideUpMax = 1 * window.innerHeight;
    // Phase 4: EL CAPITAN text slides right (1 viewport height)
    const elCapitanSlideRightMax = 1 * window.innerHeight;
    // Phase 5: Trump video scroll-controlled (4 viewport heights for full video scrub)
    const trumpVideoFadeMax = 4 * window.innerHeight;
    // Total scroll range
    const maxScroll = videoScrollMax + textExitScrollMax + elCapitanSlideUpMax + elCapitanSlideRightMax + trumpVideoFadeMax;

    // Virtual scroll position (not tied to browser scroll)
    let virtualScroll = 0;

    const revealImage = revealImageRef.current;
    const darkOverlay = darkOverlayRef.current;
    const trumpVideo = trumpVideoRef.current;

    // Track current animation state
    let elCapitanState: 'hidden' | 'sliding-up' | 'centered' | 'sliding-right' | 'exited' = 'hidden';
    let pendingSlideRight = false; // Queue slide-right if triggered during slide-up
    let trumpVideoTriggered = false; // Track if Trump video has been triggered

    const triggerSlideRight = () => {
      if (!elCapitanText) return;
      elCapitanState = 'sliding-right';
      elCapitanText.style.transform = `translate(-50%, -50%) translateX(100vw) translateY(0vh)`;
      elCapitanText.style.opacity = '1';
      setTimeout(() => {
        if (elCapitanState === 'sliding-right') {
          elCapitanState = 'exited';
        }
      }, 1000);
    };

    const updateElCapitanPosition = (phase: number) => {
      if (!elCapitanText) return;
      // phase: 0 = not yet triggered (hidden below)
      // phase: 1 = trigger slide up animation
      // phase: 2 = trigger slide right animation

      // Add CSS transition for smooth automatic animation
      elCapitanText.style.transition = 'transform 1s ease-out, opacity 0.8s ease-out';

      if (phase === 0 && elCapitanState !== 'hidden') {
        // Reset to hidden state (scrolling back up)
        elCapitanState = 'hidden';
        pendingSlideRight = false; // Cancel any pending slide-right
        elCapitanText.style.transform = `translate(-50%, -50%) translateX(0vw) translateY(100vh)`;
        elCapitanText.style.opacity = '0';
        setShowElCapitan(false); // Reset split text animation
      } else if (phase === 1 && elCapitanState === 'hidden') {
        // Trigger slide up animation automatically
        elCapitanState = 'sliding-up';
        pendingSlideRight = false;
        elCapitanText.style.transform = `translate(-50%, -50%) translateX(0vw) translateY(0vh)`;
        elCapitanText.style.opacity = '1';
        setShowElCapitan(true); // Trigger split text animation
        // Mark as centered after animation completes
        setTimeout(() => {
          if (elCapitanState === 'sliding-up') {
            elCapitanState = 'centered';
            // If slide-right was requested during slide-up, trigger it now
            if (pendingSlideRight) {
              pendingSlideRight = false;
              triggerSlideRight();
            }
          }
        }, 1000);
      } else if (phase === 2 && elCapitanState === 'centered') {
        // Trigger slide right animation (only if already centered)
        triggerSlideRight();
      } else if (phase === 2 && elCapitanState === 'sliding-up') {
        // Queue slide-right to happen after slide-up completes
        pendingSlideRight = true;
      } else if (phase === 1 && elCapitanState === 'exited') {
        // Scrolling back - bring it back to center from right
        pendingSlideRight = false;
        elCapitanState = 'centered';
        elCapitanText.style.transform = `translate(-50%, -50%) translateX(0vw) translateY(0vh)`;
        elCapitanText.style.opacity = '1';
        setShowElCapitan(true); // Re-trigger split text animation
      } else if (phase === 1 && elCapitanState === 'sliding-right') {
        // Scrolling back while sliding right - return to center
        pendingSlideRight = false;
        elCapitanState = 'centered';
        elCapitanText.style.transform = `translate(-50%, -50%) translateX(0vw) translateY(0vh)`;
        elCapitanText.style.opacity = '1';
        setShowElCapitan(true); // Re-trigger split text animation
      }
    };

    const updateTrumpVideo = (progress: number) => {
      if (!trumpVideo) return;
      // progress: 0 = not visible, >0 = visible and scrubbing through video

      if (progress > 0) {
        // Show and scrub through video based on scroll progress
        if (!trumpVideoTriggered) {
          trumpVideoTriggered = true;
          trumpVideo.style.transition = 'opacity 0.5s ease-out';
          trumpVideo.style.opacity = '1';
          trumpVideo.style.pointerEvents = 'auto';
        }
        // Scrub through video based on scroll progress - only if video is loaded
        if (trumpVideo.readyState >= 2 && trumpVideo.duration && isFinite(trumpVideo.duration)) {
          // Ensure video is paused (scrubbing, not playing)
          if (!trumpVideo.paused) {
            trumpVideo.pause();
          }
          const targetTime = progress * trumpVideo.duration;
          // Only update if there's a meaningful change to avoid jitter
          if (Math.abs(trumpVideo.currentTime - targetTime) > 0.01) {
            trumpVideo.currentTime = targetTime;
          }
        }
      } else {
        // Hide video
        if (trumpVideoTriggered) {
          trumpVideoTriggered = false;
          trumpVideo.style.transition = 'opacity 0.5s ease-out';
          trumpVideo.style.opacity = '0';
          trumpVideo.style.pointerEvents = 'none';
          if (trumpVideo.readyState >= 2) {
            trumpVideo.currentTime = 0;
          }
        }
      }
    };

    const updateTextPosition = (progress: number, exitProgress: number = 0) => {
      if (!welcomeText) return;
      // Text animation is ALWAYS "slide up from below to center"
      // When scrolling DOWN: text rises from below (+20vh) to center (0) then continues up off screen (-60vh)
      // When scrolling UP: the SAME animation plays - text appears from below and rises to center

      // For this to work, we treat exitProgress as a position along the SAME trajectory:
      // - At exitProgress 0: text is at center
      // - At exitProgress 1: text is at the "exit" position
      // When scrolling back up, exitProgress decreases, so we need the text to re-enter from below

      const arrivalPoint = 0.6; // Text arrives at center at 60% scroll progress
      const startOffset = 20; // Start 20vh below center
      const exitOffset = 20; // Exit position: 20vh BELOW center (same as entrance)

      // Calculate the "re-entry" threshold - when scrolling back, text should come from below
      const reentryThreshold = 0.3; // When exitProgress < 0.3, start showing text from below

      let translateY: number;
      let opacity: number;

      if (exitProgress > 0) {
        // We're in the exit/re-entry phase (after video ends)
        if (exitProgress > reentryThreshold) {
          // Text is mostly gone or fully exited - keep it hidden below
          translateY = startOffset; // Position below center (same as initial entrance)
          opacity = 0;
        } else {
          // Re-entering: text slides up from below to center
          // exitProgress goes from reentryThreshold -> 0 as we scroll up
          const reentryProgress = 1 - (exitProgress / reentryThreshold); // 0 -> 1 as exitProgress decreases
          translateY = startOffset * (1 - reentryProgress); // startOffset -> 0
          opacity = reentryProgress; // 0 -> 1
        }
      } else if (progress < arrivalPoint) {
        // Initial entrance phase (scrolling down): from +20vh to 0
        const slideProgress = progress / arrivalPoint;
        translateY = startOffset * (1 - slideProgress); // 20vh -> 0
        opacity = slideProgress; // 0 -> 1
      } else {
        // After arrival but before exit phase: stay at center
        translateY = 0;
        opacity = 1;
      }

      welcomeText.style.transform = `translate(-50%, -50%) translateY(${translateY}vh)`;
      welcomeText.style.opacity = opacity.toString();

      // Update dark overlay and reveal image opacity (staged fade-in)
      // First half of exit: dark overlay fades in (exitProgress 0 -> 0.5 maps to opacity 0 -> 1)
      // Second half of exit: wave image fades in (exitProgress 0.5 -> 1 maps to opacity 0 -> 1)
      if (darkOverlay) {
        // Dark overlay fades in during first half, stays fully visible after
        const darkOpacity = Math.min(1, exitProgress * 2); // 0->0.5 becomes 0->1
        darkOverlay.style.opacity = darkOpacity.toString();
      }

      if (revealImage) {
        // Wave image fades in during second half
        const waveOpacity = Math.max(0, (exitProgress - 0.5) * 2); // 0.5->1 becomes 0->1
        revealImage.style.opacity = waveOpacity.toString();
        // Enable pointer-events once the reveal image is visible enough
        revealImage.style.pointerEvents = waveOpacity > 0.5 ? "auto" : "none";
      }

      // Fade out video as reveal image fades in
      if (video) {
        video.style.opacity = exitProgress === 0 ? "1" : (1 - exitProgress).toString();
      }
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
      updateTextPosition(0, 0);
      updateElCapitanPosition(0);

      // Pre-load Trump video for smooth scrubbing
      if (trumpVideo) {
        trumpVideo.load();
        // Ensure it starts paused at the beginning
        trumpVideo.pause();
        trumpVideo.currentTime = 0;
      }
    };

    // Handle wheel events directly - bypasses momentum scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!video || video.readyState < 3) return;

      // Ignore trackpad momentum (very small deltaY values are typically momentum)
      // This makes the video stop immediately when you stop scrolling
      if (Math.abs(e.deltaY) < 5) return;

      // Update virtual scroll position
      virtualScroll += e.deltaY;
      virtualScroll = Math.max(0, Math.min(maxScroll, virtualScroll));

      const videoDuration = video.duration || 8;

      if (virtualScroll <= videoScrollMax) {
        // Phase 1: Video playback
        const videoProgress = virtualScroll / videoScrollMax;
        video.currentTime = startOffset + (videoDuration - startOffset) * videoProgress;
        updateTextPosition(videoProgress, 0);
        updateElCapitanPosition(0);
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax) {
        // Phase 2: Text continues sliding up off screen
        // Keep video at the end
        video.currentTime = videoDuration;

        // Calculate exit progress (0 to 1)
        const exitProgress = (virtualScroll - videoScrollMax) / textExitScrollMax;
        updateTextPosition(1, exitProgress);
        updateElCapitanPosition(0);
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax + elCapitanSlideUpMax) {
        // Phase 3: EL CAPITAN auto-slides up
        video.currentTime = videoDuration;
        updateTextPosition(1, 1); // Keep Welcome text fully exited
        updateElCapitanPosition(1); // Trigger slide up animation
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax + elCapitanSlideUpMax + elCapitanSlideRightMax) {
        // Phase 4: EL CAPITAN auto-slides right
        video.currentTime = videoDuration;
        updateTextPosition(1, 1);
        updateElCapitanPosition(2); // Trigger slide right animation
        updateTrumpVideo(0);
      } else {
        // Phase 5: Trump video scrubs with scroll
        video.currentTime = videoDuration;
        updateTextPosition(1, 1);
        updateElCapitanPosition(2);
        const trumpProgress = (virtualScroll - videoScrollMax - textExitScrollMax - elCapitanSlideUpMax - elCapitanSlideRightMax) / trumpVideoFadeMax;
        updateTrumpVideo(Math.min(1, trumpProgress)); // Progress 0 -> 1
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
        updateTextPosition(videoProgress, 0);
        updateElCapitanPosition(0);
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax) {
        // Phase 2: Text continues sliding up off screen
        video.currentTime = videoDuration;
        const exitProgress = (virtualScroll - videoScrollMax) / textExitScrollMax;
        updateTextPosition(1, exitProgress);
        updateElCapitanPosition(0);
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax + elCapitanSlideUpMax) {
        // Phase 3: EL CAPITAN auto-slides up
        video.currentTime = videoDuration;
        updateTextPosition(1, 1);
        updateElCapitanPosition(1); // Trigger slide up animation
        updateTrumpVideo(0);
      } else if (virtualScroll <= videoScrollMax + textExitScrollMax + elCapitanSlideUpMax + elCapitanSlideRightMax) {
        // Phase 4: EL CAPITAN auto-slides right
        video.currentTime = videoDuration;
        updateTextPosition(1, 1);
        updateElCapitanPosition(2); // Trigger slide right animation
        updateTrumpVideo(0);
      } else {
        // Phase 5: Trump video scrubs with scroll
        video.currentTime = videoDuration;
        updateTextPosition(1, 1);
        updateElCapitanPosition(2);
        const trumpProgress = (virtualScroll - videoScrollMax - textExitScrollMax - elCapitanSlideUpMax - elCapitanSlideRightMax) / trumpVideoFadeMax;
        updateTrumpVideo(Math.min(1, trumpProgress)); // Progress 0 -> 1
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

      {/* Dark Overlay - Fades in first after Welcome text exits */}
      <div
        ref={darkOverlayRef}
        className="absolute inset-0 bg-black"
        style={{
          zIndex: 15,
          opacity: 0,
          willChange: "opacity",
          pointerEvents: "none",
        }}
      />

      {/* Reveal Wave Image - Fades in after dark overlay */}
      <div
        ref={revealImageRef}
        className="absolute inset-0 z-20"
        style={{
          opacity: 0,
          willChange: "opacity",
          pointerEvents: "none",
        }}
      >
        <RevealWaveImage
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop"
          waveSpeed={0.2}
          waveFrequency={0.7}
          waveAmplitude={0.5}
          revealRadius={0.5}
          revealSoftness={1}
          pixelSize={2}
          mouseRadius={0.4}
          className="w-full h-full"
        />
      </div>

      {/* EL CAPITAN Text - Slides up at the bottom of scroll with split text animation */}
      <div
        ref={elCapitanRef}
        className="absolute left-1/2 top-1/2 z-30 pointer-events-none"
        style={{
          transform: "translate(-50%, -50%) translateY(100vh)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <h1
          className="text-white font-bold tracking-wider whitespace-nowrap"
          style={{
            fontSize: "clamp(4rem, 15vw, 12rem)",
            textShadow: "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.15em",
            fontFamily: "var(--font-fraunces), serif",
          }}
        >
          <SplitText
            text="EL CAPITAN"
            delay={80}
            duration={0.6}
            ease="easeOut"
            splitType="chars"
            from={{ opacity: 0, y: 50, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            trigger={showElCapitan}
          />
        </h1>
      </div>

      {/* Trump Video - Scroll-controlled at the very bottom */}
      {basePath !== null && (
        <video
          ref={trumpVideoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-40"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
            transform: "translateZ(0)",
            pointerEvents: "none",
          }}
          src={`${basePath}/videos/trump-video-scrub.mp4`}
        />
      )}
    </div>
  );
}
