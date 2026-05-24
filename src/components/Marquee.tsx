import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useAnimationFrame,
} from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────
export interface MarqueeProps {
  /** Content to scroll — rendered inside each repeated copy. */
  children: React.ReactNode;
  /**
   * Base speed in px/s.
   * @default 60
   */
  speed?: number;
  /**
   * Scroll direction.
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * Number of content copies rendered to fill the viewport seamlessly.
   * A minimum of 4 ensures no gaps on ultrawide displays.
   * @default 4
   */
  repeat?: number;
  /**
   * Multiplier the speed is reduced to on hover (0 = pause, 1 = no change).
   * @default 0.25
   */
  hoverSlowdown?: number;
  /**
   * Show gradient blur masks on left/right edges.
   * @default false
   */
  edgeFade?: boolean;
  /**
   * Width of each edge fade mask in px.
   * @default 80
   */
  edgeFadeWidth?: number;
  /** Additional class on the outermost container. */
  className?: string;
  /** Additional class on each content copy wrapper. */
  itemClassName?: string;
  /**
   * Gap between repeated items.
   * @default "3rem"
   */
  gap?: string;
  /**
   * If true, pauses the marquee completely (useful for reduced-motion).
   * @default false
   */
  paused?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────
export function Marquee({
  children,
  speed = 60,
  direction = "left",
  repeat = 4,
  hoverSlowdown = 0.25,
  edgeFade = false,
  edgeFadeWidth = 80,
  className,
  itemClassName,
  gap = "3rem",
  paused = false,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  // ── Reduced motion detection ──
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ── Measure one copy of the content ──
  useEffect(() => {
    if (!trackRef.current) return;
    const firstCopy = trackRef.current.children[0] as HTMLElement | undefined;
    if (!firstCopy) return;

    const measure = () => {
      const rect = firstCopy.getBoundingClientRect();
      setContentWidth(rect.width);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(firstCopy);
    return () => ro.disconnect();
  }, [children]);

  // ── Speed control via spring for silky hover transitions ──
  const speedTarget = useMotionValue(speed);
  const smoothSpeed = useSpring(speedTarget, {
    stiffness: 80,
    damping: 20,
    mass: 0.4,
  });

  useEffect(() => {
    if (paused || reducedMotion) {
      speedTarget.set(0);
    } else {
      speedTarget.set(hovered ? speed * hoverSlowdown : speed);
    }
  }, [hovered, speed, hoverSlowdown, paused, reducedMotion, speedTarget]);

  // ── Position driven by animation frame ──
  const x = useMotionValue(0);
  const posRef = useRef(0);
  const dirSign = direction === "left" ? -1 : 1;

  useAnimationFrame((_, delta) => {
    if (contentWidth <= 0) return;

    // delta is in ms, convert to seconds
    const dt = delta / 1000;
    const currentSpeed = smoothSpeed.get();

    posRef.current += currentSpeed * dt * dirSign;

    // Seamless wrap: reset when one full copy has scrolled past
    if (direction === "left" && posRef.current <= -contentWidth) {
      posRef.current += contentWidth;
    } else if (direction === "right" && posRef.current >= contentWidth) {
      posRef.current -= contentWidth;
    }

    x.set(posRef.current);
  });

  // ── Edge fade mask gradient ──
  const maskImage = edgeFade
    ? `linear-gradient(to right, transparent 0%, black ${edgeFadeWidth}px, black calc(100% - ${edgeFadeWidth}px), transparent 100%)`
    : undefined;

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      className={`marquee-container ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        overflow: "hidden",
        WebkitMaskImage: maskImage,
        maskImage,
      }}
      aria-hidden="true"
    >
      <motion.div
        ref={trackRef}
        style={{
          x,
          display: "inline-flex",
          gap,
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <span
            key={i}
            className={`marquee-item ${itemClassName ?? ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap,
              flexShrink: 0,
            }}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── MarqueeStack ───────────────────────────────────────────────────
/**
 * Convenience wrapper that stacks multiple Marquee rows with alternating
 * directions for a dramatic editorial effect.
 *
 * @example
 * ```tsx
 * <MarqueeStack
 *   rows={[
 *     { content: <span>PHANTOM ARCHIVE</span>, speed: 50 },
 *     { content: <span>COLLECTION 04</span>, speed: 70, direction: "right" },
 *   ]}
 *   edgeFade
 *   className="py-8"
 * />
 * ```
 */
export interface MarqueeStackRow {
  content: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  itemClassName?: string;
}

export interface MarqueeStackProps {
  rows: MarqueeStackRow[];
  /** Gap between rows. */
  gap?: string;
  edgeFade?: boolean;
  edgeFadeWidth?: number;
  className?: string;
  hoverSlowdown?: number;
}

export function MarqueeStack({
  rows,
  gap = "0.5rem",
  edgeFade = false,
  edgeFadeWidth = 80,
  className,
  hoverSlowdown,
}: MarqueeStackProps) {
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap }}
    >
      {rows.map((row, i) => (
        <Marquee
          key={i}
          speed={row.speed ?? 60}
          direction={row.direction ?? (i % 2 === 0 ? "left" : "right")}
          edgeFade={edgeFade}
          edgeFadeWidth={edgeFadeWidth}
          className={row.className}
          itemClassName={row.itemClassName}
          hoverSlowdown={hoverSlowdown}
        >
          {row.content}
        </Marquee>
      ))}
    </div>
  );
}

export default Marquee;
