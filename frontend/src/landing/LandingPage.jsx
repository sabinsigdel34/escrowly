import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link2, LockKeyhole, Scale, Search } from "lucide-react";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { ContractTerminal } from "./ContractTerminal";
import { LogoMark } from "./LogoMark";
import { FloatingAccent } from "./FloatingAccent";
import { landingImages } from "./images";

gsap.registerPlugin(ScrollTrigger);

function useLandingAnimations(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
      if (prefersReduced) return;

      // Hero: stagger up
      gsap.fromTo(
        "[data-hero-stagger]",
        { y: 16, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
        },
      );

      // Section reveals
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
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Parallax image
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

export function LandingPage({ onStart, onAdmin, theme, toggleTheme }) {
  const rootRef = useRef(null);
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
      [
        "// 01",
        "Freelance Markets",
        "Protect developers, designers, writers, and remote professionals delivering digital work.",
        landingImages.usecases[0],
      ],
      ["// 02", "Gig Economy", "Give clients and workers a direct payment flow with contract-backed release controls.", landingImages.usecases[1]],
      ["// 03", "Online Services", "Secure consulting, SaaS setup, creative services, and other digital transactions.", landingImages.usecases[2]],
      ["// 04", "P2P Sales", "Let strangers transact with more confidence through visible escrowed funds.", landingImages.usecases[3]],
    ],
    [],
  );

  return (
    <div ref={rootRef} id="top">
      <LandingNav onStart={onStart} onAdmin={onAdmin} theme={theme} toggleTheme={toggleTheme} />

      <section className="es-hero">
        <div className="es-hero-grid" />
        <div className="es-hero-glow" />
        <FloatingAccent />
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
        <div className="es-hero-tag" data-hero-stagger>
          // Decentralized Escrow Protocol
        </div>
        <h1 className="es-hero-title" data-hero-stagger>
          ESCROW<span>LY</span>
        </h1>
        <p className="es-hero-desc" data-hero-stagger>
          A blockchain-powered escrow service that holds funds in smart contracts until work is verified. No central authority. No broken promises. Just transparent, automated trust.
        </p>
        <div className="es-hero-actions" data-hero-stagger>
          <button className="es-btn-primary" onClick={onStart} data-cursor="hover">
            Get Started
          </button>
          <a className="es-btn-secondary" href="#how" data-cursor="hover">
            See how it works
          </a>
        </div>
        <div className="es-hero-stats">
          <LandingStat number="100%" label="On-Chain" />
          <LandingStat number="0" label="Middlemen" />
          <LandingStat number="∞" label="Trustless" />
        </div>
      </section>

      <section className="es-section" id="how" data-reveal>
        <div className="es-section-tag">// Protocol Flow</div>
        <h2 className="es-section-title">
          How It
          <span>Works</span>
        </h2>
        <div className="es-steps-grid">
          {steps.map(([number, title, body]) => (
            <div className="es-step" key={number} data-reveal>
              <div className="es-step-num">{number}</div>
              <h3 className="es-step-title">{title}</h3>
              <p className="es-step-desc">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="es-features-section" id="features" data-reveal>
        <div className="es-section-tag">// Core Capabilities</div>
        <h2 className="es-section-title">
          Key
          <span>Features</span>
        </h2>
        <div className="es-features-grid">
          {features.map(([Icon, accent, title, body]) => (
            <div className="es-feature-card" key={title} data-reveal>
              <div className="es-feature-icon" aria-hidden="true">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="es-feature-title">
                <span>{accent}</span> {title}
              </h3>
              <p className="es-feature-desc">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="es-usecases-section" id="usecases" data-reveal>
        <div className="es-section-tag">// Applications</div>
        <h2 className="es-section-title">
          Use
          <span>Cases</span>
        </h2>
        <div className="es-usecases-grid">
          {useCases.map(([number, title, body, imgSrc]) => (
            <div className="es-usecase-card" key={title} data-reveal>
              <div className="es-usecase-thumb" aria-hidden="true">
                <img src={imgSrc} alt="" loading="lazy" decoding="async" sizes="(max-width: 1080px) 100vw, 25vw" />
              </div>
              <div className="es-usecase-num">{number}</div>
              <h3 className="es-usecase-title">{title}</h3>
              <p className="es-usecase-desc">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="es-visual-strip" aria-label="Atmosphere" data-reveal>
        {landingImages.strip.map((img) => (
          <figure className="es-strip-tile" key={img.src} data-reveal>
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" sizes="(max-width: 1080px) 100vw, 33vw" />
            <figcaption>{img.alt}</figcaption>
          </figure>
        ))}
      </section>

      <section className="es-contract-section" id="contract" data-reveal>
        <div>
          <div className="es-section-tag">// Smart Contract</div>
          <h2 className="es-section-title">
            Powered By
            <span>Code</span>
          </h2>
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
      </section>

      <section className="es-cta-section" id="cta" data-reveal>
        <div className="es-section-tag es-centered">// Join the Protocol</div>
        <h2 className="es-section-title">
          Build With
          <span>Trust</span>
        </h2>
        <p className="es-cta-sub">Eliminate payment risk from your deals. Start using Escrowly today: secure, decentralized, and built for digital work.</p>
        <div className="es-cta-buttons">
          <button className="es-btn-primary" onClick={onStart} data-cursor="hover">
            Launch App
          </button>
          <button className="es-btn-outline" onClick={onAdmin} data-cursor="hover">
            Admin Ledger
          </button>
        </div>
      </section>

      <LandingFooter LogoMark={LogoMark} />

      <a
        href="#top"
        className={`es-back-to-top ${showTop ? "is-visible" : ""}`}
        aria-label="Back to top"
        data-cursor="hover"
      >
        ↑
      </a>
    </div>
  );
}

