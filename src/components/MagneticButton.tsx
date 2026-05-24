import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";

export interface MagneticButtonProps
  extends HTMLMotionProps<"button"> {
  /** Maximum translation distance in pixels (default: 18) */
  range?: number;
  /** Scale factor on hover (default: 1.06) */
  scale?: number;
  /** Stiffness of the translation springs (default: 120) */
  stiffness?: number;
  /** Damping of the translation springs (default: 15) */
  damping?: number;
  /** Mass of the translation springs (default: 0.5) */
  mass?: number;
  /** Enable secondary offset for children text/icon (parallax effect, default: true) */
  magneticContent?: boolean;
  /** Ratio of inner content motion to outer button motion (default: 0.35) */
  contentRangeFactor?: number;
}

export function MagneticButton({
  children,
  className = "",
  range = 18,
  scale = 1.06,
  stiffness = 120,
  damping = 15,
  mass = 0.5,
  magneticContent = true,
  contentRangeFactor = 0.35,
  onMouseMove,
  onMouseLeave,
  onMouseEnter,
  ...props
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Position motion values for the button translation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Content-specific motion values for secondary parallax
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  // Spring animations for translation
  const springConfig = { stiffness, damping, mass };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Content springs (slightly faster/lighter for responsiveness)
  const contentSpringConfig = {
    stiffness: stiffness * 1.35,
    damping: damping * 1.1,
    mass: mass * 0.8,
  };
  const springCx = useSpring(cx, contentSpringConfig);
  const springCy = useSpring(cy, contentSpringConfig);

  // Scale spring
  const scaleValue = useMotionValue(1);
  const springScale = useSpring(scaleValue, { stiffness: 220, damping: 14 });

  // Detect touch devices (graceful fallback)
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

    // Mouse coordinates relative to the center of the static container
    const mouseX = e.clientX - (rect.left + width / 2);
    const mouseY = e.clientY - (rect.top + height / 2);

    // Normalized coordinates (-1 to 1) relative to center
    const px = mouseX / (width / 2);
    const py = mouseY / (height / 2);

    // Apply translations
    x.set(px * range);
    y.set(py * range);

    if (magneticContent) {
      cx.set(px * range * contentRangeFactor);
      cy.set(py * range * contentRangeFactor);
    }

    // Set custom properties for background hover radial radial gradients (::after styling)
    const btn = container.querySelector(".magnetic-btn-inner");
    if (btn instanceof HTMLElement) {
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      btn.style.setProperty("--mx", `${(relativeX / width) * 100}%`);
      btn.style.setProperty("--my", `${(relativeY / height) * 100}%`);
    }

    if (onMouseMove) {
      // Cast the container event to match button signature expected by listeners
      onMouseMove(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile) {
      scaleValue.set(scale);
    }
    if (onMouseEnter) {
      onMouseEnter(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(0);
    y.set(0);
    cx.set(0);
    cy.set(0);
    scaleValue.set(1);

    if (onMouseLeave) {
      onMouseLeave(e as unknown as React.MouseEvent<HTMLButtonElement>);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      style={{
        // Padding provides the extended outer cursor capture zone,
        // negative margin maintains pixel-perfect positioning flow.
        padding: isMobile ? "0px" : "14px",
        margin: isMobile ? "0px" : "-14px",
      }}
    >
      <motion.button
        {...props}
        style={{
          x: springX,
          y: springY,
          scale: springScale,
          transformStyle: "preserve-3d",
          ...props.style,
        }}
        className={`magnetic-btn magnetic-btn-inner ${className}`}
      >
        {magneticContent ? (
          <motion.div
            style={{
              x: springCx,
              y: springCy,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 10,
            }}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </motion.button>
    </div>
  );
}

export default MagneticButton;
