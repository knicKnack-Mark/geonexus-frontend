
"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navigationLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Projects", href: "#projects" },
  { label: "Metrics", href: "#stats" },
  { label: "Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

export default function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", href);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080d18]/80 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="container-shell mx-auto flex items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6"
      >
        {/* Brand */}
        <a
          href="#home"
          onClick={closeMenu}
          className="relative z-10 shrink-0 text-lg font-semibold tracking-[-0.06em] text-white sm:text-xl"
          aria-label="GeoNexus home"
        >
          GEO<span className="text-[var(--color-neon)]">{ "//" }</span>NEXUS
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-7">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavigation(event, link.href)}
              className="text-xs text-white/60 transition-colors hover:text-[var(--color-neon)] xl:text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ThemeToggle />

          <a
            href="#estimator"
            onClick={(event) => handleNavigation(event, "#estimator")}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-neon)]/30 px-4 py-2.5 text-xs font-medium text-white transition hover:border-[var(--color-neon)] hover:bg-[var(--color-neon)]/10"
          >
            Start a project
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-neon)]" />
          </a>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition hover:border-[var(--color-neon)]/50"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`absolute inset-x-4 top-[calc(100%-0.25rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#101411]/95 shadow-2xl backdrop-blur-xl transition-all duration-200 lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="p-3">
          {navigationLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={(event) => handleNavigation(event, link.href)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-[var(--color-neon)]"
              style={{ transitionDelay: menuOpen ? `${index * 20}ms` : "0ms" }}
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4 opacity-40" />
            </a>
          ))}

          <div className="mt-2 border-t border-white/10 p-2 pt-4">
            <a
              href="#estimator"
              tabIndex={menuOpen ? 0 : -1}
              onClick={(event) => handleNavigation(event, "#estimator")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-neon)] px-4 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
