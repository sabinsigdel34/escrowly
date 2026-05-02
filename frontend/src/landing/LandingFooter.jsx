import React from "react";
import { LogoMark } from "./LogoMark";

export function LandingFooter() {
  return (
    <footer className="es-footer" data-reveal>
      <a className="es-logo" href="#" data-cursor="hover">
        <LogoMark />
        <span>ESCROW</span>
        <strong>LY</strong>
      </a>
      <div className="es-footer-links">
        <a href="#features" data-cursor="hover">
          Features
        </a>
        <a href="#contract" data-cursor="hover">
          Contract
        </a>
        <a href="#cta" data-cursor="hover">
          Launch
        </a>
      </div>
      <div>© 2026 Escrowly. All rights reserved.</div>
    </footer>
  );
}

