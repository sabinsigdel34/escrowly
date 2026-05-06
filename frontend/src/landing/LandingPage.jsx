import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { Link2, LockKeyhole, Scale, Search } from "lucide-react";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { ContractTerminal } from "./ContractTerminal";
import { LogoMark } from "./LogoMark";
import { landingImages } from "./images";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { LottieAnimation } from "../components/ui/LottieAnimation";

gsap.registerPlugin(ScrollTrigger);

// Lazy load heavy 3D scene to reduce initial bundle
const HeroScene = lazy(() => import("./HeroScene"));

function useLandingAnimations(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
      if (prefersReduced) return;

      // Section reveals - works alongside Framer Motion for scroll-triggered effects
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 22, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Parallax hero image
      const heroImage = document.querySelector(".es-hero-image img");
      if (heroImage) {
        gsap.to(heroImage, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".es-hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}

function LandingStat({ number, label }) {
  return (
    <div className="es-landing-stat" data-reveal>
      <div className="es-stat-number">{number}</div>
      <div className="es-stat-label">{label}</div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div data-reveal>
      <div className="es-meta-label">{label}</div>
      <div className="es-meta-value">{value}</div>
    </div>
  );
}

// Card hover wrapper with framer-motion
function HoverCard({ children, className = "", reduceMotion = false, ...props }) {
  return (
    <Card
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -5 }}
      reduceMotion={reduceMotion}
      {...props}
    >
      {children}
    </Card>
  );
}

export function LandingPage({ onStart, onAdmin, theme, toggleTheme }) {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  useLandingAnimations(rootRef);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const steps = useMemo(
    () => [
      ["01", "Deposit", "Client deposits funds into the smart contract. Funds are locked on-chain and visible to all parties."],
      ["02", "Execute", "Service provider completes the agreed work while the escrow keeps payment secured."],
      ["03", "Verify", "Client reviews the delivery and signs the approval from the connected wallet."],
      ["04", "Release", "The smart contract releases funds to the seller and records the settlement permanently."],
    ],
    [],
  );

  const features = useMemo(
    () => [
      [LockKeyhole, "Secure", "Payments", "Funds are locked inside a smart contract. No party can move them until the deal rules are met."],
      [Scale, "Dispute", "Resolution", "Cancellation and refund flows give each party a transparent path when a deal needs review."],
      [Link2, "Decentralized", "Trustless", "The blockchain enforces settlement rules without relying on a central payment holder."],
      [Search, "Full", "Transparency", "Every deal, status change, wallet, and fund movement can be inspected from the dashboard."],
    ],
    [],
  );

  const useCases = useMemo(
    () => [
      ["// 01", "Freelance Markets", "Protect developers, designers, writers, and remote professionals delivering digital work.", landingImages.usecases[0]],
      ["// 02", "Gig Economy", "Give clients and workers a direct payment flow with contract-backed release controls.", landingImages.usecases[1]],
      ["// 03", "Online Services", "Secure consulting, SaaS setup, creative services, and other digital transactions.", landingImages.usecases[2]],
      ["// 04", "P2P Sales", "Let strangers transact with more confidence through visible escrowed funds.", landingImages.usecases[3]],
    ],
    [],
  );

  return (
    <div ref={rootRef} id="top">
      <LandingNav onStart={onStart} onAdmin={onAdmin} theme={theme} toggleTheme={toggleTheme} />

      <section className="es-hero" ref={heroRef}>
        <div className="es-hero-grid" />
        <div className="es-hero-glow" />
        <Suspense fallback={
          <div className="es-hero-scene es-hero-scene-loading" aria-hidden="true" />
        }>
          <HeroScene />
        </Suspense>

        {/* Hero Content */}
        <motion.div
          className="es-hero-content-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="es-hero-image" aria-hidden="true">
            <img
              src={landingImages.hero.src}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              sizes="(max-width: 1080px) 100vw, 50vw"
            />
          </div>

          <motion.div
            className="es-hero-tag"
            data-hero-stagger
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            // Decentralized Escrow Protocol
          </motion.div>
        

          <motion.h1
            className="es-hero-title"
            data-hero-stagger
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="es-glitch-word">
              {"ESCROWLY".split("").map((letter, i) => {
                const isSpecial = letter === "L" || letter === "Y";
                return (
                  <span
                    className="es-glitch-letter"
                    style={{ color: isSpecial ? "#171E2E" : "#C25D36" }}
                    data-letter={letter}
                    key={i}
                  >
                    {letter}
                    <span className="es-spark" style={{ color: isSpecial ? "#171E2E" : "#C25D36" }} />
                    <span className="es-spark" style={{ color: isSpecial ? "#171E2E" : "#C25D36" }} />
                    <span className="es-spark" style={{ color: isSpecial ? "#171E2E" : "#C25D36" }} />
                    <span className="es-spark" style={{ color: isSpecial ? "#171E2E" : "#C25D36" }} />
                  </span>
                );
              })}
            </span>
          </motion.h1>

          <motion.p
            className="es-hero-desc"
            data-hero-stagger
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            A blockchain-powered escrow service that holds funds in smart contracts until work is verified. No central authority. No broken promises. Just transparent, automated trust.
          </motion.p>

          <motion.div
            className="es-hero-actions"
            data-hero-stagger
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <Button className="es-btn-primary" onClick={onStart} reduceMotion={reduceMotion} data-cursor="hover">
              Get Started
            </Button>
            <Button asChild variant="secondary" className="es-btn-secondary-chip" reduceMotion={reduceMotion}>
              <a href="#how" data-cursor="hover">See how it works</a>
            </Button>
          </motion.div>

          <motion.div
            className="es-hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            <LandingStat number="100%" label="On-Chain" />
            <LandingStat number="0" label="Middlemen" />
            <LandingStat number="∞" label="Trustless" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <motion.section
        className="es-section"
        id="how"
        data-reveal
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="es-section-tag">// Protocol Flow</div>
        <motion.h2
          className="es-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How It
          <span>Works</span>
        </motion.h2>
        <div className="es-steps-grid">
          {steps.map(([number, title, body], idx) => (
            <HoverCard key={number} className="es-step" data-reveal reduceMotion={reduceMotion}>
              <div className="es-step-num">{number}</div>
              <h3 className="es-step-title">{title}</h3>
              <p className="es-step-desc">{body}</p>
            </HoverCard>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="es-features-section"
        id="features"
        data-reveal
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="es-section-tag">// Core Capabilities</div>
        <motion.h2
          className="es-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Key
          <span>Features</span>
        </motion.h2>
        <div className="es-features-grid">
          {features.map(([Icon, accent, title, body], idx) => (
            <HoverCard key={title} className="es-feature-card" data-reveal reduceMotion={reduceMotion}>
              <div className="es-feature-icon" aria-hidden="true">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="es-feature-title">
                <span>{accent}</span> {title}
              </h3>
              <p className="es-feature-desc">{body}</p>
            </HoverCard>
          ))}
        </div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="es-usecases-section"
        id="usecases"
        data-reveal
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="es-section-tag">// Applications</div>
        <motion.h2
          className="es-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Use
          <span>Cases</span>
        </motion.h2>
        <div className="es-usecases-grid">
          {useCases.map(([number, title, body, imgSrc], idx) => (
            <HoverCard key={title} className="es-usecase-card" data-reveal reduceMotion={reduceMotion}>
              <div className="es-usecase-thumb" aria-hidden="true">
                <img src={imgSrc} alt="" loading="lazy" decoding="async" sizes="(max-width: 1080px) 100vw, 25vw" />
              </div>
              <div className="es-usecase-num">{number}</div>
              <h3 className="es-usecase-title">{title}</h3>
              <p className="es-usecase-desc">{body}</p>
            </HoverCard>
          ))}
        </div>
      </motion.section>

      {/* Visual Strip */}
      <motion.section
        className="es-visual-strip"
        aria-label="Atmosphere"
        data-reveal
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        {landingImages.strip.map((img) => (
          <motion.figure
            className="es-strip-tile"
            key={img.src}
            data-reveal
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
          >
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" sizes="(max-width: 1080px) 100vw, 33vw" />
            <figcaption>{img.alt}</figcaption>
          </motion.figure>
        ))}
      </motion.section>

      {/* Contract Section */}
      <motion.section
        className="es-contract-section"
        id="contract"
        data-reveal
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div>
          <div className="es-section-tag">// Smart Contract</div>
          <motion.h2
            className="es-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Powered By
            <span>Code</span>
          </motion.h2>
          <div className="es-red-divider" />
          <p className="es-contract-copy">
            Smart contracts are self-executing programs deployed on-chain. They enforce the escrow rules, hold payment, and expose every deal state transparently.
          </p>
          <div className="es-contract-meta">
            <MetaItem label="Network" value="Ethereum" />
            <MetaItem label="Status" value="Verified" />
            <MetaItem label="Gas" value="Optimized" />
          </div>
        </div>
        <ContractTerminal />
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="es-cta-section"
        id="cta"
        data-reveal
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="es-section-tag es-centered">// Join the Protocol</div>
        <motion.h2
          className="es-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Build With
          <span>Trust</span>
        </motion.h2>
        <motion.p
          className="es-cta-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Eliminate payment risk from your deals. Start using Escrowly today: secure, decentralized, and built for digital work.
        </motion.p>
        <motion.div
          className="es-cta-buttons"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button className="es-btn-primary" onClick={onStart} data-cursor="hover" reduceMotion={reduceMotion}>
            Launch App
          </Button>
          <Button className="es-btn-outline" onClick={onAdmin} data-cursor="hover" variant="secondary" reduceMotion={reduceMotion}>
            Admin Ledger
          </Button>
        </motion.div>
      </motion.section>

      <LandingFooter LogoMark={LogoMark} />

      <motion.a
        href="#top"
        className={`es-back-to-top ${showTop ? "is-visible" : ""}`}
        aria-label="Back to top"
        data-cursor="hover"
        initial={{ opacity: 0 }}
        animate={{ opacity: showTop ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ↑
      </motion.a>
    </div>
  );
}
