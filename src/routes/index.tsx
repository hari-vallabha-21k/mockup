import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import { MagneticButton } from "@/components/MagneticButton";
import { InteractiveImage } from "@/components/InteractiveImage";
import {
  RevealHeading,
  RevealParagraph,
  RevealLine,
  RevealSection,
  RevealFadeUp,
} from "@/components/RevealText";

export const Route = createFileRoute("/")({
  component: Index,
});

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmAa1eNW2K5uzxfSZ6ilUEQqZp7iH4GIFiLzTXd9U-cMbPCzyRK0BN5i6F9X6IWE_8cs4UsJPUVqK0DlueMEHQgfVrGNbd9ExEaaLd3G-cI4OLyiJ2fmAS2sAb-4hjj_I2jBJnjRctI4y_BXzZMazYaaPrWmMRempZuUmPv7gMjVj6WnCWX7KW1HVA5bHlv70D55UwKNr1YtM74e9QxYNJajyGKV_kS6vMxbG1SsNjD6zT1XPE-fq2SMX9mCfoC547R-eMHEnPGNg";
const LOOK_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cd8A42KrbbrW_0Em91dejghrZ3hjk9fFbKvVB_NRkPVkuicwmRJV93Gyyu38ERy2W_8Sz_eVHI6X1Rf0YVb8ttHKoA9F43fM7oqbdeKOft3Rw9FQDw7sueiggb-kYjGQZCPH5iADrWXqqG5W5VZVjenGOgu8EuMgJ1mhp6quWJoCeZz5Mcwp6AnAi4iah_Y0nohWi_Tky1sN3kmcWpSH4yrctRTCJO1gvEZzGXo75wpFffmIYQLkgCVVIyMu3b58b1G6Oum0kpEj";
const LOOK_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAFwC_1XArTAr0Xlvg4u9xJKDUntHstt1_8UV5Fc7eRj5wbqjUYdyXZl5m7s7MA3VTKej5jDoHp4RaW5VGdtIwmqlvQIJKja-N9LvBxK0lqOKr_VdiKWjxNqHq3661K7aGsXOvx_St5rBmKoXC3ZxM5yuW84vjPeR6IeLDS54Dh72bUzgeeTqzcnZtqBhl7_pJN9IXoJ3OOH0CZ18SEkbpCBRBC4wD2PwTiNYzh4shY_H9-cNQNkStXMTh7d84DJtmE6FLa7wYz9aw-";
const LOOK_3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTWzD6ToVXURE4IVphrtX7oP-LWChygSfY8ita7OVzd03pwQpAMzdyCNOawdCZhVMO0DiseB9pYrN4fioBat8f2zMm0N1boPYLEaEKNe549DW0ilD0669ZIme5bvi69YM8Skf2H0lSyup45BjSgWEyxBqEY1FcO11seXGESsJCvWBJfDR7PIoGIV5gs7eFCgHHi0Tbwu3HDlJI2jhifi4N9E1kYeIX2fiP4jk59EU774YSctGhq5uV6_AGkopmNwtUFdXVZWFvMMh";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { stiffness: 150, damping: 20, mass: 0.5 };

