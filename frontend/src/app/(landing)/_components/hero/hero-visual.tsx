"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

export default function HeroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    // Create audio context only in browser environment
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle video loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setCanPlay(true);
    };

    const handleLoadedData = () => {
      console.log("Video loaded successfully");
    };

    const handleError = (e: Event) => {
      console.error("Video error:", e);
    };

    const handleVideoPlay = () => {
      console.log("Video started playing");
      playVideoPlaySound();
    };

    const handleVideoPause = () => {
      console.log("Video paused");
      playVideoPauseSound();
    };

    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Resume audio context on first interaction
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
    };

    // Listen for any user interaction to enable audio
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("keydown", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoPause);

    // Force load the video immediately
    video.load();

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", handleVideoPlay);
      video.removeEventListener("pause", handleVideoPause);
    };
  }, []);

  // Function to play audio cue
  const playAudioCue = useCallback(
    (frequency: number, duration: number, type: "start" | "stop") => {
      if (!audioContextRef.current || !hasUserInteracted) return;

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = "sine";

      // Different envelope shapes for start vs stop
      if (type === "start") {
        // Rising tone for start
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          context.currentTime + duration
        );
      } else {
        // Falling tone for stop
        gainNode.gain.setValueAtTime(0.08, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          context.currentTime + duration
        );
      }

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    },
    [hasUserInteracted]
  );

  // Play sound indicator for video play
  const playVideoPlaySound = useCallback(() => {
    if (!audioContextRef.current || !hasUserInteracted) return;

    const context = audioContextRef.current;

    // Create a pleasant "play" sound - rising chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - C major chord

    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(freq, context.currentTime);
      oscillator.type = "sine";

      // Staggered envelope for chord effect
      const startTime = context.currentTime + index * 0.05;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.03, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }, [hasUserInteracted]);

  // Play sound indicator for video pause
  const playVideoPauseSound = useCallback(() => {
    if (!audioContextRef.current || !hasUserInteracted) return;

    const context = audioContextRef.current;

    // Create a gentle "pause" sound - descending tone
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Start higher and sweep down
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      220,
      context.currentTime + 0.3
    );
    oscillator.type = "sine";

    // Gentle fade out
    gainNode.gain.setValueAtTime(0.05, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.3
    );

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  }, [hasUserInteracted]);

  // Function to attempt video play
  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    try {
      // Try to play with audio first
      video.muted = false;
      await video.play();
      console.log("Video playing with audio");

      // Set 2x speed for first 5 seconds only if starting from beginning
      if (video.currentTime < 1) {
        video.playbackRate = 2.0;
        setTimeout(() => {
          if (video && !video.paused) {
            video.playbackRate = 1.0;
            console.log("Video speed returned to normal");
          }
        }, 5000);
      }
    } catch (error) {
      console.log("Audio autoplay blocked, trying muted first:", error);
      try {
        // Fallback to muted temporarily
        video.muted = true;
        await video.play();
        console.log("Video playing muted (will try to unmute)");

        // Try to unmute after a short delay
        setTimeout(() => {
          video.muted = false;
          console.log("Video unmuted successfully");
        }, 1000);
      } catch (mutedError) {
        console.error("Video play failed even when muted:", mutedError);
      }
    }
  }, [canPlay]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasInView = isInView;
        const nowInView = entry.isIntersecting;

        setIsInView(nowInView);

        // Resume audio context if needed
        if (
          audioContextRef.current?.state === "suspended" &&
          hasUserInteracted
        ) {
          audioContextRef.current.resume();
        }

        // Control video playback - continue from where left off
        if (videoRef.current) {
          if (!wasInView && nowInView) {
            // Video coming into view - resume playback
            attemptPlay();
            setTimeout(() => {
              playAudioCue(440, 0.3, "start"); // A note
              setTimeout(() => playAudioCue(554.37, 0.2, "start"), 100); // C# note
            }, 200);
          } else if (wasInView && !nowInView) {
            // Video going out of view - pause but don't reset
            videoRef.current.pause();
            playAudioCue(554.37, 0.2, "stop"); // C# note
            setTimeout(() => playAudioCue(440, 0.3, "stop"), 100); // A note
          }
        }
      },
      {
        threshold: 0.5, // Video will play when 50% visible
      }
    );

    // Observer for full visibility
    const fullVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsFullyVisible(entry.intersectionRatio >= 0.95);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 0.95, 1], // Multiple thresholds for better detection
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
      fullVisibilityObserver.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
        fullVisibilityObserver.unobserve(videoRef.current);
      }
    };
  }, [isInView, canPlay, hasUserInteracted, attemptPlay, playAudioCue]);

  return (
    <div className="mt-16 relative max-w-5xl mx-auto">
      <motion.div
        className="relative transition-all duration-700 group"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          ease: [0.4, 0, 0.6, 1],
          repeat: Infinity,
          repeatType: "reverse",
        }}
        whileHover={
          isFullyVisible
            ? {
                scale: 1.05,
                transition: { duration: 0.2 },
              }
            : {}
        }
      >
        {/* Video Container - Pixel 9 Mockup */}
        <div className="flex justify-center items-center">
          <motion.div
            className="relative"
            animate={{
              scale: isFullyVisible ? 0.8 : 1,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              willChange: "transform",
            }}
          >
            {/* Pixel 9 Background Image */}
            <Image
              src="/pixel_9.png"
              alt="Google Pixel 9"
              width={452}
              height={964}
              priority
              style={{
                filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3))",
              }}
            />

            {/* Camera Punch Hole */}
            <div
              className="absolute bg-black rounded-full z-20"
              style={{
                width: "30px",
                height: "30px",
                top: "32px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />

            {/* Video positioned over the phone screen */}
            <video
              ref={videoRef}
              src="/demo.webm"
              className="absolute pointer-events-none"
              loop
              playsInline
              preload="auto"
              webkit-playsinline="true"
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "412px",
                height: "924px",
                border: "none",
                objectFit: "cover",
                outline: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                borderRadius: "57px",
                overflow: "hidden",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
