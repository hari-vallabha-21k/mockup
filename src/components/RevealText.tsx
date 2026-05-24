import React, { useMemo } from "react";
import { motion, type Variants, type TargetAndTransition, type BezierDefinition } from "framer-motion";

// ─── Easing Presets ─────────────────────────────────────────────────
const EASE_CINEMATIC: BezierDefinition = [0.22, 1, 0.36, 1];
const EASE_EDITORIAL: BezierDefinition = [0.16, 1, 0.3, 1];

// ─── Granularity Types ──────────────────────────────────────────────
type RevealMode = "word" | "line" | "char";

// ─── Shared Props ───────────────────────────────────────────────────
interface RevealBaseProps {
  /** Text to reveal. For "line" mode, use `\n` or pass an array via `lines`. */
  text?: string;
  /** Explicit lines array (takes precedence over splitting `text` by `\n`). */
  lines?: string[];
  /** Reveal granularity: word-by-word, line-by-line, or character-by-character. */
  mode?: RevealMode;
  /** Additional class applied to the outermost wrapper. */
  className?: string;
  /** Stagger delay between each animated unit (seconds). Default varies by mode. */
  stagger?: number;
  /** Base duration for each unit's reveal (seconds). */
  duration?: number;
  /** Extra delay before the first unit animates (seconds). */
  delay?: number;
  /** Vertical distance each unit travels upward (px or %). */
  yOffset?: number | string;
  /** Horizontal distance each unit travels (px). 0 = no horizontal motion. */
  xOffset?: number;
  /** Viewport amount (0–1) needed to trigger. */
  viewportAmount?: number;
  /** If true, animation replays each time the element enters the viewport. */
  replay?: boolean;
  /** Easing preset. "cinematic" is smoother; "editorial" is snappier. */
  ease?: "cinematic" | "editorial";
  /** If true, uses a mask-clip / overflow-hidden "wipe" reveal per unit. */
  clipReveal?: boolean;
}

// ─── Heading Reveal ─────────────────────────────────────────────────
export interface RevealHeadingProps extends RevealBaseProps {
  /** Semantic heading level. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Optional inline style forwarded to the heading element. */
  style?: React.CSSProperties;
}

// ─── Paragraph Reveal ───────────────────────────────────────────────
export interface RevealParagraphProps extends RevealBaseProps {
  as?: "p" | "blockquote" | "span" | "div";
  style?: React.CSSProperties;
}

// ─── Line-reveal accent bar ─────────────────────────────────────────
export interface RevealLineProps {
  className?: string;
  delay?: number;
  duration?: number;
  /** Direction the line grows from. */
  origin?: "left" | "right" | "center";
  viewportAmount?: number;
  replay?: boolean;
}

// ─── Utilities ──────────────────────────────────────────────────────
function splitUnits(text: string, mode: RevealMode, lines?: string[]): string[] {
  if (mode === "line") {
    if (lines && lines.length > 0) return lines;
    return text.split("\n").filter((l) => l.length > 0);
  }
  if (mode === "char") {
    return text.split("");
  }
  // word
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

function defaultStagger(mode: RevealMode): number {
  switch (mode) {
    case "char":
      return 0.025;
    case "word":
      return 0.045;
    case "line":
      return 0.1;
  }
}

function defaultDuration(mode: RevealMode): number {
  switch (mode) {
    case "char":
      return 0.65;
    case "word":
      return 0.75;
    case "line":
      return 0.9;
  }
}

function defaultYOffset(mode: RevealMode, clipReveal: boolean): number | string {
  if (clipReveal) return "110%";
  switch (mode) {
    case "char":
      return 24;
    case "word":
      return 32;
    case "line":
      return 50;
  }
}

// ─── Variant Factories ──────────────────────────────────────────────
function makeContainerVariants(
  staggerVal: number,
  delayVal: number,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerVal,
        delayChildren: delayVal,
      },
    },
  };
}

function makeUnitVariants(
  duration: number,
  yOffset: number | string,
  xOffset: number,
  ease: BezierDefinition,
  clipReveal: boolean,
): Variants {
  const hidden: TargetAndTransition = clipReveal
    ? { y: yOffset }
    : { opacity: 0, y: yOffset, ...(xOffset ? { x: xOffset } : {}) };
  const visible: TargetAndTransition = clipReveal
    ? { y: "0%", transition: { duration, ease } }
    : {
        opacity: 1,
        y: 0,
        ...(xOffset ? { x: 0 } : {}),
        transition: { duration, ease },
      };
  return { hidden, visible };
}