// ── Product catalogue ──
const PRODUCTS: Product[] = [
  {
    id: "phantom-shell-jacket",
    title: "PHANTOM SHELL JACKET",
    price: "₹4,800",
    tag: "NEW",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cd8A42KrbbrW_0Em91dejghrZ3hjk9fFbKvVB_NRkPVkuicwmRJV93Gyyu38ERy2W_8Sz_eVHI6X1Rf0YVb8ttHKoA9F43fM7oqbdeKOft3Rw9FQDw7sueiggb-kYjGQZCPH5iADrWXqqG5W5VZVjenGOgu8EuMgJ1mhp6quWJoCeZz5Mcwp6AnAi4iah_Y0nohWi_Tky1sN3kmcWpSH4yrctRTCJO1gvEZzGXo75wpFffmIYQLkgCVVIyMu3b58b1G6Oum0kpEj",
    imageAlt: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTWzD6ToVXURE4IVphrtX7oP-LWChygSfY8ita7OVzd03pwQpAMzdyCNOawdCZhVMO0DiseB9pYrN4fioBat8f2zMm0N1boPYLEaEKNe549DW0ilD0669ZIme5bvi69YM8Skf2H0lSyup45BjSgWEyxBqEY1FcO11seXGESsJCvWBJfDR7PIoGIV5gs7eFCgHHi0Tbwu3HDlJI2jhifi4N9E1kYeIX2fiP4jk59EU774YSctGhq5uV6_AGkopmNwtUFdXVZWFvMMh",
  },
  {
    id: "void-cargo-pant",
    title: "VOID CARGO PANT",
    price: "₹3,200",
    priceNote: "₹3,800",
    tag: "ARCHIVE",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFwC_1XArTAr0Xlvg4u9xJKDUntHstt1_8UV5Fc7eRj5wbqjUYdyXZl5m7s7MA3VTKej5jDoHp4RaW5VGdtIwmqlvQIJKja-N9LvBxK0lqOKr_VdiKWjxNqHq3661K7aGsXOvx_St5rBmKoXC3ZxM5yuW84vjPeR6IeLDS54Dh72bUzgeeTqzcnZtqBhl7_pJN9IXoJ3OOH0CZ18SEkbpCBRBC4wD2PwTiNYzh4shY_H9-cNQNkStXMTh7d84DJtmE6FLa7wYz9aw-",
    imageAlt: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmAa1eNW2K5uzxfSZ6ilUEQqZp7iH4GIFiLzTXd9U-cMbPCzyRK0BN5i6F9X6IWE_8cs4UsJPUVqK0DlueMEHQgfVrGNbd9ExEaaLd3G-cI4OLyiJ2fmAS2sAb-4hjj_I2jBJnjRctI4y_BXzZMazYaaPrWmMRempZuUmPv7gMjVj6WnCWX7KW1HVA5bHlv70D55UwKNr1YtM74e9QxYNJajyGKV_kS6vMxbG1SsNjD6zT1XPE-fq2SMX9mCfoC547R-eMHEnPGNg",
  },
  {
    id: "oxide-tee",
    title: "OXIDE OVERSIZED TEE",
    price: "₹1,850",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTWzD6ToVXURE4IVphrtX7oP-LWChygSfY8ita7OVzd03pwQpAMzdyCNOawdCZhVMO0DiseB9pYrN4fioBat8f2zMm0N1boPYLEaEKNe549DW0ilD0669ZIme5bvi69YM8Skf2H0lSyup45BjSgWEyxBqEY1FcO11seXGESsJCvWBJfDR7PIoGIV5gs7eFCgHHi0Tbwu3HDlJI2jhifi4N9E1kYeIX2fiP4jk59EU774YSctGhq5uV6_AGkopmNwtUFdXVZWFvMMh",
  },
  {
    id: "stitch-utility-vest",
    title: "STITCH UTILITY VEST",
    price: "₹4,200",
    tag: "LIMITED",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzmAa1eNW2K5uzxfSZ6ilUEQqZp7iH4GIFiLzTXd9U-cMbPCzyRK0BN5i6F9X6IWE_8cs4UsJPUVqK0DlueMEHQgfVrGNbd9ExEaaLd3G-cI4OLyiJ2fmAS2sAb-4hjj_I2jBJnjRctI4y_BXzZMazYaaPrWmMRempZuUmPv7gMjVj6WnCWX7KW1HVA5bHlv70D55UwKNr1YtM74e9QxYNJajyGKV_kS6vMxbG1SsNjD6zT1XPE-fq2SMX9mCfoC547R-eMHEnPGNg",
    imageAlt: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cd8A42KrbbrW_0Em91dejghrZ3hjk9fFbKvVB_NRkPVkuicwmRJV93Gyyu38ERy2W_8Sz_eVHI6X1Rf0YVb8ttHKoA9F43fM7oqbdeKOft3Rw9FQDw7sueiggb-kYjGQZCPH5iADrWXqqG5W5VZVjenGOgu8EuMgJ1mhp6quWJoCeZz5Mcwp6AnAi4iah_Y0nohWi_Tky1sN3kmcWpSH4yrctRTCJO1gvEZzGXo75wpFffmIYQLkgCVVIyMu3b58b1G6Oum0kpEj",
  },
];

/* Animation variants moved to @/components/RevealText */

function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, SPRING);
  const sy = useSpring(ry, SPRING);
  const transform = useMotionTemplate`perspective(1100px) rotateX(${sx}deg) rotateY(${sy}deg)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * max);
    ry.set((px - 0.5) * max);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={`tilt-card ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}





