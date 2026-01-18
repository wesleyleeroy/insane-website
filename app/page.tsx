"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const welcomeText = welcomeTextRef.current;
    if (!video) return;

    const startOffset = 0.1;
    const maxScroll = 4 * window.innerHeight; // 500vh - 100vh = 400vh of scroll

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
    };

    // Handle wheel events directly - bypasses momentum scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!video || video.readyState < 3) return;

      // Update virtual scroll position
      virtualScroll += e.deltaY;
      virtualScroll = Math.max(0, Math.min(maxScroll, virtualScroll));

      // Calculate progress and update video
      const progress = virtualScroll / maxScroll;
      const videoDuration = video.duration || 8;

      video.currentTime = startOffset + (videoDuration - startOffset) * progress;
      updateTextPosition(progress);
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

      const progress = virtualScroll / maxScroll;
      const videoDuration = video.duration || 8;
      video.currentTime = startOffset + (videoDuration - startOffset) * progress;
      updateTextPosition(progress);
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
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"
          }`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        src="/videos/background-60fps.mp4"
        onError={() => setIsReady(true)}
      />

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
    </div>
  );
}
