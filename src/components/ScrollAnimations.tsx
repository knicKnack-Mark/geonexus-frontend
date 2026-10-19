
"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  useEffect(() => {
    // Select elements from the document, not from this component's own DOM.
    const heroElements = gsap.utils.toArray<HTMLElement>(".hero-animate");
    const serviceCards = gsap.utils.toArray<HTMLElement>(".service-card");
    const approachElements =
      gsap.utils.toArray<HTMLElement>(".approach-animate");

    // Avoid creating animations if the page elements are missing.
    if (
      heroElements.length === 0 &&
      serviceCards.length === 0 &&
      approachElements.length === 0
    ) {
      console.warn(
        "GSAP: No animation targets found. Check the classes in app/page.tsx."
      );
      return;
    }

    const ctx = gsap.context(() => {
      if (heroElements.length > 0) {
        gsap.fromTo(
          heroElements,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out",
            clearProps: "all",
          }
        );
      }

      serviceCards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 36, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      if (approachElements.length > 0) {
        gsap.fromTo(
          approachElements,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: approachElements[0],
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}
