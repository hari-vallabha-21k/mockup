import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import { MagneticButton } from "@/components/MagneticButton";

// ─── Easing & Spring Configs ────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;
const LIFT_SPRING = { stiffness: 260, damping: 26, mass: 0.7 };
const TILT_SPRING = { stiffness: 180, damping: 22, mass: 0.5 };

// ─── Types ──────────────────────────────────────────────────────────
export interface Product {
  id: string;
  title: string;
  price: string;
  /** Optional secondary price (e.g. original / sale) */
  priceNote?: string;
  image: string;
  /** If provided, the card cross-fades to this image on hover */
  imageAlt?: string;
  tag?: string;
}

export interface ProductCardProps {
  product: Product;
  /** Index used for stagger entrance animation */
  index?: number;
}

// ─── Component ──────────────────────────────────────────────────────
export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [altLoaded, setAltLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── 3‑D tilt tracking ──
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, TILT_SPRING);
  const sy = useSpring(ry, TILT_SPRING);
  const transform3d = useMotionTemplate`perspective(900px) rotateX(${sx}deg) rotateY(${sy}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rx.set((0.5 - py) * 6);
    ry.set((px - 0.5) * 6);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      /* ── Entrance animation ── */
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.85,
        ease: EASE,
        delay: index * 0.1,
      }}
      /* ── Hover lift ── */
      animate={
        hovered
          ? { y: -8, boxShadow: "0 28px 60px -14px rgba(0,0,0,0.22)" }
          : { y: 0, boxShadow: "0 2px 12px -4px rgba(0,0,0,0.06)" }
      }
      style={{
        transform: transform3d,
        transformStyle: "preserve-3d",
      }}
      className="product-card group relative flex flex-col cursor-pointer will-change-transform"
    >
      {/* ── Image Container ── */}
      <div className="product-card__image-wrap relative w-full aspect-[3/4] overflow-hidden bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]">
        {/* Shimmer placeholder */}
        {!primaryLoaded && (
          <div className="absolute inset-0 shimmer pointer-events-none z-10" />
        )}

        {/* Primary image — zoom on hover */}
        <motion.img
          src={product.image}
          alt={product.title}
          onLoad={() => setPrimaryLoaded(true)}
          animate={{
            scale: hovered ? 1.06 : 1,
          }}
          transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Secondary image cross-fade */}
        {product.imageAlt && (
          <>
            {/* hidden preloader */}
            <img
              src={product.imageAlt}
              alt=""
              onLoad={() => setAltLoaded(true)}
              className="sr-only"
              aria-hidden
            />
            <AnimatePresence>
              {hovered && altLoaded && (
                <motion.img
                  key="alt-img"
                  src={product.imageAlt}
                  alt={`${product.title} — alternate view`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: 1.06 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Tag badge */}
        {product.tag && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 + index * 0.1 }}
            className="absolute top-3 left-3 z-20 bg-primary text-on-primary text-[9px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 select-none"
          >
            {product.tag}
          </motion.span>
        )}

        {/* Quick‑action bar — slides up on hover */}
        <motion.div
          initial={false}
          animate={hovered ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-4 py-3 pointer-events-none"
        >
          <MagneticButton
            range={10}
            scale={1.04}
            className="product-card__quick-add pointer-events-auto bg-black text-white glow-white text-[10px] tracking-[0.2em] uppercase font-semibold px-6 py-2.5 transition-all duration-300 hover:tracking-[0.28em] select-none border-none outline-none"
          >
            QUICK ADD +
          </MagneticButton>
        </motion.div>
      </div>

      {/* ── Info Section ── */}
      <div className="product-card__info pt-4 pb-2 px-1 flex flex-col gap-1">
        <motion.h3
          animate={hovered ? { y: -3 } : { y: 0 }}
          transition={{ type: "spring", ...LIFT_SPRING }}
          className="text-[12px] tracking-[0.08em] uppercase font-semibold leading-tight truncate"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {product.title}
        </motion.h3>

        <motion.div
          animate={hovered ? { y: -2 } : { y: 0 }}
          transition={{ type: "spring", ...LIFT_SPRING, delay: 0.02 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-[13px] font-bold tracking-tight">
            {product.price}
          </span>
          {product.priceNote && (
            <span className="text-[10px] tracking-[0.1em] text-on-surface-variant line-through">
              {product.priceNote}
            </span>
          )}
        </motion.div>
      </div>

      {/* ── Bottom accent line ── */}
      <motion.div
        initial={false}
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ transformOrigin: "left" }}
        className="h-[2px] bg-primary w-full"
      />
    </motion.article>
  );
}

export default ProductCard;
