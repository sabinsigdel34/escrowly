import React, { useEffect, useState } from "react";
import { LogoMark } from "./LogoMark";

export function LandingNav({ onStart, onAdmin, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onNavClick = () => setOpen(false);

  return (
    <nav className="es-nav" data-reveal>
      <a className="es-logo" href="#top" data-cursor="hover" onClick={onNavClick}>
        <LogoMark />
        <span>ESCROW</span>
        <strong>LY</strong>
      </a>

      <button
        className="es-nav-menu-toggle"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-cursor="hover"
      >
        <span />
        <span />
      </button>

      <div className="es-nav-links" aria-label="Primary">
        <a href="#how" data-cursor="hover" onClick={onNavClick}>
          How It Works
        </a>
        <a href="#features" data-cursor="hover" onClick={onNavClick}>
          Features
        </a>
        <a href="#usecases" data-cursor="hover" onClick={onNavClick}>
          Use Cases
        </a>
        <a href="#contract" data-cursor="hover" onClick={onNavClick}>
          Smart Contract
        </a>
      </div>
      <div className="es-nav-actions">
        <button onClick={toggleTheme} className="es-nav-link-button" data-cursor="hover" aria-label="Toggle theme">
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`} />
        </button>
        <button
          className="es-nav-link-button"
          onClick={() => {
            setOpen(false);
            onAdmin();
          }}
          data-cursor="hover"
        >
          Admin
        </button>
        <button
          className="es-nav-cta"
          onClick={() => {
            setOpen(false);
            onStart();
          }}
          data-cursor="hover"
        >
          Launch App
        </button>
      </div>

      {open ? (
        <div className="es-nav-mobile" role="dialog" aria-label="Menu" onClick={onNavClick}>
          <div className="es-nav-mobile-panel" onClick={(e) => e.stopPropagation()}>
            <a href="#how" data-cursor="hover" onClick={onNavClick}>
              How It Works
            </a>
            <a href="#features" data-cursor="hover" onClick={onNavClick}>
              Features
            </a>
            <a href="#usecases" data-cursor="hover" onClick={onNavClick}>
              Use Cases
            </a>
            <a href="#contract" data-cursor="hover" onClick={onNavClick}>
              Smart Contract
            </a>
            <div className="es-nav-mobile-actions">
              <button onClick={toggleTheme} className="es-btn-outline" data-cursor="hover" type="button">
                Toggle theme
              </button>
              <button
                className="es-btn-primary"
                onClick={() => {
                  setOpen(false);
                  onStart();
                }}
                data-cursor="hover"
                type="button"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

