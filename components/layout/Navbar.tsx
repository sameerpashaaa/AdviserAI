"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Product", href: "#compare-features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Research", href: "/research" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__inner">
          {/* Logo */}
          <Link href="/" className="landing-nav__logo" aria-label="Adviser AI Home">
            <Image
              src="/AdviserAI_logo11.png"
              alt="Adviser AI"
              width={1254}
              height={1254}
              priority
              style={{ display: "block", height: 60, width: "auto" }}
            />
          </Link>

          {/* Center nav links — desktop */}
          <ul className="landing-nav__links" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="landing-nav__link"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA group — desktop */}
          <div className="landing-nav__cta">
            <Link href="/dashboard" className="landing-nav__signin">
              Sign In
            </Link>
            <Link href="/dashboard" className="landing-nav__getstarted">
              Get Started <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-nav__hamburger"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`landing-nav__drawer ${mobileOpen ? "landing-nav__drawer--open" : ""}`}>
          <ul role="list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="landing-nav__drawer-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="landing-nav__drawer-cta">
            <Link href="/dashboard" className="landing-nav__signin" style={{ flex: 1, justifyContent: "center" }}>
              Sign In
            </Link>
            <Link href="/dashboard" className="landing-nav__getstarted" style={{ flex: 1, justifyContent: "center" }}>
              Get Started <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress bar — scroll indicator */}
      <div className="landing-nav__progress-track" aria-hidden="true">
        <div
          className="landing-nav__progress-fill"
          style={{ opacity: scrolled ? 1 : 0 }}
        />
      </div>
    </>
  );
}
