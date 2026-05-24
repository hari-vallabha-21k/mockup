import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export interface InteractiveImageProps {
  /** The URL of the image */
  src: string;
  /** Image accessibility text */
  alt: string;
  /** Outer container element classes (default: 'w-full h-full') */
  className?: string;
  /** Styling applied directly to the image */
  imageClassName?: string;
  /** Maximum translation distance in pixels (default: 16) */
  cursorParallaxRange?: number;
  /** Zoom image slightly on hover (default: true) */
  hoverZoom?: boolean;
  /** Image focus position alignment (default: 'center') */
  objectPosition?: string;
  /** Custom spring configuration for cursor tracking */
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export function InteractiveImage({
  src,
  alt,
  className = "w-full h-full",
  imageClassName = "",
  cursorParallaxRange = 16,
  hoverZoom = true,
  objectPosition = "center",
  springConfig = { stiffness: 80, damping: 22, mass: 0.4 },
}: InteractiveImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Motion values for tracking cursor translation offsets
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to interpolate raw mouse positions
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Detect coarse-pointer input devices (touch screens) to disable cursor listeners
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsMobile(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to the center of the visual container
    const relativeX = e.clientX - (rect.left + width / 2);
    const relativeY = e.clientY - (rect.top + height / 2);

    // Normalize coordinates (-1 to 1) relative to container boundaries
    const px = relativeX / (width / 2);
    const py = relativeY / (height / 2);

    // Translate the image opposite to the cursor to simulate 3D background depth.
    // Clamping coordinates ensures smooth performance and subtle action.
    x.set(-px * cursorParallaxRange);
    y.set(-py * cursorParallaxRange);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly reset back to the center position
    x.set(0);
    y.set(0);
  };

  // Preloading check for cache hits
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  // Compensate for translation limits: we scale the image base size up slightly
  // to ensure visual borders are never revealed during movement.
  const baseScale = 1.05;
  const hoverScale = 1.12;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        // Maintain layout-integrity and hover trigger response
        pointerEvents: "auto",
      }}
    >
      {/* Shimmer loading skeleton */}
      {!loaded && (
        <div className="absolute inset-0 shimmer pointer-events-none z-10" />
      )}

      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          x: isMobile ? 0 : smoothX,
          y: isMobile ? 0 : smoothY,
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          objectPosition,
          // Preserves hardware acceleration
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          scale: hoverZoom && isHovered ? hoverScale : baseScale,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`object-cover ${imageClassName} transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />
    </div>
  );
}

export default InteractiveImage;