// ─── Inner renderer ─────────────────────────────────────────────────
function RevealInner({
  text = "",
  lines,
  mode = "word",
  stagger: staggerProp,
  duration: durationProp,
  delay = 0,
  yOffset: yOffsetProp,
  xOffset = 0,
  viewportAmount = 0.2,
  replay = false,
  ease = "cinematic",
  clipReveal = false,
}: RevealBaseProps) {
  const easeArr = ease === "editorial" ? EASE_EDITORIAL : EASE_CINEMATIC;
  const staggerVal = staggerProp ?? defaultStagger(mode);
  const durationVal = durationProp ?? defaultDuration(mode);
  const yOffset = yOffsetProp ?? defaultYOffset(mode, clipReveal);

  const units = useMemo(() => splitUnits(text, mode, lines), [text, mode, lines]);

  const containerVariants = useMemo(
    () => makeContainerVariants(staggerVal, delay),
    [staggerVal, delay],
  );

  const unitVariants = useMemo(
    () => makeUnitVariants(durationVal, yOffset, xOffset, easeArr, clipReveal),
    [durationVal, yOffset, xOffset, easeArr, clipReveal],
  );

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: viewportAmount }}
      style={{ display: mode === "line" ? "block" : "inline" }}
      aria-label={lines ? lines.join(" ") : text}
    >
      {units.map((unit, i) => {
        const isSpace = /^\s+$/.test(unit);

        if (isSpace) {
          // Preserve whitespace as non-animated spacers
          return (
            <span key={`sp-${i}`} style={{ display: "inline" }}>
              {unit === " " ? "\u00A0" : unit}
            </span>
          );
        }

        if (clipReveal) {
          // Mask reveal: each unit is inside an overflow-hidden wrapper
          return (
            <span
              key={i}
              style={{
                display: mode === "line" ? "block" : "inline-block",
                overflow: "hidden",
                verticalAlign: mode === "line" ? undefined : "top",
              }}
            >
              <motion.span
                variants={unitVariants}
                style={{
                  display: mode === "line" ? "block" : "inline-block",
                  willChange: "transform",
                }}
              >
                {unit}
              </motion.span>
            </span>
          );
        }

        // Standard opacity + translate reveal
        return (
          <motion.span
            key={i}
            variants={unitVariants}
            style={{
              display: mode === "line" ? "block" : "inline-block",
              willChange: "transform, opacity",
            }}
          >
            {unit}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

// ─── RevealHeading ──────────────────────────────────────────────────
/**
 * Cinematic scroll-triggered heading reveal.
 *
 * @example
 * ```tsx
 * <RevealHeading
 *   as="h2"
 *   text="PHANTOM ARCHIVE"
 *   mode="char"
 *   clipReveal
 *   className="text-[80px] font-extrabold tracking-tighter"
 * />
 * ```
 */
export function RevealHeading({
  as: Tag = "h2",
  className,
  style,
  mode = "word",
  clipReveal = true,
  ease = "cinematic",
  stagger,
  duration,
  yOffset,
  ...rest
}: RevealHeadingProps) {
  return (
    <Tag className={className} style={style} aria-hidden={undefined}>
      <RevealInner
        mode={mode}
        clipReveal={clipReveal}
        ease={ease}
        stagger={stagger ?? (mode === "char" ? 0.03 : undefined)}
        duration={duration ?? (mode === "char" ? 0.8 : undefined)}
        yOffset={yOffset}
        {...rest}
      />
    </Tag>
  );
}

// ─── RevealParagraph ────────────────────────────────────────────────
/**
 * Subtle scroll-triggered paragraph / body text reveal.
 * Defaults to word-by-word with soft opacity + upward motion.
 *
 * @example
 * ```tsx
 * <RevealParagraph
 *   text="Exploring the tension between physical garment construction and the ephemeral nature of light."
 *   className="text-base text-secondary max-w-xs leading-6"
 * />
 * ```
 */
export function RevealParagraph({
  as: Tag = "p",
  className,
  style,
  mode = "word",
  clipReveal = false,
  ease = "editorial",
  stagger,
  duration,
  yOffset,
  ...rest
}: RevealParagraphProps) {
  return (
    <Tag className={className} style={style}>
      <RevealInner
        mode={mode}
        clipReveal={clipReveal}
        ease={ease}
        stagger={stagger ?? 0.025}
        duration={duration ?? 0.55}
        yOffset={yOffset ?? 18}
        {...rest}
      />
    </Tag>
  );
}

// ─── RevealLine ─────────────────────────────────────────────────────
/**
 * Horizontal rule / accent line that grows on scroll.
 *
 * @example
 * ```tsx
 * <RevealLine className="w-full h-px bg-primary mb-4" origin="left" />
 * ```
 */
export function RevealLine({
  className,
  delay = 0.15,
  duration = 0.9,
  origin = "left",
  viewportAmount = 0.2,
  replay = false,
}: RevealLineProps) {
  const originX =
    origin === "left" ? 0 : origin === "right" ? 1 : 0.5;

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: !replay, amount: viewportAmount }}
      transition={{ duration, ease: EASE_CINEMATIC, delay }}
      style={{ transformOrigin: `${originX * 100}% 50%` }}
      className={className}
    />
  );
}

// ─── RevealSection ──────────────────────────────────────────────────
/**
 * Container-level stagger wrapper for grouping multiple reveal elements.
 * Wraps children and orchestrates staggered entry as the section enters viewport.
 *
 * @example
 * ```tsx
 * <RevealSection className="py-16 px-6">
 *   <RevealHeading text="TITLE" />
 *   <RevealParagraph text="Body copy..." />
 * </RevealSection>
 * ```
 */
export function RevealSection({
  children,
  className,
  stagger = 0.12,
  delay = 0,
  viewportAmount = 0.15,
  replay = false,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  viewportAmount?: number;
  replay?: boolean;
}) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: viewportAmount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── RevealFadeUp ───────────────────────────────────────────────────
/**
 * Simple fade-up wrapper for arbitrary children (images, buttons, etc.)
 * that participates in parent RevealSection stagger orchestration.
 */
export function RevealFadeUp({
  children,
  className,
  y = 40,
  duration = 0.85,
  ease = "cinematic",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  ease?: "cinematic" | "editorial";
}) {
  const easeArr = ease === "editorial" ? EASE_EDITORIAL : EASE_CINEMATIC;
  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: easeArr },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

export default RevealHeading;