function Index() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.3 });

  const heroBgY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroContentOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 400], [0, -40]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="overflow-x-hidden bg-surface text-primary"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: progressScale, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
      />

      {/* TopNav */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className={`fixed top-0 left-0 w-full h-[60px] z-50 border-b border-primary flex justify-between items-center px-6 md:px-16 transition-all duration-500 ${scrolled ? "bg-surface/85 backdrop-blur-md" : "bg-surface"
          }`}
      >
        <div className="text-2xl font-extrabold tracking-tighter" style={{ fontFamily: "Syne, sans-serif" }}>
          GRUMB
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-[12px] tracking-[0.15em] uppercase font-bold link-underline">
            COLLECTION_04 // PHANTOM_ARCHIVE
          </a>
        </div>
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="text-[12px] tracking-[0.15em] uppercase link-underline cursor-pointer relative flex items-center gap-2"
        >
          BAG
          <span className="relative inline-flex items-center justify-center">
            (0)
            <motion.span
              className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>
      </motion.nav>

      {/* Hero */}
      <header ref={heroRef} className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
          <motion.h1
            style={{
              y: heroBgY,
              fontFamily: "Syne, sans-serif",
              fontSize: "25vw",
              letterSpacing: "-0.05em",
            }}
            className="leading-none tracking-tighter opacity-5 mix-blend-multiply font-extrabold"
          >
            GRUMB_04
          </motion.h1>
        </div>

        <motion.div
          style={{ opacity: heroContentOpacity, y: heroContentY }}
          className="relative z-20 w-full md:w-1/2 h-full flex flex-col justify-end p-6 md:p-16"
        >
          <div className="max-w-xl">
            <RevealParagraph
              text="WEAR ART, WEAR IDENTITY // DROP 2024"
              mode="word"
              delay={0.6}
              stagger={0.04}
              duration={0.6}
              yOffset={0}
              xOffset={-20}
              className="text-[11px] tracking-[0.2em] uppercase mb-4 text-on-surface-variant font-semibold"
            />
            <RevealHeading
              as="h2"
              text={"PHANTOM\nARCHIVE"}
              mode="line"
              clipReveal
              stagger={0.12}
              duration={0.9}
              className="mb-8 leading-[0.85] tracking-tighter font-extrabold text-[80px] md:text-[120px]"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
              viewportAmount={0}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 1.4 }}
              className="flex flex-wrap items-center gap-4 mt-16"
            >
              <MagneticButton
                range={20}
                scale={1.05}
                className="relative overflow-hidden border border-primary bg-black text-white glow-white text-[11px] tracking-[0.2em] uppercase font-semibold px-8 py-4 group hover:tracking-[0.28em] transition-all duration-300"
              >
                <span className="relative z-10">
                  EXPLORE ARCHIVE
                </span>
              </MagneticButton>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-[12px] tracking-[0.15em] uppercase"
              >
                [ ↓ SCROLL DOWN ]
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute top-0 right-0 w-full md:w-3/5 h-full z-0 md:z-10 overflow-hidden">
          <motion.div
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            className="w-full h-full"
          >
            <TiltCard className="w-full h-full" max={6}>
              <InteractiveImage
                src={HERO_IMG}
                alt="Editorial portrait — model in architectural black streetwear under stark studio light"
                imageClassName="grayscale brightness-90 hover:grayscale-0 transition-all duration-700 ease-in-out"
                cursorParallaxRange={20}
                hoverZoom={true}
                objectPosition="top"
              />
            </TiltCard>
          </motion.div>
        </div>
      </header>

      {/* Marquee */}
      <div className="border-t border-b border-primary py-3">
        <Marquee
          speed={55}
          direction="left"
          hoverSlowdown={0.2}
          gap="3rem"
          edgeFade
          edgeFadeWidth={60}
        >
          <span className="text-[11px] tracking-[0.3em] uppercase font-semibold flex items-center gap-12">
            <span>STRUCTURED VOID</span><span className="marquee-sep">·</span>
            <span>PHANTOM ARCHIVE</span><span className="marquee-sep">·</span>
            <span>COLLECTION 04</span><span className="marquee-sep">·</span>
            <span>GRUMB STUDIO</span><span className="marquee-sep">·</span>
            <span>SEASONAL DROP 2024</span><span className="marquee-sep">·</span>
            <span>BLACK OXIDE</span><span className="marquee-sep">·</span>
          </span>
        </Marquee>
      </div>

      {/* Asymmetrical Intro */}
      <RevealSection className="py-16 px-6 md:px-16" viewportAmount={0.2} stagger={0.15}>
        <div className="grid grid-cols-12 gap-0">
          <RevealFadeUp className="col-span-12 md:col-span-4 md:border-r border-primary pb-8 md:pr-8">
            <RevealParagraph
              text="01 / CONCEPT"
              mode="word"
              stagger={0.04}
              duration={0.5}
              yOffset={12}
              className="text-[11px] uppercase tracking-[0.2em] mb-2 text-on-surface-variant font-semibold"
            />
            <RevealHeading
              as="h3"
              text={"STRUCTURED\nVOID"}
              mode="line"
              clipReveal
              stagger={0.1}
              duration={0.85}
              delay={0.1}
              className="mb-4 text-[48px] leading-[40px] tracking-tighter font-extrabold"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
            />
            <RevealParagraph
              text="Exploring the tension between physical garment construction and the ephemeral nature of light. A collection defined by what is missing."
              mode="word"
              delay={0.25}
              className="text-base text-secondary max-w-xs leading-6"
            />
          </RevealFadeUp>
          <RevealFadeUp className="col-span-12 md:col-span-8 flex justify-end items-end p-8 overflow-hidden">
            <motion.span
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 0.1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              className="leading-none font-extrabold text-[160px] md:text-[280px] block"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
            >
              04
            </motion.span>
          </RevealFadeUp>
        </div>
      </RevealSection>

      {/* Lookbook */}
      <section className="border-t border-primary overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-primary">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE }}
            className="md:col-span-7 md:border-r border-primary overflow-hidden group"
          >
            <TiltCard className="relative aspect-[4/5] overflow-hidden lift-card" max={5}>
              <InteractiveImage
                src={LOOK_1}
                alt="Look 01 — full body lookbook against brutalist white wall"
                imageClassName="grayscale"
                cursorParallaxRange={16}
                hoverZoom={true}
              />
              <div className="absolute bottom-0 left-0 p-4 bg-primary text-on-primary text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity font-semibold z-10">
                LOOK_01 / SHELL
              </div>
            </TiltCard>
          </motion.div>

          <div className="md:col-span-5 flex flex-col">
            <RevealSection
              stagger={0.08}
              className="flex-1 p-8 border-b border-primary flex flex-col justify-center"
              viewportAmount={0.3}
            >
              <RevealFadeUp>
                <RevealParagraph
                  text="SPECIFICATIONS"
                  mode="word"
                  stagger={0.04}
                  duration={0.5}
                  yOffset={12}
                  className="text-[11px] uppercase tracking-[0.2em] mb-2 font-semibold"
                />
              </RevealFadeUp>
              <ul className="space-y-2">
                {[
                  ["MATERIAL", "MATTE POLY / 400G"],
                  ["CONSTRUCTION", "STITCHED SEAM"],
                  ["HARDWARE", "BLACK OXIDE ZIP"],
                ].map(([k, v]) => (
                  <RevealFadeUp key={k} y={24} duration={0.7}>
                    <li className="flex justify-between text-[12px] tracking-[0.05em] uppercase border-b border-outline-variant pb-1 font-medium">
                      <span>{k}</span>
                      <span>{v}</span>
                    </li>
                  </RevealFadeUp>
                ))}
              </ul>
            </RevealSection>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: EASE }}
              className="flex-1 overflow-hidden group"
            >
              <TiltCard className="relative aspect-square overflow-hidden lift-card" max={6}>
                <InteractiveImage
                  src={LOOK_2}
                  alt="Close-up — stitching and technical fabric detail"
                  imageClassName="grayscale contrast-125"
                  cursorParallaxRange={16}
                  hoverZoom={true}
                />
              </TiltCard>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-primary">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="md:col-span-8 md:border-r border-primary overflow-hidden group"
          >
            <TiltCard className="relative aspect-[16/9] overflow-hidden lift-card" max={4}>
              <InteractiveImage
                src={LOOK_3}
                alt="Motion study — model in flowing black garments, urban concrete"
                imageClassName="grayscale"
                cursorParallaxRange={12}
                hoverZoom={true}
              />
              <div className="absolute top-0 right-0 p-4 bg-primary text-on-primary text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity font-semibold z-10">
                MOTION / STUDY_02
              </div>
            </TiltCard>
          </motion.div>
          <RevealSection
            stagger={0.12}
            className="md:col-span-4 p-8 flex flex-col justify-end"
            viewportAmount={0.3}
          >
            <RevealParagraph
              text='"GRUMB isn’t for everyone. It’s for the ones who earn the privilege to wear."'
              mode="word"
              stagger={0.035}
              duration={0.6}
              yOffset={16}
              className="text-[14px] text-on-surface-variant italic mb-4 leading-5"
            />
            <RevealLine
              className="w-full h-px bg-primary mb-4"
              origin="left"
              delay={0.2}
              duration={1}
            />
            <RevealHeading
              as="h4"
              text="ARCHIVE_04"
              mode="char"
              clipReveal
              stagger={0.03}
              duration={0.75}
              delay={0.3}
              className="text-2xl font-extrabold tracking-tighter"
              style={{ fontFamily: "Syne, sans-serif" }}
            />
          </RevealSection>
        </div>
      </section>

      {/* Editorial Marquee */}
      <div className="border-t border-primary py-6 md:py-10 overflow-hidden">
        <Marquee
          speed={40}
          direction="right"
          hoverSlowdown={0.15}
          gap="4rem"
          edgeFade
          edgeFadeWidth={100}
        >
          <span
            className="text-[48px] md:text-[80px] lg:text-[100px] leading-none tracking-tighter font-extrabold opacity-[0.06] select-none"
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
          >
            PHANTOM ARCHIVE — COLLECTION 04 — GRUMB STUDIO — VOID CONSTRUCT —
          </span>
        </Marquee>
      </div>

      {/* Product Grid */}
      <section className="border-t border-primary py-16 px-6 md:px-16">
        <RevealSection
          stagger={0.1}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
          viewportAmount={0.15}
        >
          <RevealFadeUp>
            <RevealParagraph
              text="02 / COLLECTION"
              mode="word"
              stagger={0.04}
              duration={0.5}
              yOffset={12}
              className="text-[11px] uppercase tracking-[0.2em] mb-2 text-on-surface-variant font-semibold"
            />
            <RevealHeading
              as="h2"
              text={"SHOP THE\nARCHIVE"}
              mode="line"
              clipReveal
              stagger={0.12}
              duration={0.85}
              className="text-[48px] md:text-[64px] leading-[0.9] tracking-tighter font-extrabold"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
            />
          </RevealFadeUp>
          <RevealFadeUp y={20} duration={0.6}>
            <MagneticButton
              range={15}
              scale={1.05}
              className="border border-primary bg-transparent text-primary glow-white text-[11px] tracking-[0.2em] uppercase font-semibold px-6 py-3.5 hover:bg-black hover:text-white hover:tracking-[0.28em] transition-all duration-300"
            >
              VIEW ALL PIECES →
            </MagneticButton>
          </RevealFadeUp>
        </RevealSection>

        <div className="product-grid">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <RevealSection
        stagger={0.15}
        className="py-16 px-6 md:px-16 flex flex-col items-center text-center"
        viewportAmount={0.25}
      >
        <RevealFadeUp>
          <RevealHeading
            as="h2"
            text="JOIN THE PHANTOM CIRCLE"
            mode="word"
            clipReveal
            stagger={0.06}
            duration={0.85}
            className="mb-8 max-w-4xl tracking-tighter font-extrabold text-[40px] md:text-[80px] leading-[0.9]"
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.05em" }}
          />
        </RevealFadeUp>
        <RevealFadeUp y={30} duration={0.7}>
          <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md">
            <div className="relative group input-accent flex items-center">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="flex-1 min-w-0 bg-transparent border-0 border-b border-primary px-0 py-4 pr-28 text-[11px] tracking-[0.2em] uppercase focus:outline-none focus:ring-0 placeholder:text-outline"
              />
              <motion.button
                type="submit"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute right-0 bottom-1 px-4 py-2 bg-transparent text-primary hover:bg-black hover:text-white glow-white text-[11px] tracking-[0.2em] uppercase font-semibold whitespace-nowrap hover:tracking-[0.28em] transition-all duration-300"
              >
                SUBSCRIBE →
              </motion.button>
            </div>
          </form>
        </RevealFadeUp>
      </RevealSection>

      {/* Footer */}
      <footer className="border-t border-primary py-8 px-6 md:px-16 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
            GRUMB
          </div>
        </div>
        <div className="flex flex-wrap gap-8">
          {["TERMS", "PRIVACY", "ARCHIVE"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[11px] tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors font-semibold link-underline"
            >
              {l}
            </a>
          ))}
          <a
            href="#"
            className="text-[11px] tracking-[0.2em] uppercase text-primary border-b border-primary font-semibold"
          >
            CONTACT
          </a>
        </div>
      </footer>
    </motion.div>
  );
}
